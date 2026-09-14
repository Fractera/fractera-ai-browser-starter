#!/usr/bin/env node
// ПРИБОР 196-3: НЕСКОЛЬКО ССЫЛОК ОДНИМ ВЫЗОВОМ, ЭЛЕМЕНТЫ И МЕДИА; ЗАПРЕТ АДРЕСОВ ВНУТРИ МАШИНЫ НА КАЖДОМ ЗАПРОСЕ СТРАНИЦЫ.
// Заменяет прибор 196-2 `read-one.mjs`: его проверки (заголовок против простого запроса, SPA длиннее исходника) живут здесь.
//
// 🔒 ЗАГОЛОВОК СВЕРЯЕТСЯ С НЕЗАВИСИМЫМ ИСТОЧНИКОМ: тот же адрес берётся простым `fetch`, сырой `<title>` раскодируется
// (✗ 196-2: «&» против «&amp;» объявило отказом совпадающие заголовки).
// 🔒 «СЛОЙ ДАННЫХ ОБРАЩЕНИЯ НЕ ПОЛУЧИЛ» ИЗМЕРЯЕТСЯ СЧЁТЧИКОМ, А НЕ ВЕРОЙ: прибор поднимает свой слушатель на петле и считает
// каждое обращение к нему — HTTP и WebSocket. Слушатель сначала доказывает, что сам слышит (контроль прибора), затем
// страница-ловушка тянет его картинкой, фреймом, `fetch` и сокетом.
// 🔒 ОТКАЗ ДОЛЖЕН БЫТЬ НАШ, А НЕ БРАУЗЕРА: Firefox и сам умеет не пускать публичную страницу в петлю, и тогда счётчик 0
// ничего бы не доказал. Поэтому проверяется ещё и `blocked` ответа — список запросов, которые отверг НАШ перехват.
// 🔒 СТРАНИЦА-ЛОВУШКА ЛЕЖИТ СНАРУЖИ: `http://httpbin.org/base64/<страница>` отдаёт присланное как `text/html`. Адрес самой
// машины (`aifa.dev`) для этого не годится — он и есть запрещённый.
//
// Запуск на сервере: node scripts/probe/read.mjs

import { readFileSync } from "node:fs"
import { createServer } from "node:http"

const BASE = process.env.AI_BROWSER_URL ?? "http://127.0.0.1:3800"
const URL_STATIC = "https://www.fractera.ai/"
const URL_SPA = "https://todomvc.com/examples/react/dist/"
const URL_MEDIA = "https://en.wikipedia.org/wiki/Web_browser"

