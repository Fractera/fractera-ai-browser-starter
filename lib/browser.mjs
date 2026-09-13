// ЧТЕНИЕ СТРАНИЦЫ НАСТОЯЩИМ БРАУЗЕРОМ (шаг 196-2).
//
// 🔒 ПОДКЛЮЧЕНИЕ ДЕРЖИТСЯ, А НЕ ОТКРЫВАЕТСЯ НА КАЖДЫЙ ВЫЗОВ: замер 196-1 — первое открытие 8 с, следующие ≈ 2 с. Движок
// перезапустился — адрес сменился, и подключение пересоздаётся.
// 🔒 КАЖДЫЙ ВЫЗОВ — СВОЙ КОНТЕКСТ: куки и хранилище одной страницы не достаются следующей.
// 🔒 «ДОЖДАТЬСЯ ЗАГРУЗКИ» ДВУХСТУПЕНЧАТО: `load` обязателен, тишина сети — не дольше `IDLE_MS`. Страницы с вечными
// запросами (аналитика, чаты) иначе не дают ответа никогда.

import { firefox } from "playwright-core"
import { endpoint } from "./engine.mjs"

const GOTO_TIMEOUT_MS = 60_000
const IDLE_MS = 10_000

let connected = null
let connectedTo = null

async function browser() {
  const ws = endpoint()
  if (!ws) return null
  if (connected && connectedTo === ws && connected.isConnected()) return connected
  connected = await firefox.connect(ws, { timeout: 30_000 })
  connectedTo = ws
  return connected
}

/**
 * Открыть одну страницу.
 * @returns {Promise<{url:string, final_url?:string, status?:number|null, title?:string, html?:string, text?:string, ms:number, error?:string}>}
 */
export async function readPage(url) {
  const t0 = Date.now()
  let b
  try {
    b = await browser()
  } catch (e) {
    return { error: "engine-connect-failed", ms: Date.now() - t0, url, why: String(e.message).split("\n")[0].slice(0, 200) }
  }
  if (!b) return { error: "engine-unreachable", ms: Date.now() - t0, url }
  const context = await b.newContext()
  try {
    const page = await context.newPage()
    const resp = await page.goto(url, { timeout: GOTO_TIMEOUT_MS, waitUntil: "load" })
    await page.waitForLoadState("networkidle", { timeout: IDLE_MS }).catch(() => {})
    return {
      final_url: page.url(),
      html: await page.content(),
      ms: Date.now() - t0,
      status: resp ? resp.status() : null,
      text: await page.evaluate(() => (document.body ? document.body.innerText : "")),
      title: await page.title(),
      url,
    }
  } catch (e) {
    return { error: "page-failed", ms: Date.now() - t0, url, why: String(e.message).split("\n")[0].slice(0, 200) }
  } finally {
    await context.close().catch(() => {})
  }
}
