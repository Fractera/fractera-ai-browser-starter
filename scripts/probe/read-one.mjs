#!/usr/bin/env node
// ПРИБОР 196-2: ОДНА СТРАНИЦА ЧЕРЕЗ ДОГОВОР ПО ПЕТЛЕ; ОТКАЗЫ БЕЗ СЕКРЕТА И БЕЗ ДВИЖКА.
//
// 🔒 ЗАГОЛОВОК СВЕРЯЕТСЯ С НЕЗАВИСИМЫМ ИСТОЧНИКОМ: тот же адрес берётся простым `fetch`, и `<title>` оттуда обязан совпасть
// с тем, что назвал браузер. Прибор не верит службе на слово.
// 🔒 НЕГАТИВ «ДВИЖОК НЕ ПОДНЯТ» — БЕЗ ОСТАНОВКИ СЛУЖБЫ: запрос с первой секунды после перезапуска получает 503, а не
// висит; прибор запускается с `--no-engine-check`, если движок уже поднят и ждать перезапуска не нужно.
//
// Запуск на сервере: node scripts/probe/read-one.mjs

import { readFileSync } from "node:fs"

const BASE = process.env.AI_BROWSER_URL ?? "http://127.0.0.1:3800"
const URL_STATIC = process.env.PAGE_URL ?? "https://www.fractera.ai/"
const URL_SPA = "https://todomvc.com/examples/react/dist/"

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

console.log("===PROBE_READ_ONE===")
say(Boolean(SECRET), `секрет машины ${SECRET ? "есть" : "НЕТ"}`)

const h = await (await fetch(`${BASE}/v1/health`)).json().catch(() => ({}))
say(h.ok === true && h.service === "fractera-ai-browser", `health без ключа: ${h.service} ${h.version}, движок ${h.engine?.status}, перезапусков ${h.engine?.restarts}`)

// ждём движок по факту, не паузой
for (let i = 0; i < 60; i++) {
  const s = await (await fetch(`${BASE}/v1/health`)).json().catch(() => ({}))
  if (s.engine?.status === "up") break
  await new Promise((r) => setTimeout(r, 2000))
}

const r1 = await read([URL_STATIC], {})
say(r1.status === 401 && r1.j.error === "no-access", `без секрета → ${r1.status} ${r1.j.error}`)
const r2 = await read([URL_STATIC, URL_SPA])
say(r2.status === 400 && r2.j.error === "too-many-urls", `две ссылки в 196-2 → ${r2.status} ${r2.j.error}`)

const raw = await (await fetch(URL_STATIC)).text()
// 🔒 СЫРОЙ `<title>` РАСКОДИРУЕТСЯ: в HTML знак «&» лежит сущностью `&amp;`, а браузер отдаёт сам знак. ✗ Первый прогон
// 196-2 сравнивал «Self-Hosted & Token-Free» с «Self-Hosted &amp; Token-Free» и объявил отказом совпадающие заголовки.
const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
const rawTitle = decode((raw.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim())
const r3 = await read([URL_STATIC])
const p = r3.j.results?.[0] ?? {}
say(r3.status === 200 && r3.j.ok === true && p.status === 200, `страница: ${r3.status} за ${p.ms} мс, код страницы ${p.status}${p.error ? " " + p.error + " " + p.why : ""}`)
say(Boolean(p.title) && p.title === rawTitle, `заголовок браузера = заголовку простого запроса: «${p.title}» / «${rawTitle}»`)
say((p.html?.length ?? 0) >= raw.length * 0.8 && (p.text?.length ?? 0) > 1000, `итоговый HTML ${p.html?.length} (исходный ${raw.length}), текст ${p.text?.length}`)

const rawSpa = await (await fetch(URL_SPA)).text()
const r4 = await read([URL_SPA])
const s = r4.j.results?.[0] ?? {}
say(r4.j.ok === true && (s.html?.length ?? 0) > rawSpa.length * 2, `SPA: исходный ${rawSpa.length} → итоговый ${s.html?.length}, заголовок «${s.title}», ${s.ms} мс`)

console.log(failed === 0 ? "✓ OK" : `✗ FAILED ${failed}`)
console.log("===PROBE_READ_ONE_END===")
process.exit(failed === 0 ? 0 : 1)
