// СЛОВА ПУБЛИЧНОЙ ГЛАВНОЙ СЛУЖБЫ ИИ-БРАУЗЕРА (196-5).
//
// 🪦 СКОПИРОВАНО СО СЛОВАРЯ ГЛАВНОЙ ПАМЯТИ (186) по слову владельца 2026-09-13: «полностью скопируешь memory и уберешь
// лишнее». Устройство то же — один язык на странице, ветки en/ru с одинаковыми ключами, данные вместо разметки; содержание —
// о браузере. Разделы памяти (лестница цены, хранилища, эволюция навыков, сравнения) сняты: у браузера их нет.
//
// 🔒 КАЖДОЕ ЧИСЛО НА СТРАНИЦЕ — ИЗМЕРЕННОЕ, И У НЕГО ЕСТЬ ПРИБОР: пределы — `LIMITS` в `lib/browser.mjs`; «645 → 3289» — TodoMVC,
// прибор `scripts/probe/read.mjs`; запрет адресов — тот же прибор, со слушателем на петле. Число без прибора — обещание.
// 🔒 ПРО YOUTUBE СКАЗАНО ТО, ЧТО ВЕРНО ПРИ ЛЮБОМ ИСХОДЕ: субтитры — когда плеер их отдаёт, иначе данные ролика и причина.

export type LandingWords = {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    body: string;
    badges: string[];
    primary: string;
    secondary: string;
  };
  toc: { heading: string; label: string };
  problem: { title: string; lead: string; body: string };
  flow: { title: string; lead: string; steps: Array<{ title: string; body: string }> };
  returns: { title: string; lead: string; items: Array<{ title: string; body: string }> };
  security: { title: string; lead: string; items: Array<{ title: string; body: string }> };
  youtube: { title: string; lead: string; items: Array<{ title: string; body: string }> };
  bench: { title: string; lead: string; items: string[]; where: string };
  api: { title: string; lead: string; samples: Array<{ title: string; code: string }> };
  limits: { title: string; lead: string; head: { what: string; value: string }; rows: Array<{ what: string; value: string }> };
  /** Установка — одна мысль, без команд: команда на странице устаревает молча (закон главной памяти). */
  install: { title: string; lead: string; body: string };
  principles: { title: string; items: Array<{ title: string; body: string }> };
  /** Вопросы и ответы — один источник на глаза и на разметку `FAQPage`. */
  faq: { title: string; lead: string; items: Array<{ q: string; a: string }> };
  seo: { title: string; description: string };
  project: { label: string; body: string };
  cta: { title: string; body: string; primary: string; secondary: string };
};

const CURL_READ = `curl -X POST https://ai-browser.your-domain.com/v1/read \\
  -H "Content-Type: application/json" -H "x-ai-browser-key: YOUR_KEY" \\
  -d '{ "urls": ["https://todomvc.com/examples/react/dist/"] }'`;

const CURL_MANY = `curl -X POST https://ai-browser.your-domain.com/v1/read \\
  -H "Content-Type: application/json" -H "x-ai-browser-key: YOUR_KEY" \\
  -d '{ "urls": [
    "https://developer.mozilla.org/en-US/docs/Web/HTML",
    "https://en.wikipedia.org/wiki/Web_browser",
    "https://example.com/"
  ] }'`;

const CURL_YOUTUBE = `curl -X POST https://ai-browser.your-domain.com/v1/youtube \\
  -H "Content-Type: application/json" -H "x-ai-browser-key: YOUR_KEY" \\
  -d '{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "lang": "en" }'`;

