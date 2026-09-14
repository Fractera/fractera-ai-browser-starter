#!/usr/bin/env node
// ПРИБОР 196-8: БРАУЗЕР ПОД ПАКЕТАМИ ТЯЖЁЛЫХ СТРАНИЦ — ЗАВИСАЕТ ЛИ, И ЧЕМ ЭТО ВИДНО.
//
// ✗ ЧЕМ ОПЛАЧЕН. Воспроизведение 2026-09-14: после второго пакета из трёх тяжёлых страниц ни одна навигация не открылась
// (`about:blank`, 45 с), состояние держалось; `/v1/health` писал `up`, родитель Camoufox в простое держал 37 % CPU.
// 🔒 ЗАВИСАНИЕ ОТЛИЧАЕТСЯ ОТ МЕДЛЕННОГО САЙТА ПРИЗНАКОМ, А НЕ ВРЕМЕНЕМ: страница осталась `about:blank`, а прокси ссылки не
// получил ни одного соединения — браузер не дошёл до сети. Медленный сайт этот признак не даёт.
// 🔒 ЛЁГКИЕ СТРАНИЦЫ ПОСЛЕ КАЖДОГО ПАКЕТА — ИЗМЕРИТЕЛЬ, А ТЯЖЁЛЫЕ — НАГРУЗКА: отказ тяжёлой страницы сам по себе не дефект
// (сайт бывает медленным), отказ `example.com` — дефект.
// 🛑 ДВА КРУГА ПОДРЯД, ГДЕ ЗАВИСЛИ ВСЕ ЛЁГКИЕ, — ОСТАНОВКА: дальше прибор мерил бы мёртвый браузер.
//
// Запуск на сервере: ROUNDS=5 node scripts/probe/stress.mjs

import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"

const BASE = process.env.AI_BROWSER_URL ?? "http://127.0.0.1:3800"
const ROUNDS = Number(process.env.ROUNDS ?? 5)
let SECRET = process.env.DATA_SECRET ?? ""
try {
  SECRET ||= (readFileSync("/etc/fractera/secrets.env", "utf8").match(/^DATA_SECRET=(.+)$/m) ?? [])[1]?.trim() ?? ""
} catch { /* вне сервера */ }

const HEAVY = ["https://developer.mozilla.org/en-US/docs/Web/HTML", "https://todomvc.com/examples/react/dist/", "https://en.wikipedia.org/wiki/Web_browser"]
const LIGHT = ["https://example.com/", "http://httpbin.org/html", "https://www.iana.org/help/example-domains"]

const read = async (urls) => {
  const t0 = Date.now()
  try {
    const r = await fetch(`${BASE}/v1/read`, {
      body: JSON.stringify({ urls }),
      headers: { "Content-Type": "application/json", "x-data-secret": SECRET },
      method: "POST",
      signal: AbortSignal.timeout(330_000),
    })
    return { j: await r.json(), ms: Date.now() - t0 }
  } catch (e) {
    return { j: { error: String(e.message) }, ms: Date.now() - t0 }
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const parentCpu = () => {
  try {
    const pid = execSync("pgrep -f 'camoufox-bin -no-remote' | head -1").toString().trim()
    return execSync(`ps -o pcpu= -p ${pid}`).toString().trim()
  } catch {
    return "?"
  }
}
const isHang = (res) => Boolean(res?.error && res.trace?.page_url === "about:blank" && !(res.trace.egress ?? []).length)

const h = await (await fetch(`${BASE}/v1/health`)).json().catch(() => ({}))
console.log(`===STRESS=== modes=${JSON.stringify(h.engine?.modes)} engine=${h.engine?.status} restarts=${h.engine?.restarts} rounds=${ROUNDS}`)

let heavyFailed = 0
let lightFailed = 0
let hangs = 0
let streak = 0
let done = 0
for (let round = 1; round <= ROUNDS; round++) {
  const b = await read(HEAVY)
  const bf = (b.j.results ?? []).filter((x) => x.error).length || (b.j.results ? 0 : HEAVY.length)
  heavyFailed += bf
  let roundHangs = 0
  const light = []
  for (const u of LIGHT) {
    const x = await read([u])
    const res = x.j.results?.[0]
    if (res?.error || !res) lightFailed += 1
    if (isHang(res)) roundHangs += 1
    light.push(`${res?.error ? (isHang(res) ? "HANG" : res.error) : "ok"}/${x.ms}`)
  }
  hangs += roundHangs
  await sleep(5000)
  console.log(`round ${round}: heavy ${HEAVY.length - bf}/${HEAVY.length} ok ${b.ms} мс · light ${light.join(" ")} · parent_cpu_idle=${parentCpu()}%`)
  done = round
  streak = roundHangs === LIGHT.length ? streak + 1 : 0
  if (streak >= 2) {
    console.log("  🛑 два круга подряд все лёгкие зависли — остановка")
    break
  }
}
const end = await (await fetch(`${BASE}/v1/health`)).json().catch(() => ({}))
console.log(`STRESS_SUMMARY rounds=${done} heavy_failed=${heavyFailed} light_failed=${lightFailed} hangs=${hangs} parent_cpu_end=${parentCpu()}% engine_end=${end.engine?.status} restarts_end=${end.engine?.restarts}`)
console.log(hangs === 0 && lightFailed === 0 ? "✓ OK" : "✗ FAILED")
process.exit(hangs === 0 && lightFailed === 0 ? 0 : 1)
