// ДВИЖОК БРАУЗЕРА — `xvfb-run -a python -m camoufox server`, ДОЧЕРНИМ ПРОЦЕССОМ СЛУЖБЫ (шаг 196-2).
//
// 🔒 ПОЧЕМУ ДОЧЕРНИМ, А НЕ ОТДЕЛЬНЫМ ПРОЦЕССОМ PM2 (отступление от плана, оплачено замером 196-1): адрес движка
// `ws://[::1]:<порт>/<путь>` случайный при каждом запуске и есть только в его выводе. Соседний процесс pm2 мог бы узнать его
// лишь разбором чужого файла лога — хрупко и с гонкой. Здесь служба сама запускает движок, читает адрес из потока и знает,
// жив ли он.
// 🔒 `xvfb-run` ОБЯЗАТЕЛЕН: у `camoufox server` нет параметров, и он запускает браузер с окном; без дисплея —
// `no DISPLAY environment variable specified`.
// 🔒 ГРУППА ПРОЦЕССОВ ГАСНЕТ ЦЕЛИКОМ: движок порождает Xvfb, Python и семь процессов браузера (~650 МБ). Запуск `detached`
// даёт свою группу, остановка шлёт сигнал всей группе, а при старте службы гасятся сироты прошлого запуска этого же дерева.

import { execFileSync, spawn } from "node:child_process"
import { join } from "node:path"

const ROOT = process.env.AI_BROWSER_ROOT ?? process.cwd()
// 🔒 ОКРУЖЕНИЕ И КЭШ БРАУЗЕРА — РЯДОМ СО СЛУЖБОЙ, А НЕ ВНУТРИ НЕЁ (196-2, оплачено упавшей сборкой). Внутри дерева Next
// трассировщик Turbopack обходит `engine/venv` и падает с паникой на ссылке `bin/python3 → /usr/bin`: «Symlink … is invalid,
// it points out of the filesystem root».
const ENGINE_DIR = process.env.AI_BROWSER_ENGINE_DIR ?? join(ROOT, "..", "ai-browser-engine")
const PYTHON = join(ENGINE_DIR, "venv", "bin", "python")
const CACHE = join(ENGINE_DIR, "cache")
const START_TIMEOUT_MS = 90_000
const RESTART_DELAY_MS = 5_000

const state = {
  endpoint: null,
  lastError: null,
  pid: null,
  restarts: 0,
  startedAt: null,
  status: "stopped",
}
let child = null
let stopping = false

// ANSI-цвета вокруг адреса — движок печатает его подсвеченным.
const stripAnsi = (s) => s.replace(/\[[0-9;]*m/g, "")

/** Погасить движки прошлого запуска этого же дерева: сирота держит ~650 МБ и ничем не отвечает. */
function killOrphans() {
  try {
    execFileSync("pkill", ["-f", `${PYTHON} -m camoufox server`], { stdio: "ignore" })
  } catch { /* сирот нет — pkill вернул 1 */ }
  try {
    execFileSync("pkill", ["-f", `${CACHE}/camoufox`], { stdio: "ignore" })
  } catch { /* сирот нет */ }
}

export function engineState() {
  return { ...state }
}

export function endpoint() {
  return state.status === "up" ? state.endpoint : null
}

export function startEngine() {
  if (child) return
  stopping = false
  state.status = "starting"
  state.endpoint = null
  state.startedAt = new Date().toISOString()
  child = spawn("xvfb-run", ["-a", PYTHON, "-m", "camoufox", "server"], {
    cwd: ROOT,
    detached: true,
    env: { ...process.env, PYTHONUNBUFFERED: "1", XDG_CACHE_HOME: CACHE },
    stdio: ["ignore", "pipe", "pipe"],
  })
  state.pid = child.pid
  let tail = ""
  const onData = (buf) => {
    const text = stripAnsi(buf.toString())
    tail = (tail + text).slice(-4000)
    const m = text.match(/wss?:\/\/\S+/)
    if (m && state.status !== "up") {
      state.endpoint = m[0]
      state.status = "up"
      state.lastError = null
    }
  }
  child.stdout.on("data", onData)
  child.stderr.on("data", onData)
  const timer = setTimeout(() => {
    if (state.status !== "up") {
      state.lastError = `движок не назвал адрес за ${START_TIMEOUT_MS / 1000} с: ${tail.slice(-300)}`
      stopEngine()
    }
  }, START_TIMEOUT_MS)
  child.on("exit", (code, signal) => {
    clearTimeout(timer)
    child = null
    state.pid = null
    state.endpoint = null
    state.status = "stopped"
    if (!stopping) {
      state.lastError = state.lastError ?? `движок завершился: code=${code} signal=${signal}; ${tail.slice(-300)}`
      state.restarts += 1
      setTimeout(startEngine, RESTART_DELAY_MS)
    }
  })
}

export function stopEngine() {
  stopping = true
  if (!child) return
  try {
    process.kill(-child.pid, "SIGTERM")
  } catch { /* группа уже погасла */ }
}

/** Вызвать при старте службы: убрать сирот и поднять движок. */
export function bootEngine() {
  killOrphans()
  startEngine()
  const shutdown = () => {
    stopEngine()
    setTimeout(() => process.exit(0), 1500)
  }
  process.once("SIGINT", shutdown)
  process.once("SIGTERM", shutdown)
}
