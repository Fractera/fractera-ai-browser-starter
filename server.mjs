// СЛУЖБА ИИ-БРАУЗЕРА FRACTERA — NEXT РЯДОМ С ДОГОВОРОМ, ДВИЖОК CAMOUFOX ДОЧЕРНИМ ПРОЦЕССОМ (шаг 196-2).
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-13: «ты не будешь создавать все то же самое а полностью скопируешь memory и уберешь лишнее».
// Этот файл — `server.mjs` службы памяти с убранным: глаголы, объекты, каталог таблиц, терминал `/pty`, подписки моделей.
// Осталось то же устройство: договор `/v1/*` обслуживается здесь и до Next не доходит; страницы отдаёт Next.
//
// 🔒 ПРИРОДА ЗАМКОВ РАЗНАЯ (закон памяти 178-2): `/v1/*` зовут ПРОЦЕССЫ — у них секрет машины или ключ службы; страницы
// открывает ЧЕЛОВЕК — у него куки. Замок стоит только на `/v1/*`, кроме `health`.
// 🔒 ДВА КЛЮЧА (закон памяти 185): секрет машины `DATA_SECRET` — своим процессам; ключ службы — чужим инструментам,
// отзывается одной сменой и касается только браузера.
// 🔒 ДВИЖОК НЕ ПОДНЯТ — ОТКАЗ СРАЗУ (503 `engine-unreachable`): зовущий не висит на сломанном браузере.

import { createServer } from "node:http"
import { readFileSync } from "node:fs"
import next from "next"
import { contract, CONTRACT_VERSION, SERVICE } from "./contract.mjs"
import { keyMatches } from "./lib/api-key.mjs"
import { bootEngine, engineState, endpoint } from "./lib/engine.mjs"
import { LIMITS, MODES, queueState, readPages } from "./lib/browser.mjs"
import { readYouTube, youtubeId } from "./lib/youtube.mjs"

const PORT = Number(process.env.PORT ?? 3800)
const HOST = process.env.AI_BROWSER_HOST ?? "127.0.0.1"
const MACHINE_ENV = process.env.FRACTERA_MACHINE_ENV ?? "/etc/fractera/secrets.env"
const STARTED_AT = new Date().toISOString()
const MAX_BODY = 1_000_000

function machineEnv(name) {
  try {
    for (const line of readFileSync(MACHINE_ENV, "utf8").split("\n")) {
      const i = line.indexOf("=")
      if (i > 0 && line.slice(0, i).trim() === name) return line.slice(i + 1).trim().replace(/^["']|["']$/g, "")
    }
  } catch { /* вне сервера файла нет — законно */ }
  return ""
}
const SECRET = process.env.DATA_SECRET || machineEnv("DATA_SECRET")

function send(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(text),
    "content-type": "application/json; charset=utf-8",
  })
  res.end(text)
}

/** Замок договора: ключ службы (заголовок или Bearer) или секрет машины. `health` открыт. */
function allowed(req, path) {
  if (path === "/v1/health") return true
  const bearer = String(req.headers.authorization ?? "").replace(/^Bearer\s+/i, "")
  if (keyMatches(req.headers["x-ai-browser-key"]) || keyMatches(bearer)) return true
  if (!SECRET) return false
  return req.headers["x-data-secret"] === SECRET
}

/** Тело запроса. Кривой JSON — законный отказ, а не падение службы. */
function readBody(req) {
  return new Promise((resolve) => {
    let raw = ""
    req.on("data", (d) => {
      raw += d
      if (raw.length > MAX_BODY) req.destroy()
    })
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"))
      } catch {
        resolve(null)
      }
    })
    req.on("error", () => resolve(null))
  })
}

const dev = process.env.NODE_ENV === "development"
const app = next({ dev, hostname: HOST, port: PORT })
const handle = app.getRequestHandler()
await app.prepare()

