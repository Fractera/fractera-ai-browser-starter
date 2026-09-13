#!/usr/bin/env node
//
// fractera-memory — СЛУЖБА ПАМЯТИ ПЛАТФОРМЫ (процесс pm2, :3700).
//
// ═══ ЗАЧЕМ ОНА СУЩЕСТВУЕТ ОТДЕЛЬНО ═══════════════════════════════════════════
//
// 🔒 РЕШЕНИЕ ВЛАДЕЛЬЦА 2026-09-09, ДОСЛОВНО: «Я тебе и в предыдущих сессиях
// неоднократно говорил, что память должна быть отделена от агента гораздо
// сильнее. Отделена на физическом уровне… у тебя нету паттерна, что память —
// это чёрный ящик, который живёт своей жизнью, а не твоей и не жизнью агента.
// Я тебе сказал: это должно выглядеть, как будто мы обращаемся в облако Google —
// просто отправляем запрос, получаем результат, а что там происходит, не важно».
//
// ✗ ЧЕМ ОПЛАЧЕНО, ИЗМЕРЕНО В ТОТ ЖЕ ДЕНЬ. Прежняя память жила ВНУТРИ приложения
// бота: 5 997 строк (`lib/memory` 2305 + `lib/facts` 2458 + `lib/registry` 1234),
// и сервер инструментов агента импортировал её исходники ПО ФАЙЛОВОМУ ПУТИ.
// Это не вызов службы, а линковка. Через этот шов прошёл дефект, из-за которого
// `memory_write` был недостижим сутки. И через него же «запиши мой день
// рождения» стоило **278 секунд**: у памяти не было способа завести новый род
// значения, и работа вывалилась наружу — а снаружи она выразима только
// программированием (сборка, `sleep 60`, коммит — при цене операции 1.5 с).
//
// 🔒 ПОЧЕМУ СТРОИМ ЗАНОВО, А НЕ ПЕРЕНОСИМ. Я предлагал перенос; владелец
// отклонил, и его довод сильнее: «наша архитектура создавалась без видимого
// плана, в большей степени хаотично… если мы просто её перенесём, то получим
// старый план на новом месте». Дефекты оплачены ПРИНЦИПАМИ, а принципы
// переезжают пониманием, а не файлами.
//
// ═══ ЧЕМ ЭТА СЛУЖБА ОТЛИЧАЕТСЯ ОТ СОСЕДЕЙ ════════════════════════════════════
//
// Форма взята у `services/data` (:3300) и `services/geo` (:3400): один файл,
// свой порт, БЕЗ СБОРКИ. Отличие одно и намеренное — **ноль зависимостей**:
// сосед `geo` берёт express, здесь хватает `node:http`. Пакет, поставленный
// ради трёх маршрутов, — это ещё один способ не запуститься на чистой машине.
// Тот же довод уже записан в `intake-preloader.js` и там оправдался.
//
// 🔒 СЛУШАЕМ ТОЛЬКО ПЕТЛЮ — решение владельца 2026-09-09 на прямой вопрос.
// Как `data` и `geo`: зовут её процессы этого же сервера.
// 🛑 ПЕТЛЯ НЕ ОСЛАБЛЯЕТ ГРАНИЦУ. Граница здесь — граница ПРОЦЕССА, а не сети:
// импортировать через неё нельзя в принципе, кто бы куда ни ходил.
//
// 🔒 ЗАМОК — ОБЩИЙ СЕКРЕТ МАШИНЫ, А НЕ НОВЫЙ КЛЮЧ. Ключ, заведённый ради одной
// службы, надо кому-то выдавать, где-то хранить и когда-то менять; третье звено
// («учётные данные кем-то выдаются») тут же стало бы тупиком.