const EN: LandingWords = {
  api: {
    lead: "One REST API, one key. Two methods: read pages, read a YouTube video.",
    samples: [
      { code: CURL_READ, title: "Read an application that is drawn by scripts" },
      { code: CURL_MANY, title: "Read several pages in one call" },
      { code: CURL_YOUTUBE, title: "Read a YouTube video: data and subtitles with timestamps" },
    ],
    title: "API quickstart",
  },
  bench: {
    items: [
      "Paste addresses one per line and see exactly the answer a program receives.",
      "Open the final HTML, the visible text, headings, interactive elements and media lists.",
      "See what a page tried to reach inside the machine and was refused.",
    ],
    lead: "The service ships with a bench behind architect sign-in. It calls the same contract as any program — there is no second path into the browser.",
    title: "The read test bench",
    where: "/{lang}/settings?section=read-test",
  },
  cta: {
    body: "Read the service passport — what it is for, how it is built and where its limits are.",
    primary: "Open the passport",
    secondary: "Read the API",
    title: "See how it is built",
  },
  faq: {
    items: [
      {
        a: "Because many pages are drawn by scripts. A plain request to TodoMVC returns 645 characters of HTML; the browser returns 3,289 after the scripts have run — the list, the input field, the buttons. A plain request sees an empty template, the browser sees the page a person sees.",
        q: "Why a real browser instead of a plain HTTP request?",
      },
      {
        a: "No. Addresses of the machine itself, loopback, private networks and link-local ranges are refused before a tab opens, and again on every request the page makes — images, frames, fetch, redirects and WebSockets. All browser traffic leaves through the service's own proxy, which resolves each name itself and connects only to the address it checked. A probe on the server counts hits on a loopback listener: zero, including after a redirect to 127.0.0.1.",
        q: "Can a page I open reach inside my server?",
      },
      {
        a: "For every address: the final URL and status, the title, the full final HTML, all visible text, lang and canonical, meta tags, headings h1–h6, links, buttons, forms and fields with their labels, images, video, audio and frames by their attributes — each list with items and total. Plus what the page tried to reach and was refused, and whether the page reached its load event.",
        q: "What exactly comes back?",
      },
      {
        a: "You still get the video's data — title, description, channel, duration, dates, views — with transcript: null and a reason in words. Subtitles are taken from the request the player itself makes; when the player gives none, the answer says so instead of returning an empty success.",
        q: "What if a YouTube video has no subtitles?",
      },
      {
        a: "A light page opens in a few seconds; a heavy one with dozens of third-party resources takes 20–60 s. Up to 10 addresses per call, opened strictly one after another — the server has one browser, and it works with one page at a time for every caller; 90 s per address once its turn comes.",
        q: "How fast is it?",
      },
      {
        a: "No. The browser does not sign in to sites and does not solve bot checks. If a site shows a check page instead of its content, you get that page with its status code — measured: a Vercel security checkpoint came back as status 403 with its own title.",
        q: "Does it sign in to sites or get past bot protection?",
      },
      {
        a: "Memory calls it first, to keep pages and videos people send. Other services of the server and agents call it over the same contract with a key; processes of the same machine use the machine secret.",
        q: "Who calls it?",
      },
      {
        a: "On your server. The browser, its cache and every page it opens stay on the machine; there is no third-party scraping service in the middle.",
        q: "Where does it run?",
      },
    ],
    lead: "Short answers to what people ask before they integrate.",
    title: "Questions and answers",
  },
  flow: {
    lead: "One entry point, and every step between the caller and the page is a check.",
    steps: [
      { body: "A program sends addresses with its key, or a process of this machine with the machine secret.", title: "The caller" },
      { body: "Scheme and address are checked before a tab exists: only http and https, never the machine, loopback or a private network.", title: "Address check" },
      { body: "Each address gets its own browser context and its own proxy. Cookies of one page never reach the next.", title: "A guarded tab" },
      { body: "Camoufox opens the page, waits for the document, the load event and network quiet — each wait with its own limit.", title: "Real browser" },
      { body: "The final HTML, text, elements and media by attributes, and the list of what was refused.", title: "The answer" },
    ],
    title: "How a request travels",
  },
  hero: {
    badges: ["Pages as a person sees them", "Nothing inside the machine is reachable", "Runs on your server"],
    body: "Memory, other services and agents give it addresses and get back the final HTML after scripts, all the text, headings, links, buttons, forms, fields and media by attributes — for several pages in one call. YouTube videos come back with their data and subtitles with timestamps.",
    eyebrow: "Fractera AI Browser",
    lead: "A real browser on your server for machines: it opens pages and web applications the way a person does and returns what is actually on them.",
    primary: "Read the API",
    secondary: "Open the passport",
    title: "A real browser for AI agents and services",
  },
  install: {
    body: "One run of the Fractera installer robot on your own server brings up every microservice of the platform, the AI browser included — the browser engine, its libraries, nginx and the access key are arranged for you.",
    lead: "There is exactly one thing to know about installing this.",
    title: "Installation",
  },
  limits: {
    head: { value: "Limit", what: "What" },
    lead: "Limits are stated in the answer itself, and anything cut is marked — a list of 300 links out of 2,000 carries total: 2000.",
    rows: [
      { value: "10", what: "Addresses per call" },
      { value: "1 — strictly in turn", what: "Pages open at once" },
      { value: "90 s", what: "Time per address" },
      { value: "5,000,000 characters", what: "Final HTML per page" },
      { value: "1,000,000 characters", what: "Visible text per page" },
      { value: "300 items", what: "Each list of elements" },
    ],
    title: "Limits",
  },
  principles: {
    items: [
      {
        body: "The bench, the API and every method open pages through one guarded tab. A second path into the browser would bypass the address ban.",
        title: "One path into the browser",
      },
      {
        body: "Every refusal has a permanent code and a reason: url-forbidden, page-timeout, not-youtube, video-unavailable. A failed address never breaks the others in the same call.",
        title: "Refusals are named",
      },
      {
        body: "What is cut is marked, what did not load is said. load_reached: false means the page was returned without waiting for its load event.",
        title: "Nothing is silent",
      },
    ],
    title: "Design principles",
  },
  problem: {
    body: "The AI browser is a separate microservice with its own address, its own key and its own pages. It does one thing: opens what it is given with a real browser and returns the result in a form a program can use.",
    lead: "An agent that reads the web with plain HTTP requests sees empty templates of script-drawn pages and meta tags instead of content. And a browser running next to your data is a risk of its own if a page can make it knock on the machine's internal doors.",
    title: "What it solves",
  },
  project: {
    body: "Fractera AI Browser is one microservice of the Fractera platform, the engineering infrastructure for autonomous agents. The whole project, this service included, is open source.",
    label: "The Fractera project on GitHub",
  },
  returns: {
    items: [
      { body: "The full HTML after scripts have run, and all visible text — not the source the server sent.", title: "Final HTML and text" },
      { body: "Title, lang, canonical, meta tags and headings h1–h6 with their levels.", title: "Structure" },
      { body: "Links, buttons, forms and fields with their names, labels, placeholders and options.", title: "Interactive elements" },
      { body: "Images, video, audio and frames by their attributes: address, alt, poster, duration, title.", title: "Media by attributes" },
    ],
    lead: "A shallow look at elements and media by their attributes, and the whole text and code of the page.",
    title: "What comes back",
  },
  security: {
    items: [
      { body: "Scheme, literal IP and resolved name are checked before a tab opens: loopback, private networks, link-local and the machine's own addresses are refused.", title: "Before the tab" },
      { body: "All browser traffic leaves through the service's own proxy for that address. It resolves names itself and connects only to the address it checked — redirects and WebSockets included.", title: "Every request" },
      { body: "The browser engine is started so that even loopback goes through the proxy; by default Firefox would send it past.", title: "No way around" },
    ],
    lead: "The browser stands next to the data layer and other services. A page must not be able to use it as hands inside the machine.",
    title: "Nothing inside the machine is reachable",
  },
  seo: {
    description: "Self-hosted AI browser for agents and services: a real Camoufox browser that returns final HTML after scripts, all text, headings, links, forms, fields and media by attributes for several pages at once, YouTube data and subtitles with timestamps, and refuses every address inside the machine. One REST API, open source.",
    title: "Fractera AI Browser — a real browser for AI agents on your server",
  },
  toc: { heading: "On this page", label: "Contents" },
  youtube: {
    items: [
      { body: "Title, description, channel, duration, publish and upload dates, views, keywords — from the video page itself.", title: "Video data" },
      { body: "Taken from the request the player makes when subtitles are turned on, as lines [mm:ss–mm:ss] text. A language can be asked for.", title: "Subtitles with timestamps" },
      { body: "No subtitles or the player gave none — the video's data with transcript: null and the reason in words.", title: "What was obtained, and why" },
    ],
    lead: "The same browser, a method of its own: youtube returns the content of a video, not the page around it.",
    title: "YouTube",
  },
};

