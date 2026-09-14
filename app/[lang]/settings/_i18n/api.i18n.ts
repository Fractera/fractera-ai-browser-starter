// СЛОВА ВКЛАДКИ API СЛУЖБЫ ИИ-БРАУЗЕРА — ОТДЕЛЬНЫЙ СЛОВАРЬ, ПО ОБЩЕМУ СТАНДАРТУ (185-2 памяти, переписано в 196-5).
//
// 🎯 ТРЕБОВАНИЕ ВЛАДЕЛЬЦА 2026-09-11 (для памяти, унаследовано копией): «на одной странице не надо делать текст и на русском и
// на английском поддерживать стандарт мультиязычности чтобы мы в будущем могли эти страницы масштабировать до 82 языков».
//
// 🔒 ОПИСАНИЯ МЕТОДОВ И ПАРАМЕТРОВ ЖИВУТ ЗДЕСЬ, А НЕ В ДОГОВОРЕ: порождается СПИСОК (какие методы, параметры, типы,
// обязательность — из `contract.mjs`), здесь лежат только ПЕРЕВОДЫ, ключами по именам из договора. Нет перевода — страница
// показывает текст договора с пометкой, а не молчит.
// 🪦 Разделы памяти — нить размышления, судьба параметров, каталог таблиц, коды отказов из `lib/words.mjs` — сняты: у
// браузера их нет. Коды отказов браузера перечислены здесь, по одному на код из `server.mjs` и `lib/browser.mjs`.

export type ApiDocWords = {
  h: {
    overview: string;
    baseUrl: string;
    auth: string;
    methods: string;
    service: string;
    refusals: string;
    examples: string;
    limits: string;
    postman: string;
  };
  overview: { lead: string; audience: string; twoMethods: string };
  baseUrl: { lead: string; readBody: string };
  auth: { lead: string; headers: string; denied: string };
  methods: { lead: string; parameter: string; type: string; required: string; meaning: string; yes: string; no: string; returns: string; onMiss: string; untranslated: string };
  service: { health: string; contract: string };
  refusals: { lead: string; code: string; status: string; meaning: string; rows: Array<{ code: string; status: string; meaning: string }> };
  examples: { read: string; many: string; youtube: string };
  limits: { lead: string; items: string[] };
  postman: { lead: string; steps: string[] };
  /** Переводы описаний методов договора: about · returns · onMiss. */
  method: Record<string, { about: string; returns: string; onMiss: string }>;
  /** Переводы описаний параметров, ключ — `метод.параметр`, затем имя параметра. */
  param: Record<string, string>;
};

