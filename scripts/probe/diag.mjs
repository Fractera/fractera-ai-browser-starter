#!/usr/bin/env node
// ДИАГНОСТИКА ЗАВИСАНИЯ СТРАНИЦЫ (196-3): адреса открываются ПО ОДНОМУ, у отказа печатается трасса — адрес страницы в момент
// отказа, последние запросы с состоянием и журнал прокси. Прибор ничего не утверждает, он показывает.
//
// Запуск на сервере: node scripts/probe/diag.mjs <адрес> [<адрес> …]

import { readFileSync } from "node:fs"

const BASE = process.env.AI_BROWSER_URL ?? "http://127.0.0.1:3800"
let SECRET = process.env.DATA_SECRET ?? ""
try {
  SECRET ||= (readFileSync("/etc/fractera/secrets.env", "utf8").match(/^DATA_SECRET=(.+)$/m) ?? [])[1]?.trim() ?? ""
} catch { /* вне сервера */ }

for (const url of process.argv.slice(2)) {
  const t0 = Date.now()
  const r = await fetch(`${BASE}/v1/read`, {
    body: JSON.stringify({ urls: [url] }),
    headers: { "Content-Type": "application/json", "x-data-secret": SECRET },
    method: "POST",
  })
  const p = (await r.json().catch(() => ({}))).results?.[0] ?? {}
  console.log(`=== ${url} → ${p.error ?? "ok"} ${p.why ?? ""} · код ${p.status} · текст ${p.text_length} · ${Date.now() - t0} мс`)
  if (p.trace) {
    console.log(`  page_url ${p.trace.page_url}`)
    for (const q of p.trace.requests) console.log(`  req ${q.state} ${q.ms}ms ${q.type} ${q.url}${q.failure ? " ✗ " + q.failure : ""}`)
    for (const e of p.trace.egress) console.log(`  egress ${e.kind} ${e.ms}ms ${e.target} → ${e.outcome}`)
  }
}
