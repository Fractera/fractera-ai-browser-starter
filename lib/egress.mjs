// ВЫХОД БРАУЗЕРА В СЕТЬ — ТОЛЬКО ЧЕРЕЗ СВОЙ ПРОКСИ, ПО ОДНОМУ НА ССЫЛКУ (шаг 196-3).
//
// ✗ ЧЕМ ОПЛАЧЕНО. Первая редакция запрета стояла только на `context.route`. Прибор 196-3 измерил на сервере: разрешённый
// адрес `http://httpbin.org/redirect-to?url=http://127.0.0.1:<порт>/…` ДОШЁЛ до слушателя на петле — в Firefox `route` не
// видит запрос, в который браузер уходит по перенаправлению. Защита, которую обходит один `302`, защитой не была.
// 🔒 ПОЭТОМУ ПРОВЕРКА ПЕРЕЕХАЛА ТУДА, МИМО ЧЕГО БРАУЗЕР ПРОЙТИ НЕ МОЖЕТ: каждый контекст открывается с `proxy`, указывающим
// сюда. Сюда приходит ВСЁ — документ, перенаправление, фрейм, картинка, `fetch`, сокет, запросы сервис-воркера.
// 🔒 ПРОКСИ САМ РАЗРЕШАЕТ ИМЯ И СОЕДИНЯЕТСЯ С УЖЕ ПРОВЕРЕННЫМ IP, а не с именем. Так закрыт и предел, названный в
// `guard.mjs`: имя с нулевым TTL не может сменить адрес между проверкой и соединением — второго разрешения нет.
// 🔒 HTTPS ПРОХОДИТ ТУННЕЛЕМ `CONNECT` НАСКВОЗЬ: шифрование между браузером и сайтом прокси не вскрывает, отпечаток TLS
// остаётся отпечатком Camoufox — ради него движок и выбран.
// 🔒 ПО ПРОКСИ НА ССЫЛКУ, А НЕ ОДИН НА СЛУЖБУ: отказы пишутся в список именно этой ссылки, и зовущий видит, что хотела
// достать её страница. Прокси на петле со случайным портом стоит миллисекунды.
// 🛑 ОТКАЗ — ОТВЕТОМ 403 С ПРИЧИНОЙ, А НЕ ОБРЫВОМ: оборванный фрейм в Firefox способен не дать странице `load` вовсе.

import { lookup } from "node:dns/promises"
import { createServer, request as httpRequest } from "node:http"
import { connect, isIP } from "node:net"
import { isForbiddenAddress } from "./guard.mjs"

const MAX_NOTED = 50

/** Разрешить имя и выбрать адрес. Запрещён хоть один адрес имени — запрещено имя целиком. */
async function resolveAllowed(host) {
  const h = String(host).toLowerCase().replace(/^\[|\]$/g, "")
  if (!h) return { why: "empty-host" }
  if (isIP(h)) return isForbiddenAddress(h) ? { why: `forbidden-address ${h}` } : { address: h }
  let list
  try {
    list = await lookup(h, { all: true })
  } catch (e) {
    return { unresolved: true, why: `unresolved ${h} ${e.code ?? ""}`.trim() }
  }
  if (!list.length) return { unresolved: true, why: `unresolved ${h}` }
  const bad = list.find((a) => isForbiddenAddress(a.address))
  if (bad) return { why: `forbidden-address ${h} → ${bad.address}` }
  return { address: list[0].address }
}

/** `host:port` из строки `CONNECT`, включая `[::1]:443`. */
function splitHostPort(target) {
  const m = String(target).match(/^\[([^\]]+)\]:(\d+)$/) ?? String(target).match(/^([^:]+):(\d+)$/)
  return m ? { host: m[1], port: Number(m[2]) } : { host: String(target), port: 443 }
}

/**
 * Поднять прокси на петле для одной ссылки.
 * @returns {Promise<{ port: number, refused: {items: object[], total: number}, close: () => void }>}
 */