const EN: ApiDocWords = {
  auth: {
    denied: "The key is compared in constant time. Calls without a valid key get 401 with error: \"no-access\". Generating a new key stops the previous one at once.",
    headers: "Send it in either header — both are accepted:",
    lead: "Every /v1/* call except /v1/health requires the AI browser access key. Processes of the same machine may use the machine secret instead; outside tools get only the key, which can be revoked without touching anything else.",
  },
  baseUrl: {
    lead: "Methods are POST with a JSON body; health and contract are GET. Send Content-Type: application/json. Responses are always JSON and always no-store.",
    readBody: "Read the body, not only the status. read answers 200 when the call was handled: an address that did not open carries its own error inside results, and failed counts them.",
  },
  examples: {
    many: "Read several pages in one call — the answer keeps their order:",
    read: "Read one application that is drawn by scripts:",
    youtube: "Read a YouTube video with subtitles in a chosen language:",
  },
  h: {
    auth: "Authentication",
    baseUrl: "Base URL",
    examples: "Worked examples",
    limits: "Boundaries that are design, not gaps",
    methods: "Methods",
    overview: "AI browser API — what this service is",
    postman: "Testing with Postman",
    refusals: "Refusal codes",
    service: "Health and contract",
  },
  limits: {
    items: [
      "Addresses of the machine itself, loopback, private networks and link-local are refused before a tab opens and on every request of the page — redirects and WebSockets included.",
      "The browser does not sign in to sites and does not solve bot checks: a check page comes back as the page it is, with its status.",
      "Media is described by attributes and never downloaded: an image is its address and alt, a video its address, poster and duration.",
      "Up to 10 addresses per call, opened strictly one after another — calls from different programs wait in one queue; each address has 90 s once its turn comes. HTML over 5,000,000 characters and text over 1,000,000 are cut and marked, lists keep 300 items with their total.",
      "YouTube subtitles come from the request the player makes; when the player gives none, the answer carries transcript: null and the reason.",
    ],
    lead: "Stated plainly, because a boundary nobody named is one every caller works around in their own way:",
  },
  method: {
    read: {
      about: "Open one or several pages and web applications with a real browser and return what is there after the scripts: the full final HTML and all visible text, headings h1–h6, meta, interactive elements (links, buttons, forms, fields) and media (images, video, audio, frames) by their attributes. Call it when a page is needed the way a person sees it.",
      onMiss: "The browser engine is not up — 503 engine-unreachable at once. More addresses than the limit — 400 too-many-urls with limit. A refusal for one address does not break the others: it carries error — url-invalid, url-forbidden, page-failed, page-timeout — and why; a failed page also carries trace.",
      returns: "results — one per address, in the same order: url, final_url, status, title, load_reached, html (+ html_length, html_truncated), text (+ text_length, text_truncated), lang, canonical, meta, headings, links, buttons, forms, fields, images, videos, audios, iframes (each list with items and total), blocked — requests of the page refused by the address ban, ms; failed — how many addresses did not open; limits.",
    },
    youtube: {
      about: "Open a YouTube video with a real browser and return its data (title, description, channel, duration, dates, views) and subtitles as lines with timestamps [mm:ss–mm:ss]. Call it when the content of a video is needed, not the page around it.",
      onMiss: "Not a video address — 400 not-youtube. No subtitles, or the player gave none — 200, transcript: null and why (the video's data is returned). No such video — 422 video-unavailable with YouTube's reason; a consent page — 422 consent-wall; the page did not open — 502 page-failed. Engine not up — 503 engine-unreachable.",
      returns: "id, video (id, title, description, channel, channel_id, length_seconds, publish_date, upload_date, view_count, keywords, is_live), playability, tracks (lang, kind: manual|asr, name), transcript (lang, kind, lines [start, end in ms, text], text) or null, why — in words, what was not obtained and why, blocked, ms.",
    },
  },
  methods: {
    lead: "Generated from the live contract — the same object the service returns from GET /v1/contract. If a parameter appears here, the server accepts it today.",
    meaning: "meaning",
    no: "no",
    onMiss: "When it does not work out.",
    parameter: "parameter",
    required: "required",
    returns: "Returns.",
    type: "type",
    untranslated: "[not translated yet]",
    yes: "yes",
  },
  overview: {
    audience: "This page is written for machines and for the people who wire them: memory, other services, agents, scripts. The method list is generated from the live contract, so it cannot drift away from what the server accepts.",
    lead: "Fractera AI Browser is a real browser on your server for programs. You give it addresses; it opens them the way a person does and returns the final page — text, code, elements and media — or a YouTube video's data and subtitles.",
    twoMethods: "Two methods: read for pages and web applications, youtube for videos. Both open pages through the same guarded tab, so the address ban cannot be bypassed by choosing the other method.",
  },
  param: {
    "read.urls": "Page addresses, http or https, from 1 to 10 per call. Addresses of the machine, loopback and private networks are refused.",
    "youtube.lang": "The subtitle language wanted (en, ru…). Not given — the language the player chose.",
    "youtube.url": "The video address: youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/….",
  },
  postman: {
    lead: "Six steps, and the last one is the one people skip.",
    steps: [
      "Generate the access key above and copy it. It is shown once; if you lose it, generate a new one — the old one stops working at that moment.",
      "In Postman create an environment, for example «Fractera AI Browser», with two variables: base = the address shown above, and key = the key you copied. Mark the key variable as secret.",
      "First request: GET {{base}}/v1/health, no headers. A 200 with engine.status: up means the service and its browser are alive.",
      "Second request: GET {{base}}/v1/contract with the header x-ai-browser-key = {{key}}. A 401 here means the key is wrong or was replaced.",
      "Third request: POST {{base}}/v1/read with the same header and Content-Type: application/json. Body → raw → JSON: { \"urls\": [\"https://example.com/\"] }. Expect ok:true, failed:0 and one result with title and text.",
      "Negative check, and do not skip it: send { \"urls\": [\"http://127.0.0.1:3300/\"] }. The result must carry error: url-forbidden. If it opens, you are talking to something that is not this service.",
    ],
  },
  refusals: {
    code: "code",
    lead: "A permanent machine code plus a reason. Branch on the code; codes never change.",
    meaning: "meaning",
    rows: [
      { code: "no-access", meaning: "no valid key and no machine secret", status: "401" },
      { code: "bad-json", meaning: "the request body is not JSON", status: "400" },
      { code: "no-urls", meaning: "read was called without addresses", status: "400" },
      { code: "too-many-urls", meaning: "more addresses than the limit; the limit is in the answer", status: "400" },
      { code: "no-url", meaning: "youtube was called without an address", status: "400" },
      { code: "not-youtube", meaning: "the address is not a YouTube video", status: "400" },
      { code: "engine-unreachable", meaning: "the browser engine is not up — the call is refused at once", status: "503" },
      { code: "not-built", meaning: "the contract declares no such method", status: "404" },
      { code: "url-invalid", meaning: "per address: not a URL, or the name does not resolve", status: "in results" },
      { code: "url-forbidden", meaning: "per address: the machine, loopback, a private network, another scheme, or a redirect there", status: "in results / 400" },
      { code: "page-failed", meaning: "per address: the page did not open; why and trace say what it was waiting for", status: "in results / 502" },
      { code: "page-timeout", meaning: "per address: no answer within the time per address", status: "in results / 502" },
      { code: "video-unavailable", meaning: "youtube: there is no such video, with YouTube's reason", status: "422" },
      { code: "youtube-bot-check", meaning: "youtube: YouTube asked to confirm the caller is not a bot — the video exists, this server's address is being checked", status: "422" },
      { code: "consent-wall", meaning: "youtube: YouTube showed a consent page instead of the video", status: "422" },
      { code: "no-player-data", meaning: "youtube: the page has no player data", status: "422" },
    ],
    status: "status",
  },
  service: {
    contract: "The machine-readable contract. Tool schemas for an agent should be generated from this response over HTTP rather than copied from source: a copy diverges silently.",
    health: "Open, no key required: liveness, contract version and the browser engine state (status, restarts, last error).",
  },
};