import { createServer, request as httpRequest } from "node:http"
import { existsSync, readFileSync } from "node:fs"
import next from "next"
// 🔒 МОСТ ТЕРМИНАЛА (180-1) — СКОПИРОВАН С СЕРВЕРА ЧАТА, А НЕ НАПИСАН ЗАНОВО.
// Решение владельца 2026-09-10: «точка входа в подписку должна быть не одна…
// так как у нас уже это сделано в чате, то тебе просто перенести это всё».
// Вход в подписку Claude у чата идёт через терминал в браузере: `claude auth
// login` печатает ссылку и ждёт код. Учётка одна на весь сервер (`/root/.claude`),
// поэтому вход, сделанный отсюда, действует и для чата.
import { WebSocketServer } from "ws"
import { claudeAuthState, claudeBin } from "./lib/fractera/claude-cli.mjs"
import { redeemPtyTicket } from "./lib/fractera/pty-ticket.mjs"
import { contract, CONTRACT_VERSION, METHODS, SERVICE } from "./contract.mjs"
// 🔒 СЛОВА ОТКАЗОВ — ИЗ ОДНОГО СЛОВАРЯ НА ВСЮ СЛУЖБУ (181-10): дверь и глаголы
// говорят человеку одними и теми же фразами, и переводятся они в одном месте.
import { say } from "./lib/words.mjs"
import { people, remember, recall } from "./lib/verbs.mjs"
import { forget_journal, journal } from "./lib/journal-verbs.mjs"
import { find_objects, open_object } from "./lib/object-verbs.mjs"
// 🪦 `lib/page.mjs` БОЛЬШЕ НЕ ИМПОРТИРУЕТСЯ — страница журнала на голом Node
// уехала на защищённый маршрут Next (178-6). Файл оставлен на диске: он ещё
// пригодится тому, кто захочет служебный экран без фреймворка, и восстановить
// его импорт дешевле, чем написать заново.
// 🪦 `lib/session.mjs` — там же и по той же причине: его звала только страница
// журнала. Проверку сессии для Next делает `lib/session-http.ts`.
import { describeTable, listTables, nameQuality } from "./lib/catalogue.mjs"
import { isSafeName } from "./lib/naming.mjs"
// 🔒 КЛЮЧ ВНЕШНИХ ИНСТРУМЕНТОВ ЧИТАЕТСЯ С ДИСКА НА КАЖДОМ ЗАПРОСЕ (185): новый
// ключ начинает работать сразу, без перезапуска службы. Иначе кнопка «отозвать»
// не отзывала бы ничего до ближайшего `pm2 reload`.
import { keyMatches } from "./lib/api-key.mjs"

const PORT = Number(process.env.PORT ?? 3700)
const HOST = process.env.MEMORY_HOST ?? "127.0.0.1"
const MACHINE_ENV = process.env.FRACTERA_MACHINE_ENV ?? "/etc/fractera/secrets.env"
const STARTED_AT = new Date().toISOString()

/** Значение из файла секретов машины. Нет файла — законное состояние вне сервера. */
function machineEnv(name) {
  try {
    for (const line of readFileSync(MACHINE_ENV, "utf8").split("\n")) {
      const i = line.indexOf("=")
      if (i > 0 && line.slice(0, i).trim() === name) {
        return line.slice(i + 1).trim().replace(/^["']|["']$/g, "")
      }
    }
  } catch {
    // файла нет — на машине разработчика это нормально
  }
  return ""
}

const SECRET = process.env.DATA_SECRET || machineEnv("DATA_SECRET")

function send(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(text),
    "content-type": "application/json; charset=utf-8",
  })
  res.end(text)
}

/**
 * 🔒 `health` ОТКРЫТ, ОСТАЛЬНОЕ ПОД ЗАМКОМ, И ЭТО НЕ НЕДОСМОТР.
 * Проверку живости зовут установщик и сторож, у которых секрета может не быть;
 * а сказать «я жива» — не значит выдать хоть что-то о человеке.
 */
