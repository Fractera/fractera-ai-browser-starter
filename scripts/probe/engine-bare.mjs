#!/usr/bin/env node
// ПРИБОР 196-8: «ГОЛЫЙ» ДВИЖОК CAMOUFOX БЕЗ СЛУЖБЫ — ЗАВИСАЕТ ЛИ ОН САМ.
//
// 🔒 ЗАЧЕМ. Испытание 196-8 показало зависание в обоих режимах прокси. Этот прибор убирает ВСЁ наше: свой запуск
// `python -m camoufox server` (без `engine/launch.py` и настройки петли), контексты без прокси, без `route`, без
// `routeWebSocket`, без `serviceWorkers: block`. Те же пакеты страниц, что у `stress.mjs`.
//   зависает и здесь → дефект в самом браузере, лечение — самопроверка и перезапуск движка;
//   не зависает → виноват один из наших слоёв, и следующий опыт снимает их по одному.
// 🛑 СЛУЖБА НЕ ОСТАНАВЛИВАЕТСЯ (закон: «остановка служб ради проверки» запрещена). Второй движок работает рядом, и это
// поправка к замеру процессора, названная в выводе.
// 🔒 ЗАВИСАНИЕ ЗДЕСЬ — `goto` не дошёл до `domcontentloaded` за 45 с И страница осталась `about:blank`.
// 🔒 УБОРКА ОБЯЗАТЕЛЬНА: движок гасится группой процессов при любом исходе, в том числе по таймауту.
//
// Запуск на сервере: ROUNDS=4 node scripts/probe/engine-bare.mjs

import { execSync, spawn } from "node:child_process"
import { firefox } from "playwright-core"

const ENGINE = process.env.AI_BROWSER_ENGINE_DIR ?? "/opt/fractera/ai-browser-engine"
const ROUNDS = Number(process.env.ROUNDS ?? 4)
const HEAVY = ["https://developer.mozilla.org/en-US/docs/Web/HTML", "https://todomvc.com/examples/react/dist/", "https://en.wikipedia.org/wiki/Web_browser"]
const LIGHT = ["https://example.com/", "http://httpbin.org/html", "https://www.iana.org/help/example-domains"]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const child = spawn("xvfb-run", ["-a", `${ENGINE}/venv/bin/python`, "-m", "camoufox", "server"], {
  detached: true,
  env: { ...process.env, PYTHONUNBUFFERED: "1", XDG_CACHE_HOME: `${ENGINE}/cache` },
  stdio: ["ignore", "pipe", "pipe"],
})
const cleanup = () => {
  try {
    process.kill(-child.pid, "SIGTERM")
  } catch { /* уже погас */ }
}
process.on("exit", cleanup)
setTimeout(() => {
  console.log("✗ общий таймаут прибора")
  cleanup()
  process.exit(2)
}, 40 * 60_000).unref()

const ws = await new Promise((resolve) => {
  let tail = ""
  const on = (b) => {
    tail += b.toString().replace(/\[[0-9;]*m/g, "")
    const m = tail.match(/wss?:\/\/\S+/)
    if (m) resolve(m[0])
  }
  child.stdout.on("data", on)
  child.stderr.on("data", on)
  setTimeout(() => resolve(null), 90_000)
})
if (!ws) {
  console.log("✗ голый движок не назвал адрес за 90 с")
  process.exit(1)
}
const bareParentCpu = () => {
  try {
    const pids = execSync(`pgrep -P ${child.pid} -f . || true`).toString().trim()
    const all = execSync("ps -eo pid,ppid,pcpu,args").toString().split("\n")
    const mine = new Set([String(child.pid)])
    let grew = true
    while (grew) {
      grew = false
      for (const l of all) {
        const [pid, ppid] = l.trim().split(/\s+/)
        if (mine.has(ppid) && !mine.has(pid)) {
          mine.add(pid)
          grew = true
        }
      }
    }
    const parent = all.find((l) => l.includes("camoufox-bin -no-remote") && mine.has(l.trim().split(/\s+/)[0]))
    return parent ? parent.trim().split(/\s+/)[2] : `? ${pids.length}`
  } catch {
    return "?"
  }
}

const b = await firefox.connect(ws, { timeout: 30_000 })
console.log(`===ENGINE_BARE=== ws ok, rounds=${ROUNDS} (служба работает рядом — поправка к CPU)`)

const open = async (url) => {
  const t0 = Date.now()
  const ctx = await b.newContext()
  const page = await ctx.newPage()
  try {
    await page.goto(url, { timeout: 45_000, waitUntil: "domcontentloaded" })
    await page.waitForLoadState("load", { timeout: 25_000 }).catch(() => {})
    return { ok: true, ms: Date.now() - t0 }
  } catch (e) {
    return { hang: page.url() === "about:blank", ms: Date.now() - t0, ok: false, why: String(e.message).split("\n")[0].slice(0, 80) }
  } finally {
    await ctx.close().catch(() => {})
  }
}

let hangs = 0
let lightFailed = 0
let streak = 0
for (let round = 1; round <= ROUNDS; round++) {
  const t0 = Date.now()
  const heavy = await Promise.all(HEAVY.map(open))
  const light = []
  let roundHangs = 0
  for (const u of LIGHT) {
    const r = await open(u)
    if (!r.ok) lightFailed += 1
    if (r.hang) roundHangs += 1
    light.push(`${r.ok ? "ok" : r.hang ? "HANG" : "fail"}/${r.ms}`)
  }
  hangs += roundHangs
  await sleep(5000)
  console.log(`round ${round}: heavy ${heavy.filter((x) => x.ok).length}/3 ${Date.now() - t0} мс · light ${light.join(" ")} · bare_parent_cpu_idle=${bareParentCpu()}%`)
  streak = roundHangs === LIGHT.length ? streak + 1 : 0
  if (streak >= 2) {
    console.log("  🛑 два круга подряд все лёгкие зависли — остановка")
    break
  }
}
console.log(`BARE_SUMMARY hangs=${hangs} light_failed=${lightFailed}`)
await b.close().catch(() => {})
cleanup()
await sleep(2000)
console.log(hangs === 0 && lightFailed === 0 ? "✓ OK (голый движок не зависает)" : "✗ FAILED (голый движок зависает или падает)")
process.exit(hangs === 0 && lightFailed === 0 ? 0 : 1)
