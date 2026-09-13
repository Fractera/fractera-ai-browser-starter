// СЛОВА, КОТОРЫЕ ПАМЯТЬ ГОВОРИТ ЧЕЛОВЕКУ, — НА ДВУХ ЯЗЫКАХ (181-10).
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-10, ДОСЛОВНО: «информация о таких ошибках у тебя
// возвращается без использования искусственного интеллекта, так как наши
// приложения мультиязычные это информация об ошибках в данный момент должна
// поддерживать два языка и в будущем должна быть масштабированных до 82».
//
// 🔒 КОД ОТКАЗА — ВЕЧНЫЙ, СЛОВА — ПЕРЕВОДИМЫЕ. Наружу всегда едут ОБА: `refusal`
// (или `error`) читает машина, `what_happened` читает человек. Переведи мы код —
// сломались бы приборы и агент; оставь мы одни слова — переводить было бы нечего.
//
// 🔒 ЯЗЫК ПРИХОДИТ ПАРАМЕТРОМ ВЫЗОВА, А НЕ УГАДЫВАЕТСЯ СЛУЖБОЙ. Память не знает,
// кто её зовёт и на каком языке говорит человек по ту сторону: у бота свой язык,
// у страницы — свой, у прибора никакого. Спрашивающий знает — он и говорит.
//
// 🔒 УМОЛЧАНИЕ — РУССКИЙ, И ЭТО СОХРАНЕНИЕ ПОВЕДЕНИЯ, А НЕ ВЫБОР ЯЗЫКА ПРОЕКТА.
// До этого шага все ответы были русскими; сделай мы умолчанием английский, бот
// заговорил бы с владельцем по-английски МОЛЧА, ничего не сломав. Неизвестный
// язык падает на английский — тот же закон, что у словарей экранов.
//
// 🔒 КАК ЭТО ДОРАСТЁТ ДО 82 ЯЗЫКОВ: сюда добавляются ветки с теми же ключами —
// файлом от внешней модели, как везде в проекте. Ни один код при этом не
// меняется, и ни одна строка кода не правится: `say()` берёт ветку по имени.
// 🛑 ПРОПУЩЕННЫЙ КЛЮЧ НЕ ПАДАЕТ И НЕ МОЛЧИТ: он деградирует до английского, а
// затем до самого кода. Код на экране некрасив и честен — он говорит «перевода
// нет», а пустое место сказало бы «всё в порядке».

/** Язык по умолчанию, когда зовущий его не назвал. */
export const DEFAULT_LANG = "ru"

/** Язык, до которого деградирует незнакомый. */
const FALLBACK_LANG = "en"