const RU: ApiDocWords = {
  auth: {
    denied: "Ключ сравнивается за постоянное время. Вызов без годного ключа получает 401 с error: \"no-access\". Новый ключ в тот же миг останавливает прежний.",
    headers: "Шлите его любым из двух заголовков — принимаются оба:",
    lead: "Каждый вызов /v1/*, кроме /v1/health, требует ключ доступа к ИИ-браузеру. Процессы этой же машины могут звать секретом машины; чужим программам даётся только ключ, который отзывается, не задевая ничего другого.",
  },
  baseUrl: {
    lead: "Методы — POST с телом JSON; health и contract — GET. Шлите Content-Type: application/json. Ответ всегда JSON и всегда no-store.",
    readBody: "Читайте тело, а не только код. read отвечает 200, когда вызов обработан: неоткрывшийся адрес несёт свой error внутри results, а failed их считает.",
  },
  examples: {
    many: "Прочитать несколько страниц одним вызовом — порядок в ответе тот же:",
    read: "Прочитать одно приложение, которое рисуют скрипты:",
    youtube: "Прочитать ролик YouTube с субтитрами на выбранном языке:",
  },
  h: {
    auth: "Ключ доступа",
    baseUrl: "Адрес службы",
    examples: "Разобранные примеры",
    limits: "Границы, которые являются решением, а не пробелом",
    methods: "Методы",
    overview: "API ИИ-браузера — что это за служба",
    postman: "Проверка через Postman",
    refusals: "Коды отказов",
    service: "Живость и договор",
  },
  limits: {
    items: [
      "Адреса самой машины, петли, частных сетей и link-local отвергаются до открытия вкладки и на каждом запросе страницы — перенаправления и WebSocket тоже.",
      "Браузер не входит на сайты под учётной записью и не проходит проверки на ботов: страница проверки приходит той страницей, какая она есть, со своим кодом.",
      "Медиа описываются атрибутами и не скачиваются: картинка — это её адрес и alt, видео — адрес, постер и длительность.",
      "До 10 адресов за вызов, открываются строго по очереди — вызовы разных программ ждут в одной очереди; на каждый адрес 90 с, когда подошла его очередь. HTML длиннее 5 000 000 знаков и текст длиннее 1 000 000 обрезаются с пометкой, списки хранят 300 записей и total.",
      "Субтитры YouTube берутся из запроса, который делает плеер; если плеер их не отдал, ответ несёт transcript: null и причину.",
    ],
    lead: "Названо прямо, потому что границу, которую никто не назвал, каждый зовущий обходит по-своему:",
  },
  method: {
    read: {
      about: "Открыть одну или несколько страниц и веб-приложений настоящим браузером и вернуть то, что на них есть после скриптов: итоговый HTML целиком и весь видимый текст, заголовки h1–h6, мета, интерактивные элементы (ссылки, кнопки, формы, поля) и медиа (картинки, видео, звук, фреймы) по атрибутам. Звать, когда нужна страница такой, какой её видит человек.",
      onMiss: "Движок браузера не поднят — 503 engine-unreachable сразу. Адресов больше предела — 400 too-many-urls с limit. Отказ по одному адресу не роняет остальные: у него error — url-invalid, url-forbidden, page-failed, page-timeout — и why; у неоткрывшейся страницы ещё trace.",
      returns: "results — по одному на адрес, в том же порядке: url, final_url, status, title, load_reached, html (+ html_length, html_truncated), text (+ text_length, text_truncated), lang, canonical, meta, headings, links, buttons, forms, fields, images, videos, audios, iframes (у каждого списка items и total), blocked — запросы страницы, отвергнутые запретом адресов, ms; failed — сколько адресов не открылось; limits.",
    },
    youtube: {
      about: "Открыть ролик YouTube настоящим браузером и вернуть его данные (название, описание, канал, длительность, даты, просмотры) и субтитры строками с метками времени [мм:сс–мм:сс]. Звать, когда нужно содержание ролика, а не страница вокруг него.",
      onMiss: "Не адрес ролика — 400 not-youtube. Субтитров нет или плеер их не отдал — 200, transcript: null и why (данные ролика отдаются). Ролика нет — 422 video-unavailable с причиной YouTube; страница согласия — 422 consent-wall; страница не открылась — 502 page-failed. Движок не поднят — 503 engine-unreachable.",
      returns: "id, video (id, title, description, channel, channel_id, length_seconds, publish_date, upload_date, view_count, keywords, is_live), playability, tracks (lang, kind: manual|asr, name), transcript (lang, kind, lines [start, end в мс, text], text) или null, why — словами, чего не досталось и почему, blocked, ms.",
    },
  },
  methods: {
    lead: "Порождено из живого договора — того же объекта, что служба отдаёт по GET /v1/contract. Если параметр здесь есть, сервер принимает его сегодня.",
    meaning: "что значит",
    no: "нет",
    onMiss: "Когда не получилось.",
    parameter: "параметр",
    required: "обязателен",
    returns: "Что возвращает.",
    type: "тип",
    untranslated: "[перевода пока нет]",
    yes: "да",
  },
  overview: {
    audience: "Эта страница написана для машин и для тех, кто их подключает: памяти, других служб, агентов, скриптов. Список методов порождается из живого договора, поэтому разойтись с тем, что принимает сервер, он не может.",
    lead: "Fractera AI Browser — настоящий браузер на вашем сервере для программ. Вы даёте ему адреса; он открывает их так, как это делает человек, и возвращает итоговую страницу — текст, код, элементы и медиа — или данные и субтитры ролика YouTube.",
    twoMethods: "Два метода: read — для страниц и веб-приложений, youtube — для роликов. Оба открывают страницы одной защищённой вкладкой, поэтому запрет адресов не обойти выбором другого метода.",
  },
  param: {
    "read.urls": "Адреса страниц http или https, от 1 до 10 за вызов. Адреса машины, петли и частных сетей отвергаются.",
    "youtube.lang": "Желаемый язык субтитров (en, ru…). Не назван — язык, который выбрал плеер.",
    "youtube.url": "Адрес ролика: youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/….",
  },
  postman: {
    lead: "Шесть шагов, и последний — тот, который пропускают.",
    steps: [
      "Сгенерируйте ключ доступа выше и скопируйте его. Он показывается один раз; потеряли — сгенерируйте новый, и в этот же миг старый перестанет работать.",
      "В Postman заведите окружение, например «Fractera AI Browser», и в нём две переменные: base = показанный выше адрес и key = скопированный ключ. Переменную с ключом пометьте как secret.",
      "Первый запрос: GET {{base}}/v1/health, без заголовков. Ответ 200 с engine.status: up означает, что служба и её браузер живы.",
      "Второй запрос: GET {{base}}/v1/contract с заголовком x-ai-browser-key = {{key}}. Ответ 401 здесь значит, что ключ неверен или заменён.",
      "Третий запрос: POST {{base}}/v1/read с тем же заголовком и Content-Type: application/json. Body → raw → JSON: { \"urls\": [\"https://example.com/\"] }. Ожидайте ok:true, failed:0 и один результат с title и text.",
      "Негативная проверка, и её не пропускайте: пришлите { \"urls\": [\"http://127.0.0.1:3300/\"] }. Результат обязан нести error: url-forbidden. Если страница открылась — вы разговариваете не с этой службой.",
    ],
  },
  refusals: {
    code: "код",
    lead: "Вечный машинный код и причина. Ветвитесь по коду; коды не меняются никогда.",
    meaning: "что значит",
    rows: [
      { code: "no-access", meaning: "нет годного ключа и нет секрета машины", status: "401" },
      { code: "bad-json", meaning: "тело запроса — не JSON", status: "400" },
      { code: "no-urls", meaning: "read позван без адресов", status: "400" },
      { code: "too-many-urls", meaning: "адресов больше предела; предел — в ответе", status: "400" },
      { code: "no-url", meaning: "youtube позван без адреса", status: "400" },
      { code: "not-youtube", meaning: "адрес — не ролик YouTube", status: "400" },
      { code: "engine-unreachable", meaning: "движок браузера не поднят — отказ сразу", status: "503" },
      { code: "not-built", meaning: "такого метода договор не объявляет", status: "404" },
      { code: "url-invalid", meaning: "по адресу: не адрес или имя не разрешается", status: "в results" },
      { code: "url-forbidden", meaning: "по адресу: машина, петля, частная сеть, другая схема или перенаправление туда", status: "в results / 400" },
      { code: "page-failed", meaning: "по адресу: страница не открылась; why и trace говорят, чего она ждала", status: "в results / 502" },
      { code: "page-timeout", meaning: "по адресу: нет ответа за время на адрес", status: "в results / 502" },
      { code: "video-unavailable", meaning: "youtube: такого ролика нет, с причиной YouTube", status: "422" },
      { code: "youtube-bot-check", meaning: "youtube: YouTube потребовал подтвердить, что зовущий не бот, — ролик есть, адрес сервера под проверкой", status: "422" },
      { code: "consent-wall", meaning: "youtube: вместо ролика YouTube показал страницу согласия", status: "422" },
      { code: "no-player-data", meaning: "youtube: на странице нет данных плеера", status: "422" },
    ],
    status: "код ответа",
  },
  service: {
    contract: "Договор машинно. Схемы инструментов агента порождаются из этого ответа ПО HTTP, а не копируются из исходника: копия расходится молча.",
    health: "Открыт, ключ не нужен: живость, версия договора и состояние движка браузера (статус, перезапуски, последняя ошибка).",
  },
};

const DICT: Record<string, ApiDocWords> = { en: EN, ru: RU };

/** Слова языка. Неизвестный язык падает на английский — тот же закон, что у соседей. */
export function apiDocWords(lang: string): ApiDocWords {
  return DICT[lang] ?? EN;
}

/** Какие языки вкладка умеет говорить сейчас. */
export const API_DOC_LANGS = Object.keys(DICT);