function machineEnv(name) {
  try {
    for (const line of readFileSync("/etc/fractera/secrets.env", "utf8").split("\n")) {
      const i = line.indexOf("=")
      if (i > 0 && line.slice(0, i).trim() === name) return line.slice(i + 1).trim().replace(/^["']|["']$/g, "")
    }
  } catch { /* вне сервера */ }
  return ""
}
const SECRET = process.env.DATA_SECRET || machineEnv("DATA_SECRET")

let failed = 0
const say = (ok, text) => {
  if (!ok) failed++
  console.log(`${ok ? "✓" : "✗"} ${text}`)
}
const read = async (urls, headers = { "x-data-secret": SECRET }) => {
  const r = await fetch(`${BASE}/v1/read`, { body: JSON.stringify({ urls }), headers: { "Content-Type": "application/json", ...headers }, method: "POST" })
  return { j: await r.json().catch(() => ({})), status: r.status }
}
const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

console.log("===PROBE_READ===")
say(Boolean(SECRET), `секрет машины ${SECRET ? "есть" : "НЕТ"}`)

for (let i = 0; i < 60; i++) {
  const s = await (await fetch(`${BASE}/v1/health`)).json().catch(() => ({}))
  if (s.engine?.status === "up") break
  await wait(2000)
}
const c = await (await fetch(`${BASE}/v1/contract`, { headers: { "x-data-secret": SECRET } })).json().catch(() => ({}))
say(c.version === "0.2.0" && c.methods?.[0]?.name === "read", `договор ${c.version}, методы: ${(c.methods ?? []).map((m) => m.name).join(", ")}`)

// ── слушатель на петле: он и есть «слой данных», до которого страница не должна достать ─────────────────────────────
const hits = []
const trap = createServer((req, res) => {
  hits.push(`http ${req.url}`)
  res.end("LEAK")
})
trap.on("upgrade", (req, socket) => {
  hits.push(`ws ${req.url}`)
  socket.destroy()
})
await new Promise((r) => trap.listen(0, "127.0.0.1", r))
const PORT = trap.address().port
await fetch(`http://127.0.0.1:${PORT}/self`).then((r) => r.text())
say(hits.length === 1, `контроль прибора: слушатель 127.0.0.1:${PORT} слышит обращение (${hits.join(", ")})`)
hits.length = 0

// ── A: три страницы одним вызовом ────────────────────────────────────────────────────────────────────────────────
const raw = await (await fetch(URL_STATIC)).text()
const rawTitle = decode((raw.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim())
const rawSpa = await (await fetch(URL_SPA)).text()
const t0 = Date.now()
const a = await read([URL_STATIC, URL_SPA, URL_MEDIA])
say(a.status === 200 && a.j.ok === true && a.j.results?.length === 3 && a.j.failed === 0, `три ссылки одним вызовом: ${a.status}, результатов ${a.j.results?.length}, отказов ${a.j.failed}, ${Date.now() - t0} мс`)
const [st, spa, med] = a.j.results ?? [{}, {}, {}]
for (const [name, p] of [["витрина", st], ["SPA", spa], ["википедия", med]]) {
  const n = (k) => p?.[k]?.total ?? "—"
  say(
    Boolean(p?.title) && (p?.text?.length ?? 0) > 200 && n("links") > 0 && n("headings") > 0 && p?.error === undefined,
    `${name}: код ${p?.status}, «${p?.title}», html ${p?.html_length}, текст ${p?.text_length}, заголовков ${n("headings")}, ссылок ${n("links")}, кнопок ${n("buttons")}, форм ${n("forms")}, полей ${n("fields")}, картинок ${n("images")}, видео ${n("videos")}, фреймов ${n("iframes")}, мета ${Object.keys(p?.meta ?? {}).length}, отвергнуто ${p?.blocked?.total}, ${p?.ms} мс${p?.error ? " " + p.error + " " + p.why : ""}`,
  )
}
for (const p of [st, spa, med]) if (p?.error) console.log(`  · ${p.url}: незавершённые запросы ${JSON.stringify(p.pending)}`)
say(st?.title === rawTitle, `заголовок браузера = заголовку простого запроса: «${st?.title}» / «${rawTitle}»`)
say((spa?.html_length ?? 0) > rawSpa.length * 2 && (spa?.fields?.total ?? 0) > 0, `SPA: исходный ${rawSpa.length} → итоговый ${spa?.html_length}; поле ввода: ${JSON.stringify(spa?.fields?.items?.[0])}`)
say((med?.images?.total ?? 0) > 0 && Boolean(med?.images?.items?.[0]?.src), `медиа по атрибутам: ${JSON.stringify(med?.images?.items?.find((i) => i.alt) ?? med?.images?.items?.[0])}`)
say(typeof st?.meta?.description === "string" || typeof st?.meta?.["og:title"] === "string", `мета витрины: description «${String(st?.meta?.description ?? "").slice(0, 60)}», og:title «${st?.meta?.["og:title"] ?? ""}»`)

// ── B: запрет адресов ──────────────────────────────────────────────────────────────────────────────────────────────
const forbidden = [
  "http://127.0.0.1:3300/health",
  "http://localhost:3700/v1/health",
  "http://169.254.169.254/",
  "http://[::1]:3300/",
  `http://127.0.0.1.nip.io:${PORT}/nip`,
  "file:///etc/passwd",
]
const b = await read(forbidden)
for (const [i, u] of forbidden.entries()) {
  const r = b.j.results?.[i] ?? {}
  say(r.error === "url-forbidden", `${u} → ${r.error} (${r.why}), ${r.ms} мс`)
}

const page = `<!doctype html><title>trap</title><p id="o">start</p>
<img src="http://127.0.0.1:${PORT}/img"><iframe src="http://127.0.0.1:${PORT}/frame"></iframe>
<script>
fetch("http://127.0.0.1:${PORT}/fetch").then((r) => { o.textContent = r.status === 403 ? "fetch-blocked" : "LEAK-FETCH" }).catch(() => { o.textContent = "fetch-blocked" });
try { const w = new WebSocket("ws://127.0.0.1:${PORT}/ws"); w.onopen = () => { document.title = "LEAK-WS" } } catch (e) {}
fetch("http://httpbin.org/get").then((r) => r.json()).then(() => { document.body.insertAdjacentHTML("beforeend", "<p>external-ok</p>") }).catch(() => {});
</script>`
const b64 = Buffer.from(page).toString("base64").replace(/\+/g, "-").replace(/\//g, "_")
const redirect = `http://httpbin.org/redirect-to?url=${encodeURIComponent(`http://127.0.0.1:${PORT}/redirect`)}`
// 🔒 КАЖДЫЙ СЛУЧАЙ — СВОИМ ВЫЗОВОМ И СО СВОИМ СЧЁТОМ ОБРАЩЕНИЙ: ✗ первый прогон 196-3 слил ловушку и перенаправление в один
// вызов, и одно обращение к слушателю нельзя было приписать ни одному из двух без рассуждения.
const brief = (r) => JSON.stringify({ blocked: r.blocked, error: r.error, final_url: r.final_url, ms: r.ms, status: r.status, title: r.title, why: r.why })

const plain = await read(["http://httpbin.org/html"])
const pl = plain.j.results?.[0] ?? {}
say(!pl.error && (pl.text_length ?? 0) > 1000, `контроль: обычная страница по http через прокси: код ${pl.status}, текст ${pl.text_length}, ${pl.ms} мс${pl.error ? " " + pl.error + " " + pl.why : ""}`)

hits.length = 0
const rdAns = await read([redirect])
await wait(1500)
const rd = rdAns.j.results?.[0] ?? {}
say(rd.error === "url-forbidden", `перенаправление httpbin → петля: ${rd.error} (${rd.why}), ${rd.ms} мс`)
say(hits.length === 0, `после перенаправления слушатель получил обращений: ${hits.length}${hits.length ? " — " + hits.join(", ") : ""}`)
if (rd.error !== "url-forbidden") console.log(`  · ответ: ${brief(rd)}`)

hits.length = 0
const t = await read([`http://httpbin.org/base64/${b64}`])
await wait(1500)
const tp = t.j.results?.[0] ?? {}
say(!tp.error && tp.title === "trap", `страница-ловушка открыта: «${tp.title}», код ${tp.status}, ${tp.ms} мс${tp.error ? " " + tp.error + " " + tp.why : ""}`)
if (tp.error) console.log(`  · ответ: ${brief(tp)}`)
say(/fetch-blocked/.test(tp.text ?? ""), `скрипт страницы увидел отказ: «${String(tp.text ?? "").replace(/\s+/g, " ").slice(0, 80)}»`)
const kinds = (tp.blocked?.items ?? []).map((x) => `${x.type} ${x.url}`)
say(["/img", "/frame", "/fetch"].every((p) => kinds.some((k) => k.includes(`:${PORT}${p}`))), `запрет отверг: ${kinds.join(" · ")} (всего ${tp.blocked?.total})`)
console.log(`  · сокет: ${kinds.some((k) => k.includes("/ws") || k.startsWith("proxy-connect")) ? "отвергнут" : "не замечен"}; внешний запрос страницы: ${/external-ok/.test(tp.text ?? "") ? "прошёл" : "не дошёл"}`)
say(hits.length === 0, `после ловушки слушатель получил обращений: ${hits.length}${hits.length ? " — " + hits.join(", ") : ""}`)

// ── B: пределы и замок ─────────────────────────────────────────────────────────────────────────────────────────────
const many = await read(Array.from({ length: 11 }, (_, i) => `https://example.com/?${i}`))
say(many.status === 400 && many.j.error === "too-many-urls" && many.j.limit === 10, `11 ссылок → ${many.status} ${many.j.error}, предел ${many.j.limit}`)
const bad = await read(["not a url"])
say(bad.j.results?.[0]?.error === "url-invalid", `«not a url» → ${bad.j.results?.[0]?.error}`)
const locked = await read([URL_STATIC], {})
say(locked.status === 401 && locked.j.error === "no-access", `без секрета → ${locked.status} ${locked.j.error}`)

trap.close()
console.log(failed === 0 ? "✓ OK" : `✗ FAILED ${failed}`)
console.log("===PROBE_READ_END===")
process.exit(failed === 0 ? 0 : 1)
