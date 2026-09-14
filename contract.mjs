// ДОГОВОР СЛУЖБЫ ИИ-БРАУЗЕРА (шаг 196).
//
// 🔒 ОТДАЁТСЯ ПОРОЖДЁННОЕ, А НЕ ВТОРАЯ РУКОПИСНАЯ КОПИЯ: `GET /v1/contract` строится из этого объекта, и схема инструментов
// агента порождается из ответа по HTTP. Тот же закон, что у договора памяти.

export const SERVICE = "fractera-ai-browser"
export const CONTRACT_VERSION = "0.2.0"

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
      "audios, iframes (у каждого списка items и total), blocked (запросы страницы, отвергнутые запретом адресов), ms; " +
      "failed — сколько ссылок не открылось; limits — пределы службы.",
    onMiss:
      "Движок браузера не поднят — 503 engine-unreachable сразу. Ссылок больше предела — 400 too-many-urls с limit. " +
      "Отказ по одной ссылке не роняет остальные: у неё поле error — url-invalid, url-forbidden, page-failed, page-timeout — и why.",
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
