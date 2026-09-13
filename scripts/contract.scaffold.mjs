// ДОГОВОР СЛУЖБЫ ИИ-БРАУЗЕРА (шаг 196).
//
// 🔒 ОТДАЁТСЯ ПОРОЖДЁННОЕ, А НЕ ВТОРАЯ РУКОПИСНАЯ КОПИЯ: `GET /v1/contract` строится из этого объекта, и схема инструментов
// агента порождается из ответа по HTTP. Тот же закон, что у договора памяти.

export const SERVICE = "fractera-ai-browser"
export const CONTRACT_VERSION = "0.1.0"

export const METHODS = [
  {
    name: "read",
    about:
      "Открыть страницу или веб-приложение по адресу настоящим браузером и вернуть то, что получилось после скриптов: " +
      "итоговый адрес и код, заголовок, итоговый HTML целиком и весь видимый текст.",
    params: [
      { name: "urls", type: "array", required: true, about: "Адреса страниц http или https. Сейчас — ровно один; несколько ссылок за вызов — следующий подшаг" },
    ],
    returns: "results — по одному на адрес: url, final_url, status, title, html, text, ms; либо error с причиной.",
    onMiss: "Движок браузера не поднят — 503 engine-unreachable сразу, без ожидания. Страница не открылась за предел — error с причиной.",
  },
]

export function contract() {
  return {
    methods: METHODS,
    service: SERVICE,
    version: CONTRACT_VERSION,
  }
}
