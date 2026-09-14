#!/usr/bin/env node
// ПРИБОР 196-4: РОЛИК YOUTUBE — ДАННЫЕ И СУБТИТРЫ С МЕТКАМИ; «ЧТО ДОСТАЛОСЬ + ПРИЧИНА»; ОТКАЗЫ.
//
// 🔒 НАЗВАНИЕ СВЕРЯЕТСЯ С НЕЗАВИСИМЫМ ИСТОЧНИКОМ: oEmbed YouTube берётся простым `fetch` мимо службы.
// 🔒 РОЛИК БЕЗ СУБТИТРОВ ВЫБИРАЕТСЯ ИЗМЕРЕНИЕМ, А НЕ ПАМЯТЬЮ: прибор перебирает кандидатов и берёт первого, у кого служба не
// нашла ни одной дорожки. Не нашлось — это называется «недостижимо», а не подменяется роликом с субтитрами.
//
// Запуск на сервере: node scripts/probe/youtube.mjs

import { readFileSync } from "node:fs"

const BASE = process.env.AI_BROWSER_URL ?? "http://127.0.0.1:3800"
let SECRET = process.env.DATA_SECRET ?? ""
try {
  SECRET ||= (readFileSync("/etc/fractera/secrets.env", "utf8").match(/^DATA_SECRET=(.+)$/m) ?? [])[1]?.trim() ?? ""
} catch { /* вне сервера */ }

const WITH_CAPTIONS = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
const NO_CAPTION_CANDIDATES = ["aqz-KE-bpKQ", "LXb3EKWsInQ", "jNQXAC9IVRw"]

let failed = 0
const say = (ok, text) => {
  if (!ok) failed++
  console.log(`${ok ? "✓" : "✗"} ${text}`)
}
const yt = async (body, headers = { "x-data-secret": SECRET }) => {
  const t0 = Date.now()
  const r = await fetch(`${BASE}/v1/youtube`, { body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...headers }, method: "POST" })
  return { j: await r.json().catch(() => ({})), ms: Date.now() - t0, status: r.status }
}
const brief = (j) => JSON.stringify({ blocked: j.blocked?.total, error: j.error, playability: j.playability, tracks: j.tracks, trace: j.trace ? { page_url: j.trace.page_url, egress: j.trace.egress?.length } : undefined, why: j.why })

console.log("===PROBE_YOUTUBE===")
const c = await (await fetch(`${BASE}/v1/contract`, { headers: { "x-data-secret": SECRET } })).json().catch(() => ({}))
say(c.version === "0.3.0" && (c.methods ?? []).some((m) => m.name === "youtube"), `договор ${c.version}: ${(c.methods ?? []).map((m) => m.name).join(", ")}`)

// ── A: ролик с субтитрами ────────────────────────────────────────────────────────────────────────────────────────
const oembed = await (await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(WITH_CAPTIONS)}`)).json().catch(() => ({}))
const a = await yt({ url: WITH_CAPTIONS })
const tr = a.j.transcript
say(a.status === 200 && a.j.ok === true, `ролик с субтитрами: ${a.status}, ${a.ms} мс${a.j.error ? " " + a.j.error + " " + a.j.why : ""}`)
if (a.status !== 200) console.log(`  · ${brief(a.j)}`)
say(Boolean(a.j.video?.title) && a.j.video?.title === oembed.title, `название службы = oEmbed: «${a.j.video?.title}» / «${oembed.title}»`)
say((a.j.tracks?.length ?? 0) > 0, `дорожки: ${(a.j.tracks ?? []).map((t) => `${t.lang}·${t.kind}`).join(", ")}`)
say((tr?.lines?.length ?? 0) > 10 && /^\[\d{2}:\d{2}–\d{2}:\d{2}\] \S/.test(tr?.text ?? ""), `субтитры ${tr?.lang}·${tr?.kind}: строк ${tr?.lines?.length}; начало «${String(tr?.text ?? "").split("\n").slice(0, 3).join(" | ")}»`)
console.log(`  · данные: канал «${a.j.video?.channel}», ${a.j.video?.length_seconds} с, опубликован ${a.j.video?.publish_date}, просмотров ${a.j.video?.view_count}; why: ${a.j.why}`)

// ── A': короткий адрес и выбор языка ─────────────────────────────────────────────────────────────────────────────
const other = (a.j.tracks ?? []).find((t) => t.lang && t.lang !== tr?.lang && t.kind !== "asr")
if (other) {
  const b = await yt({ lang: other.lang, url: "https://youtu.be/dQw4w9WgXcQ" })
  say(b.j.id === "dQw4w9WgXcQ", `youtu.be → id ${b.j.id}`)
  // 🔒 ЯЗЫК — СПРАВКА, А НЕ ПРОВЕРКА: он не назван доказательством в ТЗ 196-4, а первая редакция засчитывала любой `why`
  // как успех — то есть «язык не получен» проходил зелёным. Теперь печатается, что вышло на самом деле.
  console.log(`  · язык «${other.lang}»: ${b.j.transcript?.lang === other.lang ? "получен" : "НЕ получен"} (транскрипт «${b.j.transcript?.lang}», строк ${b.j.transcript?.lines?.length ?? 0}); why: ${b.j.why}`)
}

// ── B: ролик без субтитров — «что досталось + причина» ─────────────────────────────────────────────────────────────
let noCap = null
for (const id of NO_CAPTION_CANDIDATES) {
  const r = await yt({ url: `https://www.youtube.com/watch?v=${id}` })
  console.log(`  · кандидат ${id}: ${r.status}, дорожек ${r.j.tracks?.length ?? "—"}, ${r.ms} мс${r.j.error ? ` ${r.j.error} (${r.j.playability?.status}: ${r.j.why})` : ""}`)
  if (r.status === 200 && r.j.tracks?.length === 0) {
    noCap = r
    break
  }
}
if (noCap) {
  say(noCap.j.transcript === null && Boolean(noCap.j.why) && Boolean(noCap.j.video?.title), `без субтитров: transcript null, why «${noCap.j.why}», данные «${noCap.j.video?.title}»`)
} else {
  console.log("  🛑 недостижимо: у всех кандидатов есть дорожки — случай «нет дорожек» этим прогоном не показан")
}

// ── B: отказы ──────────────────────────────────────────────────────────────────────────────────────────────────────
const ny = await yt({ url: "https://example.com/watch?v=dQw4w9WgXcQ" })
say(ny.status === 400 && ny.j.error === "not-youtube", `не YouTube → ${ny.status} ${ny.j.error}`)
const gone = await yt({ url: "https://www.youtube.com/watch?v=aaaaaaaaaaa" })
say(gone.status !== 200 && gone.j.ok === false && Boolean(gone.j.error), `несуществующий ролик → ${gone.status} ${gone.j.error} (${gone.j.why})`)
const locked = await yt({ url: WITH_CAPTIONS }, {})
say(locked.status === 401, `без секрета → ${locked.status} ${locked.j.error}`)

console.log(failed === 0 ? "✓ OK" : `✗ FAILED ${failed}`)
console.log("===PROBE_YOUTUBE_END===")
process.exit(failed === 0 ? 0 : 1)