function allowed(req, path) {
  if (path === "/v1/health") return true
  // 🔒 ЗАМОК СЕКРЕТА МАШИНЫ СТЕРЕЖЁТ ТОЛЬКО ДОГОВОР, И ЭТО ИСПРАВЛЕНО ЖИВЫМ
  // ЗАМЕРОМ 2026-09-10 (178-2). ✗ Пока проверка стояла на ВСЁМ, страница
  // `/ru/settings` и дверь стенда получали `401 no-access` от голого сервера и
  // до Next не доходили вовсе — то есть построенная страница была недостижима,
  // а выглядело это как отказ доступа.
  // 🛑 ПРИРОДА ЗАМКОВ РАЗНАЯ, И В ЭТОМ ВСЯ СУТЬ. `/v1/*` зовут ПРОЦЕССЫ — у них
  // есть секрет машины и нет кук. Страницы открывает ЧЕЛОВЕК — у него есть куки
  // и нет секрета. Один замок на обоих закрывает дверь тому, для кого её строили.
  if (!path.startsWith("/v1/")) return true
  // 🔒 ДВА КЛЮЧА, ДВА РАЗНЫХ ПРЕДЪЯВИТЕЛЯ (185). Секрет машины `DATA_SECRET` —
  // для СВОИХ процессов на этом сервере; ключ памяти `x-memory-key` — для
  // ЧУЖИХ инструментов снаружи. Разница не в силе, а в отзыве: чужой ключ
  // отзывается одной кнопкой и касается только памяти, а секрет машины отозвать
  // нельзя, не сломав половину сервера.
  // 🔒 `Authorization: Bearer <ключ>` принимается наравне: так его шлёт всё, что
  // умеет HTTP, и требовать своё имя заголовка значило бы усложнять жизнь
  // каждому клиенту ради нашего вкуса.
  const bearer = String(req.headers.authorization ?? "").replace(/^Bearer\s+/i, "")
  if (keyMatches(req.headers["x-memory-key"]) || keyMatches(bearer)) return true
  if (!SECRET) return false
  return req.headers["x-data-secret"] === SECRET
}

/** Тело запроса. Кривой JSON — законный отказ, а не падение службы. */
function readBody(req) {
  return new Promise((resolve) => {
    let raw = ""
    req.on("data", (d) => { raw += d; if (raw.length > 1e6) req.destroy() })
    req.on("end", () => {
      try { resolve(JSON.parse(raw || "{}")) } catch { resolve(null) }
    })
    req.on("error", () => resolve(null))
  })
}

// 🔒 ИСПОЛНИТЕЛИ ЗОВУТСЯ ПО ИМЕНИ ИЗ ДОГОВОРА, А НЕ ПО СПИСКУ В МАРШРУТИЗАТОРЕ.
// Второй список разошёлся бы с договором молча — в проекте это оплачено
// четырежды за три дня.
const RUN = { find_objects, forget_journal, journal, open_object, people, recall, remember }

/**
 * Провести тело договора во внутреннюю дверь (194-15).
 *
 * 🔒 ПОЧЕМУ НЕ `RUN`: исполнители `RUN` получают разобранный JSON до 1 МБ (`readBody`), а объект —
 * файл до 200 МБ телом multipart. И логика объектов живёт в `.ts` под Next, которого этот файл не
 * импортирует. Поэтому тело течёт ПОТОКОМ по петле в дверь `/api/fractera/<door>` с секретом машины —
 * тем же путём, каким ходят руки агента: у стенда, агента и договора один путь записи.
 * 🔒 `node:http`, А НЕ `fetch`: у `fetch` предел ожидания заголовков 300 с, а описание видео моделью
 * само может занять столько же. Внутри своего процесса ограничивать нечем и незачем.
 */
function passToDoor(req, res, door) {
  if (!SECRET) {
    return send(res, 503, { error: "no-machine-secret", ok: false, what_happened: say("inside-memory") })
  }
  const type = String(req.headers["content-type"] ?? "")
  // 🔒 С 194-16 ТЕЛ ДВА: форма с файлом или JSON с `url` — тогда файл скачивает сама память. Остальное дверь не
  // понимает, и отказ звучит до того, как тело пойдёт по петле.
  const lower = type.toLowerCase()
  if (!lower.startsWith("multipart/form-data") && !lower.startsWith("application/json")) {
    return send(res, 400, {
      error: "unsupported-body",
      ok: false,
      why: "keep_object принимает multipart/form-data с файлом в части file или application/json с url",
    })
  }
  const headers = { "content-type": type, "x-data-secret": SECRET }
  if (req.headers["content-length"]) headers["content-length"] = req.headers["content-length"]
  const up = httpRequest(
    { headers, host: "127.0.0.1", method: "POST", path: `/api/fractera/${door}`, port: PORT },
    (answer) => {
      res.writeHead(answer.statusCode ?? 502, {
        "cache-control": "no-store",
        "content-type": answer.headers["content-type"] ?? "application/json; charset=utf-8",
      })
      answer.pipe(res)
    },
  )
  up.on("error", (e) => {
    if (res.headersSent) return res.destroy()
    send(res, 502, { error: "inside-memory", ok: false, what_happened: say("inside-memory"), why: String(e.message).slice(0, 200) })
  })
  req.pipe(up)
}

