#!/usr/bin/env node
//
// СТОРОЖ ДОГОВОРА: он обязан оставаться единственным источником и быть годным
// к употреблению снаружи.
//
// 🔒 ЗАЧЕМ ОН ЕСТЬ УЖЕ СЕЙЧАС, ПРИ НУЛЕ МЕТОДОВ. Сторож, заведённый после
// первого нарушения, приходит поздно: к тому моменту нарушение уже
// называется «как у нас принято». Этот стоит до первой строки логики.
//
// ✗ ЧЕМ ОПЛАЧЕН ЕГО ГЛАВНЫЙ ПУНКТ — ПРОВЕРКА ТИПОВ. 2026-09-09 наш внутренний
// псевдотип `value` уехал в JSON Schema инструмента агента. API Anthropic
// отверг инструмент целиком, привратник исключил `memory_write` и
// `memory_mutate` из каждой сессии — и это было невидимо СУТКИ: `tools/list`
// показывал все двенадцать, дверь отвечала `ok:true`, типы и сборка зелёные.
// 🔒 ЗАКОН ШИРЕ СЛУЧАЯ: у инструмента для модели есть ТРЕТЬЯ сторона, и её
// ответ надо измерять отдельно. Здесь мы ловим причину до того, как она до неё
// доедет.

import { contract, CONTRACT_VERSION, METHODS } from "../contract.mjs"

// Простые типы JSON Schema. Ничего сверх этого списка в договоре стоять не может.
const ALLOWED = new Set(["array", "boolean", "integer", "null", "number", "object", "string"])

let bad = 0
const fail = (why) => {
  console.log("🛑 " + why)
  bad += 1
}

if (!/^\d+\.\d+\.\d+$/.test(CONTRACT_VERSION)) {
  fail(`версия договора «${CONTRACT_VERSION}» не по semver — потребитель не сможет объяснить свой отказ`)
}

const seen = new Set()
for (const m of METHODS) {
  if (!m || typeof m.name !== "string" || !m.name) {
    fail("метод без имени: снаружи его нельзя ни позвать, ни назвать в отказе")
    continue
  }
  if (seen.has(m.name)) fail(`метод «${m.name}» объявлен дважды — вторая копия победит молча`)
  seen.add(m.name)

  // 🔒 «КОГДА ЗВАТЬ» ОБЯЗАТЕЛЬНО, И ЭТО НЕ ВЕЖЛИВОСТЬ. Метод без этого поля
  // читает модель, и она решает по имени — то есть угадывает.
  if (!m.about) fail(`метод «${m.name}» не говорит, КОГДА его звать`)
  if (!m.returns) fail(`метод «${m.name}» не говорит, что вернёт`)
  if (!m.onMiss) fail(`метод «${m.name}» не говорит, что будет при промахе`)

  for (const p of m.params ?? []) {
    if (!p || !p.name) { fail(`у «${m.name}» параметр без имени`); continue }
    if (!p.about) fail(`у «${m.name}» параметр «${p.name}» без объяснения`)
    const list = Array.isArray(p.type) ? p.type : [p.type]
    for (const one of list) {
      if (ALLOWED.has(one)) continue
      fail(
        `у «${m.name}» параметр «${p.name}» имеет тип «${String(one)}» — это не тип JSON Schema. ` +
          `Привратник исключит инструмент МОЛЧА, и агент его не увидит.`,
      )
    }
  }
}

// 🔒 ДОГОВОР ОБЯЗАН БЫТЬ СЕРИАЛИЗУЕМ: его отдают по HTTP, и то, что не
// переживает JSON, снаружи не существует.
try {
  JSON.parse(JSON.stringify(contract()))
} catch (e) {
  fail("договор не переживает JSON: " + e.message)
}

if (bad === 0) {
  console.log(`✓ договор годен: версия ${CONTRACT_VERSION}, методов ${METHODS.length}`)
  process.exit(0)
}
process.exit(1)
