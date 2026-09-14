// ДОГОВОР СЛУЖБЫ ИИ-БРАУЗЕРА (шаг 196).
//
// 🔒 ОТДАЁТСЯ ПОРОЖДЁННОЕ, А НЕ ВТОРАЯ РУКОПИСНАЯ КОПИЯ: `GET /v1/contract` строится из этого объекта, и схема инструментов
// агента порождается из ответа по HTTP. Тот же закон, что у договора памяти.

export const SERVICE = "fractera-ai-browser"
export const CONTRACT_VERSION = "0.3.0"

export const METHODS = [
  {
    name: "read",
    about:
      "Открыть одну или несколько страниц и веб-приложений настоящим браузером и вернуть то, что получилось после скриптов: " +
      "итоговый HTML целиком и весь видимый текст, заголовки h1–h6, мета, интерактивные элементы (ссылки, кнопки, формы, " +
      "поля) и медиа (картинки, видео, звук, фреймы) — по атрибутам. Звать, когда нужна страница такой, какой её видит человек.",
    params: [
      {
        name: "urls",
        type: "array",
        required: true,
        about: "Адреса страниц http или https, от 1 до 10 за вызов. Адреса самой машины, петли и частных сетей отвергаются.",
      },
    ],
    returns:
      "results — по одному на адрес, в том же порядке: url, final_url, status, title, load_reached (дождалась ли страница " +
      "события load; false — отдано то, что успело отрисоваться), html (+ html_length, html_truncated), " +
      "text (+ text_length, text_truncated), lang, canonical, meta, headings, links, buttons, forms, fields, images, videos, " +
      "audios, iframes (у каждого списка items и total), blocked (запросы страницы, отвергнутые запретом адресов), ms, " +
      "queued_ms (сколько ссылка ждала очереди: браузер открывает строго одну страницу за раз для всех зовущих); " +
      "failed — сколько ссылок не открылось; limits — пределы службы.",
    onMiss:
      "Движок браузера не поднят — 503 engine-unreachable сразу. Ссылок больше предела — 400 too-many-urls с limit. " +
      "Отказ по одной ссылке не роняет остальные: у неё поле error — url-invalid, url-forbidden, page-failed, page-timeout — и why. " +
      "Движок браузера завис — engine-hung: служба сама перезапускает движок, следующая ссылка открывается после его подъёма.",
  },
  {
    name: "youtube",
    about:
      "Открыть ролик YouTube настоящим браузером и вернуть его данные (название, описание, канал, длительность, даты, просмотры) " +
      "и субтитры строками с метками времени [мм:сс–мм:сс]. Звать, когда нужно содержание ролика, а не страница вокруг него.",
    params: [
      { name: "url", type: "string", required: true, about: "Адрес ролика: youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/…" },
      { name: "lang", type: "string", required: false, about: "Желаемый язык субтитров (en, ru…). Не назван — язык, который выбрал плеер" },
    ],
    returns:
      "id, video (id, title, description, channel, channel_id, length_seconds, publish_date, upload_date, view_count, keywords, " +
      "is_live), playability, tracks (lang, kind: manual|asr, name), transcript (lang, kind, lines [start, end, text в мс], text) " +
      "или null, why — словами, чего не досталось и почему, blocked, ms.",
    onMiss:
      "Не адрес ролика — 400 not-youtube. Субтитров нет или плеер их не отдал — 200, transcript: null и why (данные ролика " +
      "отдаются). Ролика нет — 422 video-unavailable с причиной YouTube; YouTube потребовал подтвердить, что зовущий не бот, — " +
      "422 youtube-bot-check (ролик есть, адрес сервера под проверкой); страница согласия — 422 consent-wall; страница не " +
      "открылась — 502 page-failed. Движок не поднят — 503 engine-unreachable.",
  },
]

export function contract() {
  return {
    methods: METHODS,
    service: SERVICE,
    version: CONTRACT_VERSION,
  }
}

/** Каталог адресов только на чтение. У браузера его нет; экспорт оставлен, потому что страница API порождается из него. */
export const CATALOGUE = []
