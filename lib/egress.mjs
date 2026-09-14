// ВЫХОД БРАУЗЕРА В СЕТЬ — ТОЛЬКО ЧЕРЕЗ СВОЙ ПРОКСИ (шаги 196-3, 196-8).
//
// ✗ ЧЕМ ОПЛАЧЕНО. Первая редакция запрета стояла только на `context.route`. Прибор 196-3 измерил на сервере: разрешённый
// адрес `http://httpbin.org/redirect-to?url=http://127.0.0.1:<порт>/…` ДОШЁЛ до слушателя на петле — в Firefox `route` не
// видит запрос, в который браузер уходит по перенаправлению. Защита, которую обходит один `302`, защитой не была.
// 🔒 ПОЭТОМУ ПРОВЕРКА ПЕРЕЕХАЛА ТУДА, МИМО ЧЕГО БРАУЗЕР ПРОЙТИ НЕ МОЖЕТ: каждый контекст открывается с `proxy`, указывающим
// сюда. Сюда приходит ВСЁ — документ, перенаправление, фрейм, картинка, `fetch`, сокет, запросы сервис-воркера.
// 🛑 И ЭТОГО ОДНОГО НЕ ХВАТИЛО, ИЗМЕРЕНО ВТОРЫМ ПРОГОНОМ: Firefox ходит на loopback мимо прокси. Закрыто настройкой
// `network.proxy.allow_hijacking_localhost` при запуске движка (`engine/launch.py`) — третий прогон: 0 обращений.
// 🔒 ПРОКСИ САМ РАЗРЕШАЕТ ИМЯ И СОЕДИНЯЕТСЯ С УЖЕ ПРОВЕРЕННЫМ IP, а не с именем: второго разрешения имени нет.
// 🔒 HTTPS ПРОХОДИТ ТУННЕЛЕМ `CONNECT` НАСКВОЗЬ: шифрование прокси не вскрывает, отпечаток TLS остаётся отпечатком Camoufox.
// 🛑 ОТКАЗ — ОТВЕТОМ 403 С ПРИЧИНОЙ, А НЕ ОБРЫВОМ: оборванный фрейм в Firefox способен не дать странице `load` вовсе.
// 🔒 ЖУРНАЛ СОЕДИНЕНИЙ (`log`) ОТДАЁТСЯ ВМЕСТЕ С ОТКАЗОМ СТРАНИЦЫ; начало пишется сразу — повисшее соединение тоже видно.
//
// 🔒 ДВА РЕЖИМА (196-8), И ВЫБИРАЕТ ИХ ИЗМЕРЕНИЕ, А НЕ ВКУС. Воспроизведение 2026-09-14: после двух пакетов тяжёлых страниц
// браузер перестал открывать что-либо, а родитель Camoufox в простое держал 37 % CPU. Гипотеза — Firefox продолжает стучаться
// в уже закрытые порты прокси ссылок. Поэтому:
//   `startEgress()` — прокси на ссылку (прежний режим): свой порт, закрывается вместе со ссылкой;
//   `sharedEgress(id)` — ОДИН постоянный прокси на весь движок, порт не закрывается никогда; ссылка входит в него под своим
//   именем (`Proxy-Authorization: Basic`), и отвергнутое по-прежнему пишется в список именно этой ссылки. Без имени — 407.

import { createServer, request as httpRequest } from "node:http"
import { connect } from "node:net"
import { resolveAllowed } from "./guard.mjs"

const MAX_NOTED = 50
const MAX_LOG = 120
const CONNECT_TIMEOUT_MS = 10_000
const REALM = 'Basic realm="ai-browser"'

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

/** Учёт одной ссылки: что отвергнуто и журнал соединений. */
function newEntry() {
  return { log: [], refused: { items: [], total: 0 } }
}

function note(entry, type, url, why) {
  entry.refused.total += 1
  if (entry.refused.items.length < MAX_NOTED) entry.refused.items.push({ main: false, type, url: String(url).slice(0, 300), why })
}

function record(entry, kind, target, outcome, t0) {
  if (entry.log.length < MAX_LOG) entry.log.push({ kind, ms: Date.now() - t0, outcome, target: String(target).slice(0, 120) })
}

const deny = (why, unresolved) =>
  `HTTP/1.1 ${unresolved ? 502 : 403} ${unresolved ? "Bad Gateway" : "Forbidden"}\r\ncontent-type: text/plain\r\ncontent-length: ${Buffer.byteLength(why)}\r\nconnection: close\r\n\r\n${why}`

const challenge = `HTTP/1.1 407 Proxy Authentication Required\r\nproxy-authenticate: ${REALM}\r\ncontent-length: 0\r\nconnection: close\r\n\r\n`

/**
 * Поднять прокси на петле. `pick(req)` выбирает учёт ссылки; `null` — ссылка не назвалась, ответ 407.
 * @returns {Promise<{ port: number, close: () => void }>}
 */