// 🪦 `sendHtml()` УДАЛЁН ВМЕСТЕ СО СТРАНИЦЕЙ ЖУРНАЛА (178-6): страницы теперь
// отдаёт Next, и второй способ печатать HTML здесь стал бы приглашением
// завести служебный экран мимо общей раскладки.
// ── NEXT РЯДОМ С ДОГОВОРОМ (178-1) ──────────────────────────────────────────
//
// 🔒 ОБРАЗЕЦ ВЗЯТ У СЛУЖБЫ ЧАТА `server.mjs`, А НЕ ПРИДУМАН: там Next поднят тем
// же способом и живёт рядом со своим обработчиком. Решение владельца 2026-09-10:
// страница копируется целиком, а не пишется заново, — значит и способ поднять её
// берётся готовым.
//
// 🛑 ЦЕНА НАЗВАНА ВСЛУХ: ЗАКОН СЛУЖБЫ «НОЛЬ ЗАВИСИМОСТЕЙ» ЭТИМ ОТМЕНЁН. Он был
// верен, пока у памяти не было лица; надгробие с датой стоит в `LAWS.md`.
// ✗ УМОЛЧАНИЕ БЫЛО ОБРАТНЫМ — УРОК ЧАТА (114-6), ПЕРЕНЕСЁННЫЙ ВМЕСТЕ С МОСТОМ.
// Стояло `NODE_ENV !== "production"`: при НЕЗАДАННОЙ переменной Next поднимался
// бы в режиме разработки — страницы компилировались по требованию, в браузер
// ехал клиент горячей перезагрузки, а боевая сборка лежала неиспользованной. У
// чата это выглядело успехом везде и нашлось только по списку запросов. Здесь
// pm2 пока запускает память с `NODE_ENV=production`, но умолчание не должно
// зависеть от того, помнит ли запускающий про переменную.
const dev = process.env.NODE_ENV === "development"
const app = next({ dev, hostname: HOST, port: PORT })
const handle = app.getRequestHandler()
await app.prepare()

// ── МОСТ ТЕРМИНАЛА: ЧТО ЗАПУСКАЕТСЯ И ГДЕ (180-1, копия с сервера чата) ────────

/** Сколько терминалов держим разом: оболочка — это память и процессы. */
const MAX_SESSIONS = 4

/** Сколько ждём `init` с билетом, прежде чем закрыть молчащее соединение. */
const INIT_DEADLINE_MS = 10_000

const CLOSE_POLICY = 1008

// 🔒 СПИСОК РЕЖИМОВ ЗАКРЫТЫЙ, СВОБОДНОЙ КОМАНДЫ ПО ПРОВОДУ НЕТ.
// 🔒 `claude auth login` — ПОДКОМАНДА, А НЕ `/login` ВНУТРИ ИНТЕРФЕЙСА (измерено
// у чата, 114-2): набирать команду в интерфейсе значило бы зависеть от раскладки.
// ✗ `claude auth login` НЕ проверяет, вошли ли уже, — начинает обмен безусловно.
// Поэтому `claude-check` входит только если надо, а `claude-login` — всегда.
// 🪦 РЕЖИМ `claude-channel` ЧАТА СЮДА НЕ ПОЕХАЛ: он подключает к живой сессии
// бота (`screen -r fractera-agent`), а у памяти бота нет. Копия с чужой кнопкой
// обещала бы то, чего здесь не существует.
/**
 * Отдельный файл прав строителя: у агента памяти права противоположны.
 *
 * 🔒 ЛИЧНОСТЬ СТРОИТЕЛЯ ЗАДАЁТ САМА ПАПКА, А НЕ ДОБАВЛЕННЫЙ ПРОМПТ (189-9).
 * 🪦 Здесь стояла строка `--append-system-prompt`, объяснявшая агенту, что
 * `CLAUDE.md` этой папки описывает не его. Она была заплатой поверх настоящего
 * дефекта: инструкция АГЕНТА ПАМЯТИ лежала в файле, который читает СТРОИТЕЛЬ.
 * ✗ Владелец нашёл это, увидев, как строитель пересказывает наш учёт разработки
 * как своё задание. Измерено тогда же: работающий код `CLAUDE.md` памяти не
 * читает ВООБЩЕ — агенту памяти промпт приходит явным аргументом. Значит
 * единственным читателем файла всегда был строитель.
 * 🔒 ЛЕЧЕНИЕ ОКАЗАЛОСЬ ПРОЩЕ ЗАПЛАТЫ: инструкция агента памяти уехала в
 * `AGENT.md` — она предмет работы, — а `CLAUDE.md` стал тем, чем и был по факту:
 * инструкцией строителя. Закон «рабочая папка есть личность агента» теперь
 * работает НА нас, а не против.
 */
