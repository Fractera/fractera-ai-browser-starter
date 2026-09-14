// ВЫХОД БРАУЗЕРА В СЕТЬ — ТОЛЬКО ЧЕРЕЗ СВОЙ ПРОКСИ, ПО ОДНОМУ НА ССЫЛКУ (шаг 196-3).
//
// ✗ ЧЕМ ОПЛАЧЕНО. Первая редакция запрета стояла только на `context.route`. Прибор 196-3 измерил на сервере: разрешённый
// адрес `http://httpbin.org/redirect-to?url=http://127.0.0.1:<порт>/…` ДОШЁЛ до слушателя на петле — в Firefox `route` не
// видит запрос, в который браузер уходит по перенаправлению. Защита, которую обходит один `302`, защитой не была.
// 🔒 ПОЭТОМУ ПРОВЕРКА ПЕРЕЕХАЛА ТУДА, МИМО ЧЕГО БРАУЗЕР ПРОЙТИ НЕ МОЖЕТ: каждый контекст открывается с `proxy`, указывающим
// сюда. Сюда приходит ВСЁ — документ, перенаправление, фрейм, картинка, `fetch`, сокет, запросы сервис-воркера.
// 🛑 И ЭТОГО ОДНОГО НЕ ХВАТИЛО, ИЗМЕРЕНО ВТОРЫМ ПРОГОНОМ: Firefox ходит на loopback мимо прокси. Закрыто настройкой
// `network.proxy.allow_hijacking_localhost` при запуске движка (`engine/launch.py`) — третий прогон: 0 обращений.
// 🔒 ПРОКСИ САМ РАЗРЕШАЕТ ИМЯ И СОЕДИНЯЕТСЯ С УЖЕ ПРОВЕРЕННЫМ IP, а не с именем. Так закрыт и предел, названный в
// `guard.mjs`: имя с нулевым TTL не может сменить адрес между проверкой и соединением — второго разрешения нет.
// 🔒 HTTPS ПРОХОДИТ ТУННЕЛЕМ `CONNECT` НАСКВОЗЬ: шифрование между браузером и сайтом прокси не вскрывает, отпечаток TLS
// остаётся отпечатком Camoufox — ради него движок и выбран.
// 🔒 ПО ПРОКСИ НА ССЫЛКУ, А НЕ ОДИН НА СЛУЖБУ: отказы пишутся в список именно этой ссылки, и зовущий видит, что хотела
// достать её страница. Прокси на петле со случайным портом стоит миллисекунды.
// 🛑 ОТКАЗ — ОТВЕТОМ 403 С ПРИЧИНОЙ, А НЕ ОБРЫВОМ: оборванный фрейм в Firefox способен не дать странице `load` вовсе.
// 🔒 ЖУРНАЛ СОЕДИНЕНИЙ (`log`) ОТДАЁТСЯ ВМЕСТЕ С ОТКАЗОМ СТРАНИЦЫ: «не открылась за 60 с» без того, куда ходил браузер и
// чем кончилось каждое соединение, причины не называет.

import { createServer, request as httpRequest } from "node:http"
import { connect } from "node:net"
import { resolveAllowed } from "./guard.mjs"

const MAX_NOTED = 50
const MAX_LOG = 120
const CONNECT_TIMEOUT_MS = 10_000

/** Соединиться с первым отвечающим из проверенных адресов: адрес, который не отвечает, не должен съедать страницу. */
function connectAny(addresses, port, onReady) {
  return new Promise((resolve) => {
    let i = 0
    const attempt = () => {
      if (i >= addresses.length) return resolve(null)
      const s = connect({ host: addresses[i++], port, timeout: CONNECT_TIMEOUT_MS })
      const fail = () => {
        s.destroy()
        attempt()
      }
      s.once("timeout", fail)
      s.once("error", fail)
      s.once("connect", () => {
        s.removeListener("timeout", fail)
        s.removeListener("error", fail)
        s.setTimeout(0)
        onReady(s)
        resolve(s)
      })
    }
    attempt()
  })
}

/** `host:port` из строки `CONNECT`, включая `[::1]:443`. */
function splitHostPort(target) {
  const m = String(target).match(/^\[([^\]]+)\]:(\d+)$/) ?? String(target).match(/^([^:]+):(\d+)$/)
  return m ? { host: m[1], port: Number(m[2]) } : { host: String(target), port: 443 }
}

/**
 * Поднять прокси на петле для одной ссылки.
 * @returns {Promise<{ port: number, refused: {items: object[], total: number}, log: object[], close: () => void }>}
 */
