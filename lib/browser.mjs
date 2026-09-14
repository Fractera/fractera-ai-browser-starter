// ЧТЕНИЕ СТРАНИЦ НАСТОЯЩИМ БРАУЗЕРОМ (шаги 196-2, 196-3).
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-13: «извлечь именно весь доступный исходный код (текстовую составляющую, все что касается
// интерактивных элементов или медиафайлов проводится поверхностный анализ через атрибуты или заголовки) а не только Мета
// записи»; «обрабатывать нужно уметь ни одну ссылку а несколько ссылок».
//
// 🔒 ПОДКЛЮЧЕНИЕ ДЕРЖИТСЯ, А НЕ ОТКРЫВАЕТСЯ НА КАЖДЫЙ ВЫЗОВ: замер 196-1 — первое открытие 8 с, следующие ≈ 2 с. Движок
// перезапустился — адрес сменился, и подключение пересоздаётся. Несколько вкладок разом подключаются ОДНИМ обещанием.
// 🔒 КАЖДАЯ ССЫЛКА — СВОЙ КОНТЕКСТ: куки и хранилище одной страницы не достаются следующей.
// 🔒 «ДОЖДАТЬСЯ ЗАГРУЗКИ» ДВУХСТУПЕНЧАТО: `load` обязателен, тишина сети — не дольше `IDLE_MS`. Страницы с вечными
// запросами (аналитика, чаты) иначе не дают ответа никогда.
// 🔒 ЗАПРЕТ АДРЕСОВ — ДВУМЯ СЛОЯМИ (196-3). Держит ПРОКСИ контекста (`lib/egress.mjs`): через него идёт весь выход браузера,
// и мимо него не пройти. `route` и `routeWebSocket` стоят перед ним ради типа запроса в ответе. ✗ Одного `route` не хватило —
// измерено: перенаправление на петлю он в Firefox не видит, и слушатель на петле получил обращение.
// `serviceWorkers: "block"` — запросы сервис-воркера мимо `route` проходят. Отказы обоих слоёв пишутся в `blocked`: зовущий
// видит, что страница хотела достать и не достала.
// 🔒 ЭЛЕМЕНТЫ И МЕДИА — ПО АТРИБУТАМ, А НЕ СОДЕРЖИМЫМ: картинка отдаётся адресом и `alt`, видео — адресом, постером и
// длительностью. Скачивать медиа служба не обязана (слово владельца: «поверхностный анализ»).
// 🔒 ПРЕДЕЛЫ НАЗВАНЫ В ОТВЕТЕ, А ОБРЕЗАННОЕ — ПОМЕЧЕНО: список из 300 ссылок при 2 000 на странице без `total` читался бы
// как «ссылок 300».

import { firefox } from "playwright-core"
import { endpoint } from "./engine.mjs"
import { startEgress } from "./egress.mjs"
import { checkUrl, hostRefusal } from "./guard.mjs"

export const LIMITS = Object.freeze({
  blocked: 50,
  htmlChars: 5_000_000,
  listItems: 300,
  perUrlMs: 90_000,
  tabs: 3,
  textChars: 1_000_000,
  urls: 10,
})
const GOTO_TIMEOUT_MS = 60_000
const IDLE_MS = 10_000

let connected = null
let connectedTo = null
let connecting = null

async function browser() {
  const ws = endpoint()
  if (!ws) return null
  if (connected && connectedTo === ws && connected.isConnected()) return connected
  if (connecting && connectedTo === ws) return connecting
  connectedTo = ws
  connecting = firefox
    .connect(ws, { timeout: 30_000 })
    .then((b) => {
      connected = b
      return b
    })
    .finally(() => {
      connecting = null
    })
  return connecting
}

const firstLine = (e) => String(e?.message ?? e).split("\n")[0].slice(0, 200)

/** Перехват: каждый запрос и сокет контекста проходит через запрет адресов. */
async function guardContext(context, cache, blocked) {
  const refuse = (type, url, why, main = false) => {
    blocked.total += 1
    if (blocked.items.length < LIMITS.blocked) blocked.items.push({ main, type, url: url.slice(0, 300), why })
  }
  await context.route("**/*", async (route) => {
    const req = route.request()
    let why = null
    try {
      const u = new URL(req.url())
      if (u.protocol === "data:" || u.protocol === "blob:") return await route.continue()
      why = u.protocol === "http:" || u.protocol === "https:" ? await hostRefusal(u.hostname, cache) : `scheme ${u.protocol}`
    } catch {
      why = "not a URL"
    }
    if (!why) return route.continue().catch(() => {})
    let main = false
    try {
      main = req.isNavigationRequest() && req.frame().parentFrame() === null
    } catch { /* запрос без кадра — не главный документ */ }
    refuse(req.resourceType(), req.url(), why, main)
    // 🛑 ОТВЕТ 403, А НЕ `abort`: оборванный фрейм в Firefox способен не дать странице `load` вовсе.
    return route.fulfill({ body: `blocked: ${why}`, contentType: "text/plain", status: 403 }).catch(() => {})
  })
  await context.routeWebSocket(/.*/, async (ws) => {
    let why
    try {
      const u = new URL(ws.url())
      why = u.protocol === "ws:" || u.protocol === "wss:" ? await hostRefusal(u.hostname, cache) : `scheme ${u.protocol}`
    } catch {
      why = "not a URL"
    }
    if (why) {
      refuse("websocket", ws.url(), why)
      return ws.close({ code: 1008, reason: "blocked" })
    }
    ws.connectToServer()
  })
}

/** Исполняется ВНУТРИ страницы: заголовки, мета, интерактивные элементы и медиа по атрибутам. */
function EXTRACT(max) {
  const clip = (s, n = 500) => {
    if (s == null) return null
    const t = String(s).replace(/\s+/g, " ").trim()
    return t ? t.slice(0, n) : null
  }
  const abs = (v) => {
    if (!v) return null
    try {
      return new URL(v, document.baseURI).href
    } catch {
      return v
    }
  }
  const take = (sel, map) => {
    const all = Array.from(document.querySelectorAll(sel))
    return { items: all.slice(0, max).map(map), total: all.length }
  }
  const labelOf = (el) => {
    if (el.id) {
      const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      if (l) return clip(l.innerText, 200)
    }
    const p = el.closest("label")
    return p ? clip(p.innerText, 200) : null
  }
  const sources = (m) =>
    Array.from(m.querySelectorAll("source")).map((s) => ({ src: abs(s.getAttribute("src")), type: s.getAttribute("type") }))
  const meta = {}
  for (const m of document.querySelectorAll("meta[name],meta[property],meta[http-equiv]")) {
    const k = m.getAttribute("name") || m.getAttribute("property") || m.getAttribute("http-equiv")
    if (k && !(k in meta)) meta[k] = clip(m.getAttribute("content"), 1000)
  }
  return {
    audios: take("audio", (a) => ({
      duration: Number.isFinite(a.duration) ? Math.round(a.duration) : null,
      sources: sources(a),
      src: a.currentSrc || abs(a.getAttribute("src")),
      title: clip(a.getAttribute("title") || a.getAttribute("aria-label"), 200),
    })),
    buttons: take('button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"]', (b) => ({
      aria_label: b.getAttribute("aria-label"),
      disabled: b.disabled === true,
      name: b.getAttribute("name"),
      tag: b.tagName.toLowerCase(),
      text: clip(b.innerText || b.value, 200),
      type: b.getAttribute("type"),
    })),
    canonical: abs(document.querySelector('link[rel="canonical"]')?.getAttribute("href")),
    fields: take(
      'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="hidden"]),textarea,select',
      (el) => ({
        aria_label: el.getAttribute("aria-label"),
        form: el.form ? el.form.id || el.form.getAttribute("name") || "form" : null,
        id: el.id || null,
        label: labelOf(el),
        name: el.getAttribute("name"),
        options: el.tagName === "SELECT" ? Array.from(el.options).slice(0, 50).map((o) => clip(o.text, 100)) : undefined,
        placeholder: el.getAttribute("placeholder"),
        required: el.required === true,
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type"),
      }),
    ),
    forms: take("form", (f) => ({
      action: abs(f.getAttribute("action")),
      fields: f.elements.length,
      id: f.id || null,
      method: (f.getAttribute("method") || "get").toLowerCase(),
      name: f.getAttribute("name"),
    })),
    headings: take("h1,h2,h3,h4,h5,h6", (h) => ({ level: Number(h.tagName[1]), text: clip(h.innerText, 300) })),
    iframes: take("iframe", (f) => ({ name: f.getAttribute("name"), src: abs(f.getAttribute("src")), title: clip(f.title, 200) })),
    images: take("img", (i) => ({
      alt: i.getAttribute("alt"),
      height: i.naturalHeight || null,
      loading: i.getAttribute("loading"),
      src: i.currentSrc || abs(i.getAttribute("src")),
      title: clip(i.getAttribute("title"), 200),
      width: i.naturalWidth || null,
    })),
    lang: document.documentElement.getAttribute("lang"),
    links: take("a[href]", (a) => ({
      href: abs(a.getAttribute("href")),
      rel: a.getAttribute("rel"),
      target: a.getAttribute("target"),
      text: clip(a.innerText, 200),
      title: clip(a.getAttribute("title"), 200),
    })),
    meta,
    videos: take("video", (v) => ({
      duration: Number.isFinite(v.duration) ? Math.round(v.duration) : null,
      poster: abs(v.getAttribute("poster")),
      sources: sources(v),
      src: v.currentSrc || abs(v.getAttribute("src")),
      title: clip(v.getAttribute("title") || v.getAttribute("aria-label"), 200),
    })),
  }
}

/** Одна ссылка. Отказ — полем `error` с причиной, а не исключением: соседние ссылки вызова не страдают. */
async function readOne(raw, cache) {
  const t0 = Date.now()
  const blocked = { items: [], total: 0 }
  const checked = await checkUrl(raw, cache)
  if (!checked.ok) return { error: checked.error, ms: Date.now() - t0, url: raw, why: checked.why }

  let b
  try {
    b = await browser()
  } catch (e) {
    return { error: "engine-connect-failed", ms: Date.now() - t0, url: raw, why: firstLine(e) }
  }
  if (!b) return { error: "engine-unreachable", ms: Date.now() - t0, url: raw }

  let context
  let timer
  let egress
  const navHosts = new Set()
  const mergeRefused = () => {
    for (const x of egress?.refused.items ?? []) if (blocked.items.length < LIMITS.blocked) blocked.items.push(x)
    blocked.total += egress?.refused.total ?? 0
  }
  try {
    egress = await startEgress()
    context = await b.newContext({
      acceptDownloads: false,
      proxy: { server: `http://127.0.0.1:${egress.port}` },
      serviceWorkers: "block",
    })
    await guardContext(context, cache, blocked)
    const page = await context.newPage()
    // Хосты цепочки главного документа, включая перенаправления: по ним отказ прокси отличают от отказа картинки.
    page.on("request", (r) => {
      try {
        if (r.isNavigationRequest() && r.frame() === page.mainFrame()) navHosts.add(new URL(r.url()).hostname)
      } catch { /* запрос без кадра */ }
    })
    const work = (async () => {
      const resp = await page.goto(checked.url, { timeout: GOTO_TIMEOUT_MS, waitUntil: "load" })
      await page.waitForLoadState("networkidle", { timeout: IDLE_MS }).catch(() => {})
      const html = await page.content()
      const text = await page.evaluate(() => (document.body ? document.body.innerText : ""))
      let parts = null
      let extractError = null
      try {
        parts = await page.evaluate(EXTRACT, LIMITS.listItems)
      } catch (e) {
        extractError = firstLine(e)
      }
      return {
        ...(parts ?? {}),
        ...(extractError ? { extract_error: extractError } : {}),
        final_url: page.url(),
        html: html.length > LIMITS.htmlChars ? html.slice(0, LIMITS.htmlChars) : html,
        html_length: html.length,
        html_truncated: html.length > LIMITS.htmlChars,
        status: resp ? resp.status() : null,
        text: text.length > LIMITS.textChars ? text.slice(0, LIMITS.textChars) : text,
        text_length: text.length,
        text_truncated: text.length > LIMITS.textChars,
        title: await page.title(),
      }
    })()
    work.catch(() => {})
    const out = await Promise.race([
      work,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve({ error: "page-timeout", why: `no answer in ${LIMITS.perUrlMs / 1000} s` }), LIMITS.perUrlMs)
      }),
    ])
    mergeRefused()
    return { url: raw, ...out, blocked, ms: Date.now() - t0 }
  } catch (e) {
    mergeRefused()
    // 🔒 ГЛАВНЫЙ ДОКУМЕНТ ОТВЕРГНУТ ЗАПРЕТОМ (перенаправление на петлю) — это `url-forbidden`, а не «страница упала»:
    // зовущий должен знать, что виноват адрес, а не браузер.
    const hostOf = (x) => {
      try {
        return new URL(x.url).hostname
      } catch {
        return String(x.url).replace(/:\d+$/, "").replace(/^\[|\]$/g, "")
      }
    }
    const main = blocked.items.find((x) => x.main || navHosts.has(hostOf(x)))
    return main
      ? { blocked, error: "url-forbidden", ms: Date.now() - t0, url: raw, why: `redirect: ${main.why}` }
      : { blocked, error: "page-failed", ms: Date.now() - t0, url: raw, why: firstLine(e) }
  } finally {
    clearTimeout(timer)
    await context?.close().catch(() => {})
    egress?.close()
  }
}

/**
 * Несколько ссылок: не больше `LIMITS.tabs` вкладок разом, порядок ответа = порядку ссылок.
 * Одно разрешение имени на вызов: имя, спрошенное сорок раз за страницу, разрешается однажды.
 */
export async function readPages(urls) {
  const cache = new Map()
  const results = new Array(urls.length)
  let next = 0
  const worker = async () => {
    while (next < urls.length) {
      const i = next++
      results[i] = await readOne(urls[i], cache)
    }
  }
  await Promise.all(Array.from({ length: Math.min(LIMITS.tabs, urls.length) }, worker))
  return results
}
