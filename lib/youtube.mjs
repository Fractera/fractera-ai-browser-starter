// РОЛИК YOUTUBE: ДАННЫЕ И СУБТИТРЫ С МЕТКАМИ ВРЕМЕНИ (шаг 196-4).
//
// 🎯 СЛОВА ВЛАДЕЛЬЦА 2026-09-13: YouTube — «also with ai browser https://github.com/daijro/camoufox»; без субтитров — «Что
// досталось + причина».
//
// 🔒 ОТКРЫВАЕТСЯ ТОЙ ЖЕ ЗАЩИЩЁННОЙ ВКЛАДКОЙ, ЧТО И ЛЮБАЯ СТРАНИЦА (`withGuardedPage`): прокси, перехват и запрет адресов одни.
// Второй путь в браузер «только для YouTube» обошёл бы защиту, оплаченную 196-3.
// 🔒 ДАННЫЕ РОЛИКА — ИЗ ИСХОДНОГО HTML (`ytInitialPlayerResponse`), А НЕ ИЗ `window`: замер 196-1 — после загрузки в Camoufox
// `window.ytInitialPlayerResponse` = false (скрипты страницы исполняются в своём мире), а в исходном ответе объект есть целиком.
// 🔒 СОГЛАСИЕ СНИМАЕТСЯ COOKIE: серверу в дата-центре YouTube отдаёт страницу согласия (замер 196-1); `SOCS`/`CONSENT` её снимают.
// 🛑 СУБТИТРЫ НЕ БЕРУТСЯ ПО `baseUrl` ДОРОЖКИ НАПРЯМУЮ — измерено в 196-1: 200 и 0 байт, с cookie и без. Поэтому их запрашивает
// САМ ПЛЕЕР: служба включает субтитры кнопкой плеера и перехватывает ответ `/api/timedtext`, который плеер получает со всеми
// своими параметрами. Нужный язык, если плеер взял другой, запрашивается тем же адресом с заменённым языком изнутри страницы.
// 🔒 НЕТ СУБТИТРОВ — ЭТО НЕ ОТКАЗ: отдаются данные ролика, `transcript: null` и `why` словами. Отказ — только когда ролика нет
// или страница не открылась: пустой успех на несуществующий ролик был бы ложью.

import { withGuardedPage, WAITS } from "./browser.mjs"

const ID = /^[A-Za-z0-9_-]{11}$/
const PLAYER_WAIT_MS = 30_000

/** Идентификатор ролика из адреса или null: watch?v=, youtu.be/, shorts/, embed/, live/. */
export function youtubeId(raw) {
  let u
  try {
    u = new URL(String(raw).trim())
  } catch {
    return null
  }
  const host = u.hostname.toLowerCase().replace(/^(www|m|music)\./, "")
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0]
    return ID.test(id) ? id : null
  }
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null
  const v = u.searchParams.get("v")
  if (v && ID.test(v)) return v
  const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

/** Объект JSON после метки в HTML — счётом скобок с учётом строк, без `eval`. */
function jsonAfter(html, marker) {
  const at = html.indexOf(marker)
  if (at < 0) return null
  const start = html.indexOf("{", at)
  if (start < 0) return null
  let depth = 0
  let inStr = false
  let esc = false
  for (let k = start; k < html.length; k++) {
    const c = html[k]
    if (inStr) {
      if (esc) esc = false
      else if (c === "\\") esc = true
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') inStr = true
    else if (c === "{") depth++
    else if (c === "}") {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, k + 1))
        } catch {
          return null
        }
      }
    }
  }
  return null
}

const textOf = (t) => (t?.simpleText ?? (t?.runs ?? []).map((r) => r.text).join("")) || null

function clock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

const decodeXml = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))