export async function startEgress() {
  const refused = { items: [], total: 0 }
  const log = []
  const note = (type, url, why) => {
    refused.total += 1
    if (refused.items.length < MAX_NOTED) refused.items.push({ main: false, type, url: String(url).slice(0, 300), why })
  }
  const record = (kind, target, outcome, t0) => {
    if (log.length < MAX_LOG) log.push({ kind, ms: Date.now() - t0, outcome, target: String(target).slice(0, 120) })
  }
  const deny = (why, unresolved) =>
    `HTTP/1.1 ${unresolved ? 502 : 403} ${unresolved ? "Bad Gateway" : "Forbidden"}\r\ncontent-type: text/plain\r\ncontent-length: ${Buffer.byteLength(why)}\r\nconnection: close\r\n\r\n${why}`
  const sockets = new Set()
  const track = (s) => {
    sockets.add(s)
    s.on("close", () => sockets.delete(s))
    s.on("error", () => s.destroy())
  }

  // ── обычный HTTP: браузер присылает полный адрес в строке запроса ──────────────────────────────────────────────────
  const server = createServer(async (req, res) => {
    const t0 = Date.now()
    record("http", req.url, "begin", t0)
    let u
    try {
      u = new URL(req.url)
    } catch {
      res.writeHead(400, { "content-type": "text/plain" })
      return res.end("bad proxy request")
    }
    const r = await resolveAllowed(u.hostname)
    if (!r.addresses) {
      if (!r.unresolved) note("proxy-http", u.href, r.why)
      record("http", u.href, r.why, t0)
      res.writeHead(r.unresolved ? 502 : 403, { "content-type": "text/plain" })
      return res.end(`blocked: ${r.why}`)
    }
    const headers = { ...req.headers }
    delete headers["proxy-connection"]
    delete headers["proxy-authorization"]
    const up = httpRequest(
      { headers, host: r.addresses[0], method: req.method, path: `${u.pathname}${u.search}`, port: Number(u.port) || 80, setHost: false, timeout: CONNECT_TIMEOUT_MS },
      (upRes) => {
        record("http", u.href, `status ${upRes.statusCode}`, t0)
        res.writeHead(upRes.statusCode ?? 502, upRes.rawHeaders)
        upRes.pipe(res)
      },
    )
    const fail = (why) => {
      record("http", u.href, `error ${why}`, t0)
      if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" })
      res.end()
    }
    up.on("timeout", () => {
      up.destroy()
      fail("timeout")
    })
    up.on("error", (e) => fail(e.code ?? e.message))
    req.pipe(up)
  })

  // ── HTTPS и WSS: туннель `CONNECT` к проверенному адресу ───────────────────────────────────────────────────────────
  server.on("connect", async (req, client, head) => {
    const t0 = Date.now()
    // Начало пишется сразу: соединение, которое повисло, иначе в журнал не попало бы вовсе.
    record("connect", req.url, "begin", t0)
    track(client)
    const { host, port } = splitHostPort(req.url)
    const r = await resolveAllowed(host)
    if (!r.addresses) {
      if (!r.unresolved) note("proxy-connect", req.url, r.why)
      record("connect", req.url, r.why, t0)
      return client.end(deny(r.why, r.unresolved))
    }
    const up = await connectAny(r.addresses, port, (s) => {
      track(s)
      client.write("HTTP/1.1 200 Connection Established\r\n\r\n")
      if (head?.length) s.write(head)
      s.pipe(client)
      client.pipe(s)
      s.on("close", () => client.destroy())
      client.on("close", () => s.destroy())
    })
    record("connect", req.url, up ? `tunnel ${up.remoteAddress}` : "unreachable", t0)
    if (!up) client.end(deny(`unreachable ${req.url}`, true))
  })

  // ── WS без TLS: полный адрес и `Upgrade` в строке запроса ──────────────────────────────────────────────────────────
  server.on("upgrade", async (req, client, head) => {
    const t0 = Date.now()
    track(client)
    let u
    try {
      u = new URL(req.url)
    } catch {
      return client.destroy()
    }
    const r = await resolveAllowed(u.hostname)
    if (!r.addresses) {
      if (!r.unresolved) note("proxy-websocket", u.href, r.why)
      record("upgrade", u.href, r.why, t0)
      return client.end(deny(r.why, r.unresolved))
    }
    const up = await connectAny(r.addresses, Number(u.port) || 80, (s) => {
      track(s)
      const lines = [`${req.method} ${u.pathname}${u.search} HTTP/1.1`]
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        if (/^proxy-/i.test(req.rawHeaders[i])) continue
        lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`)
      }
      s.write(`${lines.join("\r\n")}\r\n\r\n`)
      if (head?.length) s.write(head)
      s.pipe(client)
      client.pipe(s)
      s.on("close", () => client.destroy())
      client.on("close", () => s.destroy())
    })
    record("upgrade", u.href, up ? "tunnel" : "unreachable", t0)
    if (!up) client.end(deny(`unreachable ${u.host}`, true))
  })

  server.on("connection", track)
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  return {
    close: () => {
      for (const s of sockets) s.destroy()
      server.close()
    },
    log,
    port: server.address().port,
    refused,
  }
}