export async function startEgress() {
  const refused = { items: [], total: 0 }
  const note = (type, url, why) => {
    refused.total += 1
    if (refused.items.length < MAX_NOTED) refused.items.push({ main: false, type, url: String(url).slice(0, 300), why })
  }
  const deny = (why, unresolved) => `HTTP/1.1 ${unresolved ? 502 : 403} ${unresolved ? "Bad Gateway" : "Forbidden"}\r\ncontent-type: text/plain\r\ncontent-length: ${Buffer.byteLength(why)}\r\nconnection: close\r\n\r\n${why}`
  const sockets = new Set()
  const track = (s) => {
    sockets.add(s)
    s.on("close", () => sockets.delete(s))
    s.on("error", () => s.destroy())
  }

  // ── обычный HTTP: браузер присылает полный адрес в строке запроса ──────────────────────────────────────────────────
  const server = createServer(async (req, res) => {
    let u
    try {
      u = new URL(req.url)
    } catch {
      res.writeHead(400, { "content-type": "text/plain" })
      return res.end("bad proxy request")
    }
    const r = await resolveAllowed(u.hostname)
    if (!r.address) {
      if (!r.unresolved) note("proxy-http", u.href, r.why)
      res.writeHead(r.unresolved ? 502 : 403, { "content-type": "text/plain" })
      return res.end(`blocked: ${r.why}`)
    }
    const headers = { ...req.headers }
    delete headers["proxy-connection"]
    delete headers["proxy-authorization"]
    const up = httpRequest(
      { headers, host: r.address, method: req.method, path: `${u.pathname}${u.search}`, port: Number(u.port) || 80, setHost: false },
      (upRes) => {
        res.writeHead(upRes.statusCode ?? 502, upRes.rawHeaders)
        upRes.pipe(res)
      },
    )
    up.on("error", () => {
      if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" })
      res.end()
    })
    req.pipe(up)
  })

  // ── HTTPS и WSS: туннель `CONNECT` к проверенному адресу ───────────────────────────────────────────────────────────
  server.on("connect", async (req, client, head) => {
    track(client)
    const { host, port } = splitHostPort(req.url)
    const r = await resolveAllowed(host)
    if (!r.address) {
      if (!r.unresolved) note("proxy-connect", req.url, r.why)
      return client.end(deny(r.why, r.unresolved))
    }
    const up = connect(port, r.address, () => {
      client.write("HTTP/1.1 200 Connection Established\r\n\r\n")
      if (head?.length) up.write(head)
      up.pipe(client)
      client.pipe(up)
    })
    track(up)
    up.on("close", () => client.destroy())
    client.on("close", () => up.destroy())
  })

  // ── WS без TLS: полный адрес и `Upgrade` в строке запроса ──────────────────────────────────────────────────────────
  server.on("upgrade", async (req, client, head) => {
    track(client)
    let u
    try {
      u = new URL(req.url)
    } catch {
      return client.destroy()
    }
    const r = await resolveAllowed(u.hostname)
    if (!r.address) {
      if (!r.unresolved) note("proxy-websocket", u.href, r.why)
      return client.end(deny(r.why, r.unresolved))
    }
    const up = connect(Number(u.port) || 80, r.address, () => {
      const lines = [`${req.method} ${u.pathname}${u.search} HTTP/1.1`]
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        if (/^proxy-/i.test(req.rawHeaders[i])) continue
        lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`)
      }
      up.write(`${lines.join("\r\n")}\r\n\r\n`)
      if (head?.length) up.write(head)
      up.pipe(client)
      client.pipe(up)
    })
    track(up)
    up.on("close", () => client.destroy())
    client.on("close", () => up.destroy())
  })

  server.on("connection", track)
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  return {
    close: () => {
      for (const s of sockets) s.destroy()
      server.close()
    },
    port: server.address().port,
    refused,
  }
}
