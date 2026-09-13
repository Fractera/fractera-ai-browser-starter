// @api стенд «Тест чтения»: человек проверяет браузер глазами — дверь зовёт договор `/v1/read` по петле
import { NextResponse } from "next/server"
import { machineEnv } from "@/lib/fractera/machine-env"
import { fracteraSession } from "@/lib/fractera/session"

// ДВЕРЬ СТЕНДА ЧТЕНИЯ (196-3).
//
// 🔒 ВТОРОГО ПУТИ ЧТЕНИЯ НЕТ: дверь не открывает браузер сама, а зовёт тот же договор `/v1/read`, что и чужие программы.
// Стенд, читающий страницы своим путём, проверял бы себя, а не службу.
// 🔒 ЗАМОК — СЕССИЯ ЧЕЛОВЕКА С РОЛЬЮ `architect`; дальше по петле дверь идёт с секретом машины. Ключ службы в браузер
// человека не уезжает.
// 🔒 ЭКРАНУ ОТДАЁТСЯ НАЧАЛО HTML И ТЕКСТА, А ДЛИНЫ — ЦЕЛИКОМ: десять страниц по 5 МБ в браузер человека — это зависшая
// вкладка, а не проверка. Полное значение по-прежнему видно в `html_length`/`text_length`.
// 🛑 `runtime` И `dynamic` НЕ ОБЪЯВЛЯЮТСЯ: `cacheComponents` их отвергает.

const PREVIEW_CHARS = 20_000

export async function POST(request: Request) {
  const session = await fracteraSession()
  if (!session) return NextResponse.json({ error: "unauthorized", ok: false }, { status: 401 })
  if (!session.roles.includes("architect")) return NextResponse.json({ error: "forbidden", ok: false }, { status: 403 })

  let body: { urls?: unknown }
  try {
    body = (await request.json()) as { urls?: unknown }
  } catch {
    return NextResponse.json({ error: "bad-json", ok: false }, { status: 400 })
  }

  const secret = process.env.DATA_SECRET || machineEnv("DATA_SECRET")
  if (!secret) return NextResponse.json({ error: "no-machine-secret", ok: false }, { status: 500 })

  try {
    const r = await fetch(`http://127.0.0.1:${process.env.PORT ?? 3800}/v1/read`, {
      body: JSON.stringify({ urls: body.urls }),
      cache: "no-store",
      headers: { "content-type": "application/json", "x-data-secret": secret },
      method: "POST",
    })
    // 🔒 ОТВЕТ ЧИТАЕТСЯ ЦЕЛИКОМ, А НЕ ПО КОДУ: отказ договора приходит телом с `error`, и экран обязан его назвать.
    const j = (await r.json()) as { results?: Array<Record<string, unknown>> }
    if (Array.isArray(j.results)) {
      j.results = j.results.map((x) => ({
        ...x,
        html: typeof x.html === "string" ? x.html.slice(0, PREVIEW_CHARS) : x.html,
        text: typeof x.text === "string" ? x.text.slice(0, PREVIEW_CHARS) : x.text,
      }))
    }
    return NextResponse.json(j, { headers: { "Cache-Control": "no-store" }, status: r.status })
  } catch (e) {
    return NextResponse.json(
      { error: "service-unreachable", ok: false, why: String((e as Error).message).slice(0, 200) },
      { status: 502 },
    )
  }
}