const BUILDER_SETTINGS = ".claude/settings.build.json"

// 🔒 СПИСОК РЕЖИМОВ ЗАКРЫТЫЙ, СВОБОДНОЙ КОМАНДЫ ПО ПРОВОДУ НЕТ.
const MODES = {
  // 🔒 СТРОИТЕЛЬ ЗАПУСКАЕТСЯ КОМАНДОЙ, А НЕ НАБИРАЕТСЯ ЧЕЛОВЕКОМ (189-8). Набрать
  // `claude` руками в этом же терминале можно, и получится ДРУГОЙ агент — с
  // правами памяти и её же инструкцией как личностью. Кнопка существует затем,
  // чтобы правильный запуск был одним движением, а не знанием наизусть.
  build: (bin) => `${bin} --settings ${BUILDER_SETTINGS}\n`,
  "claude-check": () => null,
  "claude-login": (bin) => `${bin} auth login\n`,
  system: () => null,
}

function shellPath() {
  if (process.env.PTY_SHELL) {
    return process.env.PTY_SHELL
  }
  const candidates =
    process.platform === "win32"
      ? [process.env.ComSpec, "C:\\Windows\\System32\\cmd.exe"]
      : ["/bin/zsh", "/bin/bash", "/bin/sh"]
  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return candidate
    }
  }
  return candidates.at(-1) ?? "/bin/sh"
}

// 🔒 РАБОЧАЯ ПАПКА ТЕРМИНАЛА — ДЕРЕВО ПАМЯТИ, А НЕ ПАПКА БОТА (решение 180).
// Закон проекта: рабочая папка есть личность агента. `claude`, набранный здесь
// руками, должен оказаться агентом памяти, а не агентом Telegram.
function workspaceDir() {
  const named = process.env.AGENT_WORKSPACE || "/opt/fractera/memory"
  return existsSync(named) ? named : process.cwd()
}

// 🛑 `node-pty` — НАТИВНЫЙ МОДУЛЬ, И ЕГО ОТКАЗ ОБЯЗАН БЫТЬ ГРОМКИМ, А НЕ ТИХИМ.
// Не собравшись, он не должен уронить память: договор и страницы живут и без
// терминала. Но молчаливо пропавший терминал читается как «вход в подписку
// сломан», поэтому причина печатается в лог и в сам терминал.
let pty = null
let ptyLoadError = ""
try {
  pty = (await import("node-pty")).default
} catch (err) {
  ptyLoadError = err instanceof Error ? err.message : String(err)
  process.stderr.write(
    `[pty] МОДУЛЬ НЕ ЗАГРУЖЕН: ${ptyLoadError}\n` +
      "[pty] память поднимется, терминал будет отказывать. Лечение: pnpm rebuild node-pty\n",
  )
}