const server = createServer(async (req, res) => {
  const path = new URL(req.url ?? "/", "http://x").pathname

  if (!path.startsWith("/v1/")) return handle(req, res)

  if (!allowed(req, path)) return send(res, 401, { error: "no-access", ok: false })

  if (req.method === "GET" && path === "/v1/health") {
    const e = engineState()
    return send(res, 200, {
      engine: { lastError: e.lastError, modes: MODES, queue: queueState(), restarts: e.restarts, startedAt: e.startedAt, status: e.status },
      ok: true,
      service: SERVICE,
      startedAt: STARTED_AT,
      version: CONTRACT_VERSION,
    })
  }

  if (req.method === "GET" && path === "/v1/contract") return send(res, 200, { ...contract(), ok: true })

  if (req.method === "POST" && path === "/v1/read") {
    const body = await readBody(req)
    if (!body) return send(res, 400, { error: "bad-json", ok: false })
    const urls = Array.isArray(body.urls) ? body.urls.filter((u) => typeof u === "string" && u.trim()).map((u) => u.trim()) : []
    if (!urls.length) return send(res, 400, { error: "no-urls", ok: false })
    // 🔒 196-3: ПРЕДЕЛ ОТКАЗЫВАЕТ ЦЕЛИКОМ И НАЗЫВАЕТ ЧИСЛО. Молча взять первые десять значило бы потерять остальные так,
    // что зовущий об этом не узнал бы.
    if (urls.length > LIMITS.urls) return send(res, 400, { error: "too-many-urls", limit: LIMITS.urls, ok: false })
    if (!endpoint()) return send(res, 503, { engine: engineState().status, error: "engine-unreachable", ok: false })
    const results = await readPages(urls)
    // 🔒 `ok` — ВЫЗОВ ОБРАБОТАН; ОТКАЗ ОДНОЙ ССЫЛКИ — ЕЁ ПОЛЕ `error`, А СЧЁТ — `failed`. Иначе одна битая ссылка из десяти
    // объявляла бы неудачей девять открытых.
    return send(res, 200, { failed: results.filter((r) => r.error).length, limits: LIMITS, ok: true, results })
  }

  if (req.method === "POST" && path === "/v1/youtube") {
    const body = await readBody(req)
    if (!body) return send(res, 400, { error: "bad-json", ok: false })
    const url = typeof body.url === "string" ? body.url.trim() : ""
    if (!url) return send(res, 400, { error: "no-url", ok: false })
    // 🔒 196-4: НЕ-YOUTUBE ОТКАЗЫВАЕТ ДО БРАУЗЕРА — метод говорит, чем он не является, а не открывает что попало.
    if (!youtubeId(url)) return send(res, 400, { error: "not-youtube", ok: false, url })
    if (!endpoint()) return send(res, 503, { engine: engineState().status, error: "engine-unreachable", ok: false })
    const lang = typeof body.lang === "string" && /^[a-zA-Z-]{2,12}$/.test(body.lang) ? body.lang : undefined
    const result = await readYouTube(url, lang)
    // 🔒 НЕТ СУБТИТРОВ — УСПЕХ С `transcript: null` И `why`; НЕТ РОЛИКА ИЛИ СТРАНИЦЫ — ОТКАЗ С КОДОМ. Пустой успех на
    // несуществующий ролик читался бы как «ролик есть, просто молчит».
    const status = !result.error ? 200 : ["url-forbidden", "url-invalid"].includes(result.error) ? 400 : ["video-unavailable", "youtube-bot-check", "consent-wall", "no-player-data"].includes(result.error) ? 422 : 502
    return send(res, status, { ok: !result.error, ...result })
  }

  return send(res, 404, { error: "not-built", ok: false })
})

bootEngine()
server.listen(PORT, HOST, () => {
  console.log(`${SERVICE} ${CONTRACT_VERSION} слушает http://${HOST}:${PORT}`)
})
