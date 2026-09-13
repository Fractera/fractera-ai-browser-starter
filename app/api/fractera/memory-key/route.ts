// @api ключ доступа внешних инструментов к памяти: посмотреть маску и родить новый
import { NextResponse } from "next/server"
import { maskKey, readKey, rotateKey } from "@/lib/api-key.mjs"
import { fracteraSession } from "@/lib/fractera/session"

// ДВЕРЬ КЛЮЧА (185).
//
// 🔒 ЗАМОК — СЕССИЯ ЧЕЛОВЕКА, РОЛЬ `architect`, тем же конвейером, что у стенда
// и у карточек ключей: куки → служба входа `:3001` → `{email, roles}`. Ключ,
// который можно родить без входа, — это не ключ, а дверь нараспашку.
//
// 🔒 `GET` НИКОГДА НЕ ОТДАЁТ КЛЮЧ ЦЕЛИКОМ, ТОЛЬКО МАСКУ. Полное значение
// возвращается ровно один раз — в ответе на `POST`, то есть тому, кто сам его
// сейчас породил. Ключ, который видно на экране в любой момент, перестаёт быть
// секретом: его подсмотрят на чужом экране, в записи демонстрации, на скриншоте
// в переписке.
//
// 🛑 `POST` — ЭТО И РОЖДЕНИЕ, И ОТЗЫВ ОДНОВРЕМЕННО, И ЭТО СКАЗАНО НА ЭКРАНЕ
// СЛОВАМИ. Прежний ключ перестаёт работать в тот же миг; интеграция, собранная
// на нём, ломается. Отдельной кнопки «отозвать» нет намеренно — она означала бы
// ровно то же действие вторым именем.
//
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
      // 🔒 ПОЛНЫЙ КЛЮЧ ЕДЕТ ТОЛЬКО ЗДЕСЬ И ТОЛЬКО СЕЙЧАС. Второй возможности
      // его увидеть не будет — об этом на экране написано ДО нажатия, а не
      // после.
      { key, masked: maskKey(key), ok: true },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (e) {
    // 🛑 ОТКАЗ ЗАПИСИ НАЗЫВАЕТСЯ ПРИЧИНОЙ, А НЕ «НЕ ПОЛУЧИЛОСЬ»: чаще всего это
    // права на файл, и человеку надо знать именно это.
    return NextResponse.json(
      { error: "key-not-written", ok: false, why: String((e as Error).message).slice(0, 200) },
      { status: 500 }
    )
  }
}