async function makeProxy(pick) {
  const sockets = new Set()
  const track = (s) => {
    sockets.add(s)
    s.on("close", () => sockets.delete(s))
    s.on("error", () => s.destroy())
  }

  // ── обычный HTTP: браузер присылает полный адрес в строке запроса ──────────────────────────────────────────────────
  const server = createServer(async (req, res) => {
    const entry = pick(req)
    if (!entry) {
      res.writeHead(407, { "content-length": "0", "proxy-authenticate": REALM })
      return res.end()
    }
    const t0 = Date.now()
    record(entry, "http", req.url, "begin", t0)
    let u
    try {
      u = new URL(req.url)
    } catch {
      res.writeHead(400, { "content-type": "text/plain" })
      return res.end("bad proxy request")
    }
    const r = await resolveAllowed(u.hostname)
    if (!r.addresses) {
      if (!r.unresolved) note(entry, "proxy-http", u.href, r.why)
      record(entry, "http", u.href, r.why, t0)
      res.writeHead(r.unresolved ? 502 : 403, { "content-type": "text/plain" })
      return res.end(`blocked: ${r.why}`)
    }
    const headers = { ...req.headers }
    delete headers["proxy-connection"]
    delete headers["proxy-authorization"]
    const up = httpRequest(
      { headers, host: r.addresses[0], method: req.method, path: `${u.pathname}${u.search}`, port: Number(u.port) || 80, setHost: false, timeout: CONNECT_TIMEOUT_MS },
      (upRes) => {
        record(entry, "http", u.href, `status ${upRes.statusCode}`, t0)
        res.writeHead(upRes.statusCode ?? 502, upRes.rawHeaders)
        upRes.pipe(res)
      },
    )
    const fail = (why) => {
      record(entry, "http", u.href, `error ${why}`, t0)
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
    track(client)
    const entry = pick(req)
    if (!entry) return client.end(challenge)
    const t0 = Date.now()
    record(entry, "connect", req.url, "begin", t0)
    const { host, port } = splitHostPort(req.url)
    const r = await resolveAllowed(host)
    if (!r.addresses) {
      if (!r.unresolved) note(entry, "proxy-connect", req.url, r.why)
      record(entry, "connect", req.url, r.why, t0)
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
    record(entry, "connect", req.url, up ? `tunnel ${up.remoteAddress}` : "unreachable", t0)
    if (!up) client.end(deny(`unreachable ${req.url}`, true))
  })

  // ── WS без TLS: полный адрес и `Upgrade` в строке запроса ──────────────────────────────────────────────────────────
  server.on("upgrade", async (req, client, head) => {
    track(client)
    const entry = pick(req)
    if (!entry) return client.end(challenge)
    const t0 = Date.now()
    let u
    try {
      u = new URL(req.url)
    } catch {
      return client.destroy()
    }
    const r = await resolveAllowed(u.hostname)
    if (!r.addresses) {
      if (!r.unresolved) note(entry, "proxy-websocket", u.href, r.why)
      record(entry, "upgrade", u.href, r.why, t0)
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
    record(entry, "upgrade", u.href, up ? "tunnel" : "unreachable", t0)
    if (!up) client.end(deny(`unreachable ${u.host}`, true))
  })

  server.on("connection", track)
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  return {
    close: () => {
      for (const s of sockets) s.destroy()
      server.close()
    },
    port: server.address().port,
  }
}

/**
 * Режим «прокси на ссылку»: свой порт, закрывается вместе со ссылкой.
 * @returns {Promise<{ port: number, refused: {items: object[], total: number}, log: object[], close: () => void }>}
 */
export async function startEgress() {
  const entry = newEntry()
  const proxy = await makeProxy(() => entry)
  return { close: proxy.close, log: entry.log, port: proxy.port, refused: entry.refused }
}

// ── режим «один постоянный прокси» ────────────────────────────────────────────────────────────────────────────────────
const registry = new Map()
let shared = null

function userOf(req) {
  const h = String(req.headers["proxy-authorization"] ?? "")
  const m = h.match(/^Basic\s+(.+)$/i)
  if (!m) return null
  try {
    return Buffer.from(m[1], "base64").toString("utf8").split(":")[0] || null
  } catch {
    return null
  }
}

/**
 * Режим «один постоянный прокси»: порт общий и не закрывается; ссылка называет себя именем пользователя прокси.
 * @param {string} id — имя ссылки, уникальное на время её жизни
 * @returns {Promise<{ port: number, username: string, password: string, refused: object, log: object[], close: () => void }>}
 */
export async function sharedEgress(id) {
  if (!shared) shared = makeProxy((req) => registry.get(userOf(req)) ?? null)
  const proxy = await shared
  const entry = newEntry()
  registry.set(id, entry)
  // 🔒 ЗАКРЫВАЕТСЯ УЧЁТ ССЫЛКИ, А НЕ ПОРТ: в этом и смысл режима. Запоздавший запрос закрытой ссылки получит 407, а не
  // «соединение отвергнуто» — Firefox не увидит мёртвого прокси.
  return { close: () => registry.delete(id), log: entry.log, password: "ai-browser", port: proxy.port, refused: entry.refused, username: id }
}