/** Строки субтитров из ответа `timedtext`: json3 или srv3/xml. */
function parseTimedText(body) {
  const lines = []
  const t = String(body ?? "").trim()
  if (!t) return lines
  if (t.startsWith("{")) {
    let j
    try {
      j = JSON.parse(t)
    } catch {
      return lines
    }
    for (const e of j.events ?? []) {
      const text = (e.segs ?? []).map((s) => s.utf8 ?? "").join("").replace(/\s+/g, " ").trim()
      if (!text) continue
      const start = e.tStartMs ?? 0
      lines.push({ end: start + (e.dDurationMs ?? 0), start, text })
    }
    return lines
  }
  for (const m of t.matchAll(/<p\s+t="(\d+)"(?:\s+d="(\d+)")?[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = decodeXml(m[3]).replace(/\s+/g, " ").trim()
    if (text) lines.push({ end: Number(m[1]) + Number(m[2] ?? 0), start: Number(m[1]), text })
  }
  if (lines.length) return lines
  for (const m of t.matchAll(/<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g)) {
    const text = decodeXml(m[3]).replace(/\s+/g, " ").trim()
    const start = Math.round(Number(m[1]) * 1000)
    if (text) lines.push({ end: start + Math.round(Number(m[2] ?? 0) * 1000), start, text })
  }
  return lines
}

const CONSENT_COOKIES = [
  { domain: ".youtube.com", name: "SOCS", path: "/", sameSite: "Lax", secure: true, value: "CAI" },
  { domain: ".youtube.com", name: "CONSENT", path: "/", sameSite: "Lax", secure: true, value: "YES+cb" },
]

/**
 * Открыть ролик и вернуть данные и субтитры.
 * @param {string} url
 * @param {string} [lang] — желаемый язык субтитров (`en`, `ru`…); не назван — язык, который выбрал плеер
 */
export async function readYouTube(url, lang) {
  const id = youtubeId(url)
  if (!id) return { error: "not-youtube", ms: 0, url }
  const watch = `https://www.youtube.com/watch?v=${id}&hl=en`

  const out = await withGuardedPage(
    watch,
    async (page, target) => {
      const timed = []
      page.on("response", async (r) => {
        if (!r.url().includes("/api/timedtext")) return
        try {
          timed.push({ body: await r.text(), status: r.status(), url: r.url() })
        } catch { /* тело недоступно — ответ пропущен */ }
      })

      const resp = await page.goto(target, { timeout: WAITS.gotoMs, waitUntil: "domcontentloaded" })
      const source = resp ? await resp.text().catch(() => "") : ""
      const html = source || (await page.content())
      const player = jsonAfter(html, "ytInitialPlayerResponse = ") ?? jsonAfter(html, "ytInitialPlayerResponse=")

      const base = { final_url: page.url(), id, status: resp ? resp.status() : null }
      if (!player) {
        const consent = /consent\.youtube\.com|before you continue to youtube/i.test(html) || /consent\./.test(page.url())
        return { ...base, error: consent ? "consent-wall" : "no-player-data", why: consent ? "YouTube показал страницу согласия" : "в ответе нет ytInitialPlayerResponse" }
      }

      const vd = player.videoDetails ?? {}
      const mf = player.microformat?.playerMicroformatRenderer ?? {}
      const playability = { reason: player.playabilityStatus?.reason ?? null, status: player.playabilityStatus?.status ?? null }
      if (!vd.videoId) {
        return { ...base, error: "video-unavailable", playability, why: playability.reason ?? `playability ${playability.status}` }
      }
      const video = {
        channel: vd.author ?? null,
        channel_id: vd.channelId ?? null,
        description: vd.shortDescription ?? textOf(mf.description),
        id: vd.videoId,
        is_live: vd.isLiveContent === true,
        keywords: vd.keywords ?? [],
        length_seconds: vd.lengthSeconds ? Number(vd.lengthSeconds) : null,
        publish_date: mf.publishDate ?? null,
        title: vd.title ?? textOf(mf.title),
        upload_date: mf.uploadDate ?? null,
        view_count: vd.viewCount ? Number(vd.viewCount) : null,
      }
      const rawTracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
      const tracks = rawTracks.map((t) => ({ kind: t.kind ?? "manual", lang: t.languageCode, name: textOf(t.name) }))

      if (!tracks.length) {
        return { ...base, playability, tracks, transcript: null, video, why: "у ролика нет дорожек субтитров — ни авторских, ни автоматических" }
      }

      // Плеер сам запрашивает субтитры, когда их включают. Кнопка и клавиша «c» — оба пути, пока не придёт непустой ответ.
      await page.waitForSelector("#movie_player", { timeout: PLAYER_WAIT_MS }).catch(() => {})
      const deadline = Date.now() + PLAYER_WAIT_MS
      const got = () => timed.find((x) => x.status === 200 && parseTimedText(x.body).length)
      let attempt = 0
      while (!got() && Date.now() < deadline) {
        attempt += 1
        await page.click(".ytp-large-play-button", { force: true, timeout: 2000 }).catch(() => {})
        const pressed = await page.getAttribute(".ytp-subtitles-button", "aria-pressed").catch(() => null)
        if (pressed === "true" && attempt > 1) {
          await page.click(".ytp-subtitles-button", { force: true, timeout: 2000 }).catch(() => {})
        }
        await page.click(".ytp-subtitles-button", { force: true, timeout: 2000 }).catch(() => {})
        if (attempt > 1) {
          await page.focus("#movie_player").catch(() => {})
          await page.keyboard.press("c").catch(() => {})
        }
        await page.waitForResponse((r) => r.url().includes("/api/timedtext"), { timeout: 6000 }).catch(() => {})
        await page.waitForTimeout(500)
      }

      const captured = got()
      if (!captured) {
        const tried = timed.map((x) => `${x.status}/${x.body.length}`).join(", ") || "плеер не запросил ни одной дорожки"
        return {
          ...base,
          playability,
          tracks,
          transcript: null,
          video,
          why: `дорожки есть (${tracks.map((t) => `${t.lang}${t.kind === "asr" ? "·asr" : ""}`).join(", ")}), но плеер не отдал текст за ${PLAYER_WAIT_MS / 1000} с: ${tried}`,
        }
      }

      let chosen = { body: captured.body, url: captured.url }
      const capturedLang = new URL(captured.url).searchParams.get("lang")
      let langNote = null
      if (lang && capturedLang !== lang) {
        const want = rawTracks.find((t) => t.languageCode === lang && t.kind !== "asr") ?? rawTracks.find((t) => t.languageCode === lang)
        if (want) {
          const u = new URL(captured.url)
          u.searchParams.set("lang", lang)
          if (want.kind === "asr") u.searchParams.set("kind", "asr")
          else u.searchParams.delete("kind")
          u.searchParams.delete("tlang")
          const body = await page
            .evaluate(async (href) => {
              const r = await fetch(href, { credentials: "include" })
              return r.ok ? r.text() : ""
            }, u.href)
            .catch(() => "")
          if (parseTimedText(body).length) chosen = { body, url: u.href }
          else langNote = `дорожка «${lang}» есть, но её текст не получен — отдан язык плеера «${capturedLang}»`
        } else {
          langNote = `дорожки «${lang}» у ролика нет — отдан язык плеера «${capturedLang}»`
        }
      }

      const lines = parseTimedText(chosen.body)
      const cu = new URL(chosen.url)
      return {
        ...base,
        playability,
        tracks,
        transcript: {
          kind: cu.searchParams.get("kind") === "asr" ? "asr" : "manual",
          lang: cu.searchParams.get("lang"),
          lines,
          text: lines.map((l) => `[${clock(l.start)}–${clock(l.end)}] ${l.text}`).join("\n"),
        },
        video,
        why: langNote,
      }
    },
    { cookies: CONSENT_COOKIES },
  )
  return { ...out, url }
}
