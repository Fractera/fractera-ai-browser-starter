// @api ключ доступа внешних инструментов к ИИ-браузеру: посмотреть маску и родить новый
import { NextResponse } from "next/server"
import { maskKey, readKey, rotateKey } from "@/lib/api-key.mjs"
import { fracteraSession } from "@/lib/fractera/session"

// ДВЕРЬ КЛЮЧА (185 памяти, переименована в 196-5).
//
// 🪦 ЗДЕСЬ ЖИЛА `app/api/fractera/memory-key` — имя унаследовано копией службы памяти. Ключ давно свой
// (`/etc/fractera/ai-browser-api-key`, приставка `fab_`), и дверь с именем чужой службы вводила бы в заблуждение того, кто
// читает сеть браузера.
// 🔒 ЗАМОК — СЕССИЯ ЧЕЛОВЕКА, РОЛЬ `architect`: куки → служба входа `:3001` → `{email, roles}`. Имя двери стоит в
// `SELF_GUARDED` привратника, иначе истёкшая сессия получала бы переадресацию вместо 401.
// 🔒 `GET` НИКОГДА НЕ ОТДАЁТ КЛЮЧ ЦЕЛИКОМ, ТОЛЬКО МАСКУ. Полное значение — ровно один раз, в ответе на `POST`.
// 🛑 `POST` — ЭТО И РОЖДЕНИЕ, И ОТЗЫВ ОДНОВРЕМЕННО, и это сказано на экране словами до нажатия.
// 🛑 `runtime` И `dynamic` НЕ ОБЪЯВЛЯЮТСЯ: `cacheComponents` их отвергает.

async function guard() {
  const session = await fracteraSession()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  if (!session.roles.includes("architect")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  return null
}

export async function GET() {
  const denied = await guard()
  if (denied) return denied

  const key = readKey()
  return NextResponse.json(
    { exists: Boolean(key), masked: maskKey(key), ok: true },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export async function POST() {
  const denied = await guard()
  if (denied) return denied

  try {
    const key = rotateKey()
    return NextResponse.json(
      { key, masked: maskKey(key), ok: true },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (e) {
    // 🛑 ОТКАЗ ЗАПИСИ НАЗЫВАЕТСЯ ПРИЧИНОЙ: чаще всего это права на файл, и человеку надо знать именно это.
    return NextResponse.json(
      { error: "key-not-written", ok: false, why: String((e as Error).message).slice(0, 200) },
      { status: 500 }
    )
  }
}