const server = createServer(async (req, res) => {
  const path = (req.url || "/").split("?")[0].replace(/\/+$/, "") || "/"
  // 🪦 ЗДЕСЬ ЖИЛА СТРАНИЦА ЖУРНАЛА НА ГОЛОМ NODE (177-3) — УЕХАЛА 2026-09-10
  // (178-6) ПО СЛОВУ ВЛАДЕЛЬЦА: «журнал памяти должен был быть перенесён на
  // защищённый маршрут». Теперь он раздел страницы — `/{язык}/settings?section=journal`,
  // за тем же замком, что стенд, и в том же языковом потоке.
  //
  // ✗ ПОЧЕМУ ЭТО БЫЛО ДЕФЕКТОМ, А НЕ ПРОСТО ДУБЛЁМ: корень отвечал РАНЬШЕ Next,
  // поэтому переадресация на языковую главную до него не доходила — человек,
  // набрав адрес службы, попадал на служебный экран вместо публичной страницы.
  // 🔒 И ЗАМОК У НЕГО БЫЛ СВОЙ, ВТОРОЙ: та же роль проверялась дважды разными
  // путями. Два замка на одну способность расходятся на первой правке.
  // Восстанавливается из git вместе с `lib/page.mjs`.

  if (!allowed(req, path)) {
    // 🔒 ЯЗЫК ЗДЕСЬ БЕРЁТСЯ ИЗ АДРЕСА, А НЕ ИЗ ТЕЛА: тело мы ещё не читали и,
    // отказывая непрошеному гостю, читать не станем.
    const askedLang = new URL(req.url ?? "/", "http://x").searchParams.get("lang") ?? undefined
    return send(res, 401, {
      error: "no-access",
      ok: false,
      what_happened: say("no-access", askedLang),
    })
  }

  if (req.method === "GET" && path === "/v1/health") {
    return send(res, 200, {
      methods: contract().methods.length,
      // 🔒 МЕРА КАЧЕСТВА ИМЁН ВИДНА В ЖИВОСТИ, А НЕ В ОТДЕЛЬНОМ ОТЧЁТЕ: показатель,
      // который надо специально искать, не смотрит никто.
      name_quality: nameQuality(),
      ok: true,
      service: SERVICE,
      startedAt: STARTED_AT,
      version: CONTRACT_VERSION,
    })
  }

  if (req.method === "GET" && path === "/v1/contract") {
    return send(res, 200, { ...contract(), ok: true })
  }

  // ── КАТАЛОГ: что у памяти есть, в виде имён ────────────────────────────────
  if (req.method === "GET" && path === "/v1/tables") {
    return send(res, 200, await listTables())
  }
  if (req.method === "GET" && path.startsWith("/v1/tables/")) {
    const name = decodeURIComponent(path.slice("/v1/tables/".length))
    // 🔒 ИМЯ ИЗ ПУТИ ПРОВЕРЯЕТСЯ ДО ОБРАЩЕНИЯ К БАЗЕ, А НЕ ПОСЛЕ: оно приходит
    // снаружи, и это единственная граница между именем и SQL.
    if (!isSafeName(name)) {
      return send(res, 400, { error: "unsafe-name", ok: false, what_happened: say("unsafe-name") })
    }
    const d = await describeTable(name)
    return send(res, d.ok ? 200 : 404, d)
  }

  // ── ФАЙЛ ОБЪЕКТА (194-17) ────────────────────────────────────────────────
  // 🔒 БАЙТЫ ТЕКУТ ПОТОКОМ ИЗ ДВЕРИ `object-file` ПО ПЕТЛЕ, С ЕЁ ТИПОМ И ИМЕНЕМ: файл до 200 МБ не собирается в
  // память процесса, а тип и имя — те, что записаны при сохранении, а не угаданы здесь.
  if (req.method === "GET" && /^\/v1\/objects\/[^/]+\/file$/.test(path)) {
    if (!SECRET) {
      return send(res, 503, { error: "no-machine-secret", ok: false, what_happened: say("inside-memory") })
    }
    const id = decodeURIComponent(path.split("/")[3] ?? "")
    const up = httpRequest(
      {
        headers: { "x-data-secret": SECRET },
        host: "127.0.0.1",
        method: "GET",
        path: `/api/fractera/object-file?id=${encodeURIComponent(id)}`,
        port: PORT,
      },
      (answer) => {
        const h = { "cache-control": "no-store", "content-type": answer.headers["content-type"] ?? "application/octet-stream" }
        if (answer.headers["content-disposition"]) h["content-disposition"] = answer.headers["content-disposition"]
        if (answer.headers["content-length"]) h["content-length"] = answer.headers["content-length"]
        res.writeHead(answer.statusCode ?? 502, h)
        answer.pipe(res)
      },
    )
    up.on("error", (e) => {
      if (res.headersSent) return res.destroy()
      send(res, 502, { error: "inside-memory", ok: false, what_happened: say("inside-memory"), why: String(e.message).slice(0, 200) })
    })
    up.end()
    return
  }

  // Методы договора: имя в пути, тело — параметры.
  // 🔒 ОБЪЕКТ — ДО ОБЩЕЙ ВЕТКИ (194-15): общая ветка читает тело как JSON, а тело объекта ещё не прочитано и
  // должно остаться непрочитанным, чтобы уйти потоком.
  if (req.method === "POST" && path === "/v1/keep_object") return passToDoor(req, res, "object-ingest")

  if (req.method === "POST" && path.startsWith("/v1/")) {
    const name = path.slice(4)
    const declared = METHODS.find((m) => m.name === name)
    if (declared) {
      const body = await readBody(req)
      if (!body) {
        return send(res, 400, { error: "bad-json", ok: false, what_happened: say("bad-json") })
      }
      // 🔒 ОБЯЗАТЕЛЬНОЕ ПРОВЕРЯЕТСЯ ПО ДОГОВОРУ, А НЕ ПО ПАМЯТИ АВТОРА.
      const missing = declared.params.filter((p) => p.required && !body[p.name]).map((p) => p.name)
      if (missing.length) {
        return send(res, 400, {
          error: "missing-params",
          missing,
          ok: false,
          what_happened: say("missing-params", body.lang, { names: missing.join(", ") }),
        })
      }
      try {
        return send(res, 200, await RUN[name](body))
      } catch (e) {
        // 🛑 ОТКАЗ НАЗЫВАЕТСЯ ОТКАЗОМ, А НЕ ПАДАЕТ МОЛЧА: служба обязана
        // пережить любой вызов и сказать, что случилось.
        return send(res, 500, {
          error: "inside-memory",
          ok: false,
          what_happened: say("inside-memory", body.lang),
          why: String(e.message).slice(0, 200),
        })
      }
    }
  }

  // 🔒 ОТКАЗ РАЗЛИЧАЕТ «ТАКОГО НЕТ» И «ЕЩЁ НЕ ПОСТРОЕНО», И РАЗНИЦА ВИДНА ТОМУ,
  // КТО ОТЛАЖИВАЕТ. Имя, которого нет в договоре, — это «не построено»;
  // сказать «такого не бывает» значило бы соврать о замысле.
  if (path.startsWith("/v1/")) {
    return send(res, 501, {
      error: "not-built",
      ok: false,
      what_happened: say("not-built"),
      version: CONTRACT_VERSION,
    })
  }

  // 🔒 ВСЁ ОСТАЛЬНОЕ — NEXT, И ПОРЯДОК ЗДЕСЬ ЕДИНСТВЕННО ВЕРНЫЙ (178-1).
  // Договор `/v1/*` и страница журнала обслуживаются НАШИМ кодом выше и в Next
  // не попадают вовсе: они старше его и переписывать их незачем.
  // 🛑 ОТДАВАТЬ NEXT ВСЁ ПОДРЯД НЕЛЬЗЯ — он ответил бы своей страницей `404` на
  // вызов метода договора, и потребитель получил бы HTML вместо JSON. Ровно так
  // ломались двери, перехваченные привратником, — три случая за три дня.
  return handle(req, res)
})