export const WORDS = {
  en: {
    // ── отказы размышления: коды из `think.mjs` ──────────────────────────────
    "think-answer-unusable": "the model answered off-form — the phrase could not be parsed",
    "think-cli-missing": "there is no Claude Code on this machine: without it memory does not think",
    "think-not-authorized": "Claude Code is not signed in — sign in with the subscription on the server",
    "think-quota-exhausted": "the subscription window is used up — memory will think again once it renews",
    "think-subscription-disabled":
      "the organisation has disabled Claude Code subscription access: enable it in the organisation settings or give the machine an Anthropic key",
    "think-thread-unknown": "that thread of reasoning no longer exists: ask again without the identifier, and memory will start a new one",
    "think-timed-out": "the model did not answer within the time given",
    "think-unreachable": "the model is unreachable",

    // ── отказы на входе и в хранилище ────────────────────────────────────────
    "need-who-and-text": "the call was rejected at the door: both «who» and «what was said» are required",
    "need-who": "the call was rejected: it does not say who is being asked about",
    "store-unreachable": "the store is unreachable",
    "columns-unreadable": "could not read what is already there",
    "read-failed": "could not read",
    "journal-clear-failed": "the journal could not be cleared — it is left as it was",

    // ── отказы самой двери: они случаются РАНЬШЕ глагола (181-10) ──────────
    "bad-json": "the request body is not JSON — memory was not called",
    "missing-params": "required fields are missing: {names}",
    "no-access": "access denied: this door needs the machine secret",
    "inside-memory": "something failed inside memory — the call did not go through",
    "not-built": "the contract does not declare such a method: methods are added one at a time, deliberately",
    "unsafe-name": "that name is not allowed",

    // ── честные «ничего не нашлось»: не ошибки, но тоже слова человеку ───────
    "no-facts-in-phrase": "there are no facts about the person in this phrase",
    "nothing-known": "nothing is written down about this person",
    "no-exact-match": "nothing matches the question exactly — here is everything that is known",
    "known-count": "known: {n}",
    "journal-entries": "the journal holds {n} entries",
    "journal-empty": "the journal is empty: memory has done nothing since it was last cleared",
    "journal-cleared":
      "entries erased: {n}. Knowledge about people is untouched — only the story of the work is forgotten",
    "journal-was-empty": "the journal was empty anyway",
  },
  ru: {
    "think-answer-unusable": "модель ответила не по форме — разобрать фразу не удалось",
    "think-cli-missing": "на этой машине нет Claude Code: без него память не думает",
    "think-not-authorized": "Claude Code не авторизован — нужно войти подпиской на сервере",
    "think-quota-exhausted": "окно подписки исчерпано — память сможет думать после его обновления",
    "think-subscription-disabled":
      "организация отключила доступ Claude Code по подписке: нужно включить его в настройках организации либо дать машине ключ Anthropic",
    "think-thread-unknown": "такой нити размышления больше нет: спросите заново без идентификатора — память начнёт новую",
    "think-timed-out": "модель не ответила за отведённое время",
    "think-unreachable": "модель недоступна",

    "need-who-and-text": "вызов отвергнут на входе: нужны и «кто», и «что сказано»",
    "need-who": "вызов отвергнут: не сказано, о ком спрашивают",
    "store-unreachable": "хранилище недоступно",
    "columns-unreadable": "не удалось прочитать, что уже заведено",
    "read-failed": "не удалось прочитать",
    "journal-clear-failed": "журнал не удалось очистить — он остался как был",

    "bad-json": "тело запроса — не JSON, до памяти не дошло",
    "missing-params": "не хватает обязательных полей: {names}",
    "no-access": "доступ закрыт: этой двери нужен секрет машины",
    "inside-memory": "внутри памяти случился отказ — вызов не прошёл",
    "not-built": "такого метода договор не объявляет: методы наполняются по одному, осознанно",
    "unsafe-name": "такое имя не допускается",

    "no-facts-in-phrase": "в этой фразе фактов о человеке нет",
    "nothing-known": "о человеке не записано ничего",
    "no-exact-match": "точного совпадения с вопросом нет — вот всё, что известно",
    "known-count": "известно {n}",
    "journal-entries": "в журнале {n} записей",
    "journal-empty": "журнал пуст: с последней очистки память ничего не делала",
    "journal-cleared":
      "стёрто записей: {n}. Знание о людях не затронуто — забыт только рассказ о работе",
    "journal-was-empty": "журнал и так был пуст",
  },
}

/** Какие языки память умеет говорить сейчас. Прибор спрашивает это, а не список в тексте. */
export const LANGS = Object.keys(WORDS)

/**
 * Слова по коду.
 *
 * @param {string} code вечный код отказа или исхода
 * @param {string} [lang] язык зовущего; неизвестный деградирует до английского
 * @param {Record<string, string | number>} [vars] подстановки вида `{n}`
 */
export function say(code, lang, vars) {
  const branch = WORDS[lang ?? DEFAULT_LANG] ?? WORDS[FALLBACK_LANG]
  const text = branch[code] ?? WORDS[FALLBACK_LANG][code] ?? code
  if (!vars) return text
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.split(`{${k}}`).join(String(v)),
    text,
  )
}