const RU: LandingWords = {
  api: {
    lead: "Один REST API, один ключ. Два метода: прочитать страницы, прочитать ролик YouTube.",
    samples: [
      { code: CURL_READ, title: "Прочитать приложение, которое рисуют скрипты" },
      { code: CURL_MANY, title: "Прочитать несколько страниц одним вызовом" },
      { code: CURL_YOUTUBE, title: "Прочитать ролик YouTube: данные и субтитры с метками времени" },
    ],
    title: "Быстрый старт и примеры API",
  },
  bench: {
    items: [
      "Вставить адреса по одному в строке и увидеть ровно тот ответ, который получает программа.",
      "Раскрыть итоговый HTML, видимый текст, заголовки, интерактивные элементы и списки медиа.",
      "Увидеть, что страница пыталась достать внутри машины и получила отказ.",
    ],
    lead: "Служба поставляется со стендом за входом архитектора. Он зовёт тот же договор, что и любая программа, — второго пути в браузер нет.",
    title: "Стенд «Тест чтения»",
    where: "/{язык}/settings?section=read-test",
  },
  cta: {
    body: "Паспорт службы — зачем она, как устроена и где её пределы.",
    primary: "Открыть паспорт",
    secondary: "Читать API",
    title: "Посмотреть, как это устроено",
  },
  faq: {
    items: [
      {
        a: "Потому что многие страницы рисуют скрипты. Простой запрос к TodoMVC получает 645 знаков HTML, браузер после скриптов отдаёт 3 289 — список, поле ввода, кнопки. Простой запрос видит пустую заготовку, браузер — страницу, которую видит человек.",
        q: "Зачем настоящий браузер, а не простой HTTP-запрос?",
      },
      {
        a: "Нет. Адреса самой машины, петли, частных сетей и link-local отвергаются до открытия вкладки и ещё раз на каждом запросе страницы — картинках, фреймах, fetch, перенаправлениях и WebSocket. Весь выход браузера идёт через собственный прокси службы: он сам разрешает имя и соединяется только с проверенным адресом. Прибор на сервере считает обращения к слушателю на петле: ноль, в том числе после перенаправления на 127.0.0.1.",
        q: "Может ли открытая страница достать что-то внутри моего сервера?",
      },
      {
        a: "По каждому адресу: итоговый адрес и код, заголовок, итоговый HTML целиком, весь видимый текст, lang и canonical, мета-теги, заголовки h1–h6, ссылки, кнопки, формы и поля с подписями, картинки, видео, звук и фреймы по атрибутам — у каждого списка items и total. И ещё — что страница пыталась достать и получила отказ, и дождалась ли она события load.",
        q: "Что именно приходит в ответ?",
      },
      {
        a: "Данные ролика всё равно приходят — название, описание, канал, длительность, даты, просмотры — с transcript: null и причиной словами. Субтитры берутся из запроса самого плеера; если плеер их не отдал, ответ говорит это, а не отдаёт пустой успех.",
        q: "А если у ролика YouTube нет субтитров?",
      },
      {
        a: "Лёгкая страница открывается за несколько секунд, тяжёлая с десятками сторонних ресурсов — за 20–60 с. До 10 адресов за вызов, открываются строго по очереди — у сервера один браузер, и он работает с одной страницей за раз для всех зовущих; на адрес 90 с, когда подошла его очередь.",
        q: "Насколько это быстро?",
      },
      {
        a: "Нет. Браузер не входит на сайты под учётной записью и не проходит проверки на ботов. Если сайт вместо содержимого показал страницу проверки, вы получите её с кодом ответа — измерено: проверка безопасности Vercel пришла кодом 403 со своим заголовком.",
        q: "Входит ли он на сайты и проходит ли защиту от ботов?",
      },
      {
        a: "Первой — память: чтобы сохранять страницы и ролики, которые присылают люди. Другие службы сервера и агенты зовут его тем же договором с ключом; процессы этой же машины — секретом машины.",
        q: "Кто его зовёт?",
      },
      {
        a: "На вашем сервере. Браузер, его кэш и каждая открытая страница остаются на машине; стороннего сервиса скрейпинга посередине нет.",
        q: "Где он работает?",
      },
    ],
    lead: "Короткие ответы на то, о чём спрашивают до интеграции.",
    title: "Вопросы и ответы",
  },
  flow: {
    lead: "Один вход, и каждый шаг между зовущим и страницей — проверка.",
    steps: [
      { body: "Программа присылает адреса с ключом, процесс этой машины — с секретом машины.", title: "Зовущий" },
      { body: "Схема и адрес проверяются раньше, чем появится вкладка: только http и https, никогда машина, петля или частная сеть.", title: "Проверка адреса" },
      { body: "У каждого адреса свой контекст браузера и свой прокси. Куки одной страницы не достаются следующей.", title: "Защищённая вкладка" },
      { body: "Camoufox открывает страницу и ждёт документ, событие load и тишину сети — у каждого ожидания свой предел.", title: "Настоящий браузер" },
      { body: "Итоговый HTML, текст, элементы и медиа по атрибутам и список того, что было отвергнуто.", title: "Ответ" },
    ],
    title: "Как проходит запрос",
  },
  hero: {
    badges: ["Страницы такими, какими их видит человек", "Внутрь машины не достать", "Работает на вашем сервере"],
    body: "Память, другие службы и агенты дают ему адреса и получают итоговый HTML после скриптов, весь текст, заголовки, ссылки, кнопки, формы, поля и медиа по атрибутам — по нескольким страницам за один вызов. Ролики YouTube приходят с данными и субтитрами с метками времени.",
    eyebrow: "Fractera AI Browser",
    lead: "Настоящий браузер на вашем сервере для машин: открывает страницы и веб-приложения так, как их открывает человек, и возвращает то, что на них на самом деле есть.",
    primary: "Читать API",
    secondary: "Открыть паспорт",
    title: "Настоящий браузер для ИИ-агентов и служб",
  },
  install: {
    body: "Один запуск робота-установщика Fractera на вашем сервере поднимает все микросервисы платформы, включая ИИ-браузер: движок браузера, его библиотеки, nginx и ключ доступа настраиваются за вас.",
    lead: "Про установку нужно знать ровно одно.",
    title: "Установка",
  },
  limits: {
    head: { value: "Предел", what: "Что" },
    lead: "Пределы названы в самом ответе, а обрезанное помечено: список из 300 ссылок при 2 000 на странице несёт total: 2000.",
    rows: [
      { value: "10", what: "Адресов за вызов" },
      { value: "1 — строго по очереди", what: "Страниц одновременно" },
      { value: "90 с", what: "Время на адрес" },
      { value: "5 000 000 знаков", what: "Итоговый HTML страницы" },
      { value: "1 000 000 знаков", what: "Видимый текст страницы" },
      { value: "300 записей", what: "Каждый список элементов" },
    ],
    title: "Пределы",
  },
  principles: {
    items: [
      {
        body: "Стенд, API и каждый метод открывают страницы через одну защищённую вкладку. Второй путь в браузер обошёл бы запрет адресов.",
        title: "Один путь в браузер",
      },
      {
        body: "У каждого отказа вечный код и причина: url-forbidden, page-timeout, not-youtube, video-unavailable. Неоткрывшийся адрес не роняет остальные в том же вызове.",
        title: "Отказы названы",
      },
      {
        body: "Обрезанное помечено, незагрузившееся названо. load_reached: false значит, что страница отдана, не дождавшись события load.",
        title: "Ничего не молчит",
      },
    ],
    title: "Философия разработки",
  },
  problem: {
    body: "ИИ-браузер — отдельный микросервис со своим адресом, своим ключом и своими страницами. Он делает одно: открывает то, что ему дали, настоящим браузером и возвращает результат в виде, пригодном для программы.",
    lead: "Агент, читающий веб простыми HTTP-запросами, видит пустые заготовки страниц, которые рисуют скрипты, и мета-теги вместо содержимого. А браузер рядом с вашими данными — отдельный риск, если страница может заставить его стучаться во внутренние двери машины.",
    title: "Какую задачу решает",
  },
  project: {
    body: "Fractera AI Browser — один из микросервисов платформы Fractera, инженерной инфраструктуры для автономных агентов. Весь проект, включая эту службу, с открытым исходным кодом.",
    label: "Проект Fractera на GitHub",
  },
  returns: {
    items: [
      { body: "HTML целиком после исполнения скриптов и весь видимый текст — не исходник, присланный сервером.", title: "Итоговый HTML и текст" },
      { body: "Заголовок, lang, canonical, мета-теги и заголовки h1–h6 с уровнями.", title: "Структура" },
      { body: "Ссылки, кнопки, формы и поля с именами, подписями, подсказками и вариантами выбора.", title: "Интерактивные элементы" },
      { body: "Картинки, видео, звук и фреймы по атрибутам: адрес, alt, постер, длительность, заголовок.", title: "Медиа по атрибутам" },
    ],
    lead: "Поверхностный разбор элементов и медиа по атрибутам — и весь текст и код страницы.",
    title: "Что возвращается",
  },
  security: {
    items: [
      { body: "Схема, буквальный IP и разрешённое имя проверяются до открытия вкладки: петля, частные сети, link-local и адреса самой машины отвергаются.", title: "До вкладки" },
      { body: "Весь выход браузера идёт через собственный прокси службы для этого адреса. Он сам разрешает имена и соединяется только с проверенным адресом — перенаправления и WebSocket тоже.", title: "На каждом запросе" },
      { body: "Движок браузера запущен так, что даже петля идёт через прокси; по умолчанию Firefox отправил бы её мимо.", title: "Без обхода" },
    ],
    lead: "Браузер стоит рядом со слоем данных и другими службами. Страница не должна получить его руки внутри машины.",
    title: "Внутрь машины не достать",
  },
  seo: {
    description: "ИИ-браузер для агентов и служб на вашем сервере: настоящий браузер Camoufox отдаёт итоговый HTML после скриптов, весь текст, заголовки, ссылки, формы, поля и медиа по атрибутам по нескольким страницам сразу, данные и субтитры роликов YouTube с метками времени и отвергает любой адрес внутри машины. Один REST API, открытый код.",
    title: "Fractera AI Browser — настоящий браузер для ИИ-агентов на вашем сервере",
  },
  toc: { heading: "На этой странице", label: "Оглавление" },
  youtube: {
    items: [
      { body: "Название, описание, канал, длительность, даты публикации и загрузки, просмотры, ключевые слова — со страницы самого ролика.", title: "Данные ролика" },
      { body: "Берутся из запроса, который делает плеер при включении субтитров, строками [мм:сс–мм:сс] текст. Язык можно попросить.", title: "Субтитры с метками времени" },
      { body: "Субтитров нет или плеер их не отдал — данные ролика, transcript: null и причина словами.", title: "Что досталось и почему" },
    ],
    lead: "Тот же браузер, свой метод: youtube возвращает содержание ролика, а не страницу вокруг него.",
    title: "YouTube",
  },
};

const DICT: Record<string, LandingWords> = { en: EN, ru: RU };

/** Слова языка. Неизвестный язык падает на английский — тот же закон, что у соседей. */
export function landingWords(lang: string): LandingWords {
  return DICT[lang] ?? EN;
}

/** Какие языки главная умеет говорить сейчас. Прибор спрашивает это, а не список в тексте. */
export const LANDING_LANGS = Object.keys(DICT);