// ── МОСТ ТЕРМИНАЛА: СОКЕТ `/pty` (180-1, копия с сервера чата) ─────────────────
//
// 🔒 СОБЫТИЕ `upgrade` ПРИНАДЛЕЖИТ МОСТУ ЦЕЛИКОМ, И ЭТО ОТБИРАЕТСЯ ЯВНО.
// ✗ Оплачено у чата днём отладки (157-3): Next вешает СВОЙ обработчик `upgrade`
// из обработчика ПЕРВОГО HTTP-запроса и затем закрывает сокет, если его
// маршрутизатор что-то сматчил, — в том числе поднятый мостом. Отказ немой и
// перемежающийся: первое соединение после перезапуска живёт, все следующие
// рвутся через 3 мс кодом 1006. Лечение — заставить Next привязаться сейчас и
// тут же снять его обработчик; всё, кроме `/pty`, ему возвращается ниже.
app.setupWebSocketHandler?.(server)
server.removeAllListeners("upgrade")

const wss = new WebSocketServer({ noServer: true })
let sessions = 0

server.on("upgrade", (req, socket, head) => {
  let pathname = ""
  try {
    ({ pathname } = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`))
  } catch {
    socket.destroy()
    return
  }
  if (pathname === "/pty") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req)
    })
    return
  }
  const upgrade = app.getUpgradeHandler?.()
  if (upgrade) {
    upgrade(req, socket, head)
  } else {
    socket.destroy()
  }
})

wss.on("connection", (ws) => {
  let proc = null
  let started = false

  const deadline = setTimeout(() => {
    if (!started) {
      ws.close(CLOSE_POLICY, "no-init")
    }
  }, INIT_DEADLINE_MS)

  function fail(reason) {
    clearTimeout(deadline)
    process.stderr.write(`[pty] отказ: ${reason}\n`)
    ws.close(CLOSE_POLICY, reason)
  }

  function start(mode) {
    if (!pty) {
      ws.send(`\r\n[терминал недоступен: node-pty не собран — ${ptyLoadError}]\r\n`)
      fail("pty-unavailable")
      return
    }
    if (sessions >= MAX_SESSIONS) {
      ws.send(`\r\n[открыто ${sessions} терминалов из ${MAX_SESSIONS} — закройте лишние]\r\n`)
      fail("too-many-sessions")
      return
    }
    const bin = claudeBin()
    const shell = shellPath()
    try {
      proc = pty.spawn(shell, [], {
        cols: 500,
        cwd: workspaceDir(),
        // 🔒 ОКРУЖЕНИЕ ОБОЛОЧКИ СОБРАНО ЯВНО, А НЕ УНАСЛЕДОВАНО ЦЕЛИКОМ: процесс
        // памяти держит секрет машины, и оболочке в браузере видеть его незачем.
        env: {
          HOME: process.env.HOME,
          LANG: process.env.LANG || "C.UTF-8",
          LOGNAME: process.env.LOGNAME,
          PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin",
          SHELL: shell,
          TERM: "xterm-256color",
          USER: process.env.USER,
        },
        name: "xterm-256color",
        rows: 24,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      ws.send(`\r\n[оболочка ${shell} не запустилась: ${message}]\r\n`)
      fail("spawn-failed")
      return
    }
    sessions += 1
    started = true
    clearTimeout(deadline)

    proc.onData((data) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data)
      }
    })
    proc.onExit(() => {
      if (ws.readyState === ws.OPEN) {
        ws.close()
      }
    })

    let command = MODES[mode](bin)
    if (mode === "claude-check") {
      const state = claudeAuthState().loggedIn
      if (state === true) {
        ws.send(
          "\r\nПодписка Claude Code подключена. " +
            "Кнопка «Вход по подписке Claude Code» — войти заново.\r\n\r\n",
        )
      } else if (state === null) {
        ws.send(
          "\r\nСостояние подписки узнать не удалось: " +
            `${bin} не ответил. Нажмите кнопку входа, чтобы войти вручную.\r\n\r\n`,
        )
      } else {
        command = MODES["claude-login"](bin)
      }
    }
    if (command) {
      setTimeout(() => {
        try {
          proc.write(command)
        } catch {
          /* оболочка уже закрыта — сказать об этом нечему и незачем */
        }
      }, 800)
    }
  }

  ws.on("message", (raw) => {
    let msg = null
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }
    if (!msg || typeof msg !== "object") {
      return
    }
    if (msg.type === "init") {
      if (started) {
        return
      }
      // 🔒 БИЛЕТ ОДНОРАЗОВЫЙ И ЖИВЁТ МИНУТУ: его выдала дверь под ролью
      // `architect`. Замок сокета свой, потому что привратник его не видит.
      const email = redeemPtyTicket(msg.ticket)
      if (!email) {
        fail("bad-ticket")
        return
      }
      const mode = typeof msg.mode === "string" && msg.mode in MODES ? msg.mode : "system"
      start(mode)
      return
    }
    if (!started || !proc) {
      return
    }
    if (msg.type === "stdin" && typeof msg.data === "string") {
      proc.write(msg.data)
      return
    }
    if (msg.type === "resize" && msg.cols && msg.rows) {
      proc.resize(Number(msg.cols), Number(msg.rows))
    }
  })

  ws.on("close", () => {
    clearTimeout(deadline)
    if (proc) {
      sessions = Math.max(0, sessions - 1)
      try {
        proc.kill()
      } catch {
        /* уже мёртв */
      }
      proc = null
    }
  })

  ws.on("error", (err) => {
    process.stderr.write(`[pty] ошибка сокета: ${err.message}\n`)
  })
})

server.listen(PORT, HOST, () => {
  console.log(
    `${SERVICE} ${CONTRACT_VERSION} слушает http://${HOST}:${PORT} · терминал ws://${HOST}:${PORT}/pty` +
      `${pty ? "" : " (НЕДОСТУПЕН: node-pty не собран)"}`,
  )
  if (!SECRET) {
    // 🛑 ГОВОРИМ ВСЛУХ, А НЕ ПАДАЕМ: без секрета служба жива и отвечает `health`,
    // но всё остальное закрыто. Молчаливый старт без замка опаснее отказа.
    console.log("ВНИМАНИЕ: секрет машины не найден — открыт только /v1/health")
  }
})
