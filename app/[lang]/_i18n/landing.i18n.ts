// СЛОВА ПУБЛИЧНОГО ЛЕНДИНГА ПАМЯТИ (186).
//
// 🎯 ИСТОЧНИК — ДВА ТЕКСТА ВЛАДЕЛЬЦА 2026-09-11: английский и его же русская
// редакция. Английская ветка собрана из первого, русская — из второго дословно
// по смыслу; это один текст на двух языках, а не две редакции обещания.
//
// 🔒 СТРАНИЦА ГОВОРИТ НА ОДНОМ ЯЗЫКЕ — том, который выбрал человек (требование
// того же дня). До 82 языков это дорастает добавлением веток с теми же ключами;
// ни один компонент при этом не правится.
//
// 🔒 КОНКУРЕНТЫ И СТРОКИ СРАВНЕНИЯ — ДАННЫЕ, А НЕ РАЗМЕТКА. Владелец прислал
// вторую таблицу через минуту после первой; третья придёт так же. Прибавление
// соперника обязано быть правкой словаря, иначе каждая новая таблица требует
// программиста.

export type ComparisonTable = {
  title: string;
  rivals: string[];
  rows: Array<{ feature: string; ours: string; rivals: string[] }>;
};

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
  /** Оглавление страницы (194-12): надпись над списком и подпись навигации для экранного диктора. */
  toc: { heading: string; label: string };
  problem: { title: string; lead: string; body: string };
  router: {
    title: string;
    lead: string;
    inbox: string;
    routerBox: string;
    cheapBranch: string;
    cheapCost: string;
    deepBranch: string;
    deepCost: string;
  };
  schema: { title: string; body: string };
  ladder: {
    title: string;
    lead: string;
    head: { level: string; how: string; cost: string; by: string };
    rows: Array<{ level: string; how: string; cost: string; by: string }>;
    example: string;
  };
  scope: { title: string; lead: string; items: Array<{ title: string; body: string }> };
  artifacts: { title: string; lead: string; steps: string[] };
  memoization: { title: string; lead: string; chain: string[] };
  evolution: { title: string; lead: string; items: Array<{ title: string; body: string }> };
  stores: { title: string; lead: string; items: Array<{ title: string; body: string }> };
  media: { title: string; lead: string; items: Array<{ title: string; body: string }> };
  bench: { title: string; lead: string; items: string[]; where: string };
  api: { title: string; lead: string; samples: Array<{ title: string; code: string }> };
  comparison: { title: string; lead: string; feature: string; ours: string; tables: ComparisonTable[] };
  /**
   * Установка — одна мысль, без команд.
   *
   * 🎯 ТРЕБОВАНИЕ ВЛАДЕЛЬЦА 2026-09-11: «убери информацию о том, как выполнять
   * установку. Единственное, что нужно знать, — достаточно роботом-установщиком
   * Fractera запустить установку на собственном сервере, и автоматически встанут
   * все микросервисы, включая память».
   * 🔒 ПОЧЕМУ ЭТО ВЕРНЕЕ, А НЕ ПРОСТО КОРОЧЕ: команда установки на лендинге живёт
   * своей жизнью и устаревает молча — человек скопирует её через полгода и
   * получит отказ. Установку делает робот, и знать про неё нужно ровно это.
   */
  install: { title: string; lead: string; body: string };
  principles: { title: string; items: Array<{ title: string; body: string }> };
  /**
   * Вопросы и ответы — блок стартера, перенесённый сюда целиком по замыслу.
   *
   * 🔒 ОДИН ИСТОЧНИК НА ГЛАЗА И НА РАЗМЕТКУ: `FAQPage` строится из этих же
   * строк. Вторая копия «для поисковика» разошлась бы с видимой на первой
   * правке, а расхождение разметки с текстом страницы — это ровно то, за что
   * поисковик наказывает.
   */
  faq: { title: string; lead: string; items: Array<{ q: string; a: string }> };
  /** Слова для мета-тегов: то, что человек увидит в выдаче. */
  seo: { title: string; description: string };
  /** Единственная внешняя ссылка страницы — на проект Fractera. */
  project: { label: string; body: string };
  cta: { title: string; body: string; primary: string; secondary: string };
};

const CURL_REMEMBER_EN = `curl -X POST https://memory.your-domain.com/v1/remember \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "Office lease note",
    "media": [{ "url": "https://.../note.oga" }],
    "scope": [{ "at": "2026-09-11", "lat": 40.4168, "lon": -3.7038, "radius_m": 500 }]
  }'`;

const CURL_RADIUS_EN = `curl -X POST https://memory.your-domain.com/v1/recall \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "What notes or files did I save within 500 meters of here?",
    "scope": [{ "lat": 40.4168, "lon": -3.7038, "radius_m": 500 }]
  }'`;

const CURL_DEEP_EN = `curl -X POST https://memory.your-domain.com/v1/recall \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "Summarize all my taxi expenses from last month into a table",
    "depth": "deep",
    "want_chain": true
  }'`;

const CURL_REMEMBER_RU = `curl -X POST https://memory.your-domain.com/v1/remember \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "Заметка по аренде офиса",
    "media": [{ "url": "https://.../note.oga" }],
    "scope": [{ "at": "2026-09-11", "lat": 40.4168, "lon": -3.7038, "radius_m": 500 }]
  }'`;

const CURL_RADIUS_RU = `curl -X POST https://memory.your-domain.com/v1/recall \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "Что я сохранял в радиусе полукилометра отсюда?",
    "scope": [{ "lat": 40.4168, "lon": -3.7038, "radius_m": 500 }]
  }'`;

const CURL_DEEP_RU = `curl -X POST https://memory.your-domain.com/v1/recall \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "Сведи все расходы на такси за прошлый месяц в таблицу",
    "depth": "deep",
    "want_chain": true
  }'`;

const EN: LandingWords = {
  api: {
    lead: "One REST API, one key. Every example below runs against a live instance as it stands.",
    samples: [
      { code: CURL_REMEMBER_EN, title: "Store a voice note with spatial coordinates" },
      { code: CURL_RADIUS_EN, title: "Recall everything within a radius" },
      { code: CURL_DEEP_EN, title: "Deep reasoning with the chain returned" },
    ],
    title: "API quickstart",
  },
  artifacts: {
    lead:
      "Asked to summarise complex data — last month's spending, a project's state — memory does not hand back a wall of text. It builds the thing you asked for:",
    steps: [
      "Instantiates a structured entity: a typed table with the columns the answer needs.",
      "Compiles, sorts and formats a clean Markdown artifact with its own Object ID.",
      "Returns a short executive summary next to the artifact, so the answer reads well and the detail stays referenceable.",
    ],
    title: "Knowledge becomes an object, not a paragraph",
  },
  bench: {
    items: [
      "Execute direct API requests against the memory core with no front-end abstraction in the way.",
      "Inspect raw JSON payloads, execution timings and exact model token usage.",
      "Verify the request body before committing a line of client code.",
    ],
    lead:
      "The engine ships with an interactive bench. It is not a demo page: it is where an integration is proven before it is written.",
    title: "Testing and verification in the built-in playground",
    where: "/{lang}/settings?section=memory-test",
  },
  cta: {
    body:
      "Read the full design in the passport — the document written before the code and kept in step with it ever since.",
    primary: "Open the passport",
    secondary: "Open the bench",
    title: "See how it is built",
  },
  comparison: {
    feature: "Capability",
    lead:
      "Two comparisons: one against the categories of memory tooling, one against a ready-made assistant of a different philosophy.",
    ours: "Fractera Memory",
    tables: [
      {
        rivals: ["Standard RAG frameworks", "MemGPT / Letta", "Mem0 / Zep"],
        rows: [
          {
            feature: "Storage architecture",
            ours: "Hybrid: graph + vector + relational + object store",
            rivals: ["Vector DB only", "Relational / text files", "Vector plus a basic graph"],
          },
          {
            feature: "Zero-token reads",
            ours: "Yes — deterministic paths at levels 1–3",
            rivals: ["No", "No", "Partial"],
          },
          {
            feature: "Native multimodality",
            ours: "Built in: audio, video, images, PDF, Markdown, HTML, source code",
            rivals: ["Requires external parsers", "Requires external parsers", "Text focused"],
          },
          {
            feature: "Spatial proximity indexing",
            ours: "Native lat/lon radius search",
            rivals: ["Text matching only", "Function calling only", "Basic metadata"],
          },
          {
            feature: "Skill evolution",
            ours: "Champion / challenger A/B testing",
            rivals: ["None", "Manual prompt edits", "None"],
          },
          {
            feature: "Self-hosted / open source",
            ours: "100% on-premise, single node",
            rivals: ["Varies", "Yes", "Freemium / cloud"],
          },
        ],
        title: "Against the categories",
      },
      {
        rivals: ["IVA Agent (smixs/iva-agent)"],
        rows: [
          {
            feature: "System classification",
            ours: "An autonomous memory engine behind an API, for any front-end",
            rivals: ["An end-to-end Telegram assistant tied to an Obsidian vault"],
          },
          {
            feature: "Architecture",
            ours: "A decoupled microservice; the Telegram bot is an optional client",
            rivals: ["A monolith: Telegram, userbot and vault manager in one codebase"],
          },
          {
            feature: "Cost optimisation",
            ours: "A five-tier deterministic router; instant zero-token reads",
            rivals: ["Every operation leans on model passes, BM25 and vector lookups"],
          },
          {
            feature: "Data processing",
            ours: "Dynamic SQL tables, structured artifacts, a knowledge graph",
            rivals: ["Markdown cards written to a folder for Obsidian to sync"],
          },
          {
            feature: "Integrations",
            ours: "Many front-ends at once over one REST API",
            rivals: ["Bound to one Telegram account and an Obsidian setup"],
          },
        ],
        title: "Against a ready-made assistant",
      },
    ],
    title: "How it compares",
  },
  evolution: {
    items: [
      {
        body:
          "The model is forbidden from scoring its own work. Verdicts come from outside — explicit architect feedback and strict compute-cost ratios.",
        title: "No self-evaluation",
      },
      {
        body:
          "A challenger is promoted to champion only when it wins on external quality metrics with no regression in speed or cost.",
        title: "Deterministic promotion",
      },
      {
        body:
          "Every modification is a commit. One click reverts the instructions to the baseline version through Git, with no data loss.",
        title: "Versioning and safe rollback",
      },
    ],
    lead:
      "When the engine detects repeated misses or a sub-optimal path, it writes a candidate skill and runs it as a challenger in the shadow — on real production traffic, while people keep being answered by the verified champion.",
    title: "A self-evolving skill core with shadow A/B testing",
  },
  faq: {
    items: [
      {
        a: "No. The engine answers levels 1 to 3 without a model at all: a direct lookup, a graph traversal, a conclusion already folded back into the stores. A model turn is spent only when the cheap deterministic paths return nothing, and the answer reports depth_used so you can see what you paid for.",
        q: "Does every request cost tokens?",
      },
      {
        a: "Yes. A scope entry carries lat, lon and an optional radius_m, and the coordinates are spatially indexed. You can ask what you know within 500 metres of a point, and knowledge recorded in Madrid never merges with knowledge recorded in London.",
        q: "Can it answer questions about a place by coordinates, not by a word?",
      },
      {
        a: "Voice notes, images, video, PDF, Markdown, HTML and source code (TypeScript, Python, SQL and more). Every file gets a full description detailed enough for another AI to reconstruct it, and a summary of about 50 words: speech is transcribed by OpenAI whisper-1 with timestamps, a video is split into its sound track and frames on one timeline, and pictures, documents, pages and code are read by Claude — code is never executed. The original stays in the built-in object store next to its full description and is referenced from answers by id.",
        q: "What can I send besides text?",
      },
      {
        a: "None. You send a sentence. The engine adds columns as new kinds of fact appear and generates typed relational tables when a kind grows into an entity. There are no migrations to write.",
        q: "What schema do I have to design first?",
      },
      {
        a: "It folds the result back. The artifact goes to the object store, its summary into text, into the vector store and into the knowledge graph, and the relation tables are updated. The same question is then answered from the cheap levels, in fractions of a second.",
        q: "What happens after an expensive research run?",
      },
      {
        a: "It writes a second version of the skill and runs it as a challenger in the shadow, on real traffic, while people keep being answered by the champion. Promotion needs an external verdict and no regression in cost: the engine is never allowed to grade its own work.",
        q: "How does it improve itself without breaking what works?",
      },
      {
        a: "Any HTTP client: a Telegram bot, a web chat, a mobile app, a scheduled job. The engine also ships with its own console, already connected, and that console is optional: nothing in the API path depends on it.",
        q: "What can I connect to it?",
      },
      {
        a: "On your server, in your database, in your object store, behind a key you can revoke in one click. There is no metered API in the middle and no telemetry leaving the machine.",
        q: "Where does my data live?",
      },
    ],
    lead: "Short answers to what people ask before they integrate.",
    title: "Questions and answers",
  },
  project: {
    body:
      "Fractera Memory is one microservice of the Fractera platform, the engineering infrastructure for autonomous agents. The whole project, this engine included, is open source.",
    label: "The Fractera project on GitHub",
  },
  seo: {
    description:
      "Self-hosted memory engine for AI agents: knowledge graph, vector and relational stores, built-in object storage, geospatial lat/lon radius recall, native voice, image, video, PDF, Markdown, HTML and source-code input, zero-token deterministic reads and champion/challenger skill evolution. One REST API, open source.",
    title: "Fractera Memory — self-hosted memory engine for AI agents",
  },
  toc: { heading: "On this page", label: "Contents" },
  hero: {
    badges: ["Zero per-request fees", "Zero vendor lock-in", "Full privacy on your server"],
    body:
      "The engine ingests raw, unstructured real-world input — text, images, voice notes, video, whole PDF documents, Markdown and HTML pages, source code, precise spatial-temporal coordinates and dates — and turns it into an indexed knowledge graph and structured relational stores, without unnecessary model calls and without per-request token costs.",
    eyebrow: "Fractera Memory Starter",
    lead:
      "An autonomous, self-hosted long-term memory engine and the cognitive core for AI agents. Built to work as the architect's personal command centre through Telegram and a unified REST API, it closes the gap between a volatile context window and real cognitive continuity.",
    primary: "Read the API",
    secondary: "Open the passport",
    title: "The deterministic, multimodal, self-evolving memory engine for autonomous AI agents",
  },
  install: {
    body:
      "One run of the Fractera installer robot on your own server brings up every microservice of the platform, memory included — nginx, certificates and the access key are arranged for you. There is nothing to assemble by hand.",
    lead: "There is exactly one thing to know about installing this.",
    title: "Installation",
  },
  ladder: {
    example:
      "«What is my passport number?» resolves instantly at level 1 for zero tokens. «Which of my contacts could have known this person?» escalates through levels 3–5 and comes back as a probabilistic reasoning chain.",
    head: { by: "Opened by", cost: "Cost and purpose", how: "Retrieval mechanism", level: "Level" },
    lead:
      "Every request is resolved with the minimum compute that can answer it. A query escalates only when the cheaper, deterministic tiers fail to produce a complete answer.",
    rows: [
      {
        by: "Engine router",
        cost: "$0 / 0 tokens. Sub-10 ms latency. Exact factual properties.",
        how: "Direct SQL / key-value query, no model",
        level: "Level 1",
      },
      {
        by: "Engine router",
        cost: "Minimal. Direct execution and simple parsing.",
        how: "Single-pass model call without conversation history",
        level: "Level 2",
      },
      {
        by: "Engine router",
        cost: "Low. Context retrieved without generating model tokens.",
        how: "Knowledge graph traversal plus a context session",
        level: "Level 3",
      },
      {
        by: "Caller — depth: deep",
        cost: "Higher. Fuzzy semantic search across historical context.",
        how: "Semantic vector store retrieval",
        level: "Level 4",
      },
      {
        by: "Caller — depth: extreme",
        cost: "Maximum. Multi-hypothesis research and unstated facts.",
        how: "Bounded recursive deep reasoning, up to 10 minutes",
        level: "Level 5",
      },
    ],
    title: "Cost-first architecture: the cost ladder",
  },
  media: {
    items: [
      { body: "Speech-to-text by OpenAI whisper-1, with a timestamp on every segment.", title: "Audio" },
      { body: "Read by a vision model: every element, its position, colours and all visible text.", title: "Images" },
      { body: "The sound track is transcribed and six frames are read — one timeline, frames between the lines.", title: "Video" },
      { body: "The document is read whole: its structure and its content, tables row by row.", title: "PDF" },
      { body: "Markdown is kept as the document it renders into; HTML as a page and as its source.", title: "Markdown and HTML" },
      { body: "Source code is described — purpose, structure, exports — with the source verbatim, and never run.", title: "Source code" },
    ],
    lead: "Not a preprocessor bolted on the side. The pipeline lives inside the engine.",
    title: "Native multimodality",
  },
  memoization: {
    chain: [
      "An expensive computation or research loop runs at level 4 or 5",
      "An artifact is created with its ID, alongside a concise conclusion",
      "The conclusion is indexed into the vector store, the knowledge graph and the tables",
      "Repeat questions are answered in 0.2 s at levels 1–3, for zero tokens",
    ],
    lead: "Nothing expensive is paid for twice. Every high-cost chain is folded back down into the cheaper tiers.",
    title: "The memoization loop",
  },
  principles: {
    items: [
      {
        body: "All data, graphs and media stay strictly on your machine. No telemetry, no hidden cloud dependency.",
        title: "Complete data ownership",
      },
      {
        body:
          "What a person stated is logged as fact (said); what the engine inferred is flagged as hypothesis (guess) and stored only with its evidence (basis).",
        title: "Fact attribution",
      },
      {
        body:
          "Connect the official Telegram starter, or attach your own web chat, mobile app and automation pipelines over HTTP. The bundled console is a microservice of its own, and it is optional.",
        title: "Headless engine architecture",
      },
    ],
    title: "Design principles",
  },
  problem: {
    body:
      "Fractera Memory works as a black box engine: in go multimodal input and runtime context parameters, out come structured objects, synthesised data, verified conclusions or actionable reports. One architecture unifies four storage layers under a deterministic multi-level router.",
    lead:
      "Standard RAG pipelines and vector stores make agents lose critical context at every session reset, burn compute re-reading long logs, and never synthesise personal experience over time.",
    title: "The architect's operating system",
  },
  router: {
    cheapBranch: "Levels 1–3 · direct database and graph traversal",
    cheapCost: "Zero tokens, no model, sub-10 ms",
    deepBranch: "Levels 4–5 · vector search and deep reasoning",
    deepCost: "A model turn: hypothesis chains and reports",
    inbox: "Incoming stream — text, geolocation, voice, images, video, PDF, Markdown, HTML, code, dates",
    lead: "One entry point, one router, two very different costs behind it.",
    routerBox: "Deterministic multi-level router",
    title: "How a request travels",
  },
  schema: {
    body:
      "No manual migrations, no static schema design. The engine adapts its schema on the fly — adding columns, and generating fully typed relational SQL tables whenever new structured entities and relationships appear.",
    title: "End-to-end schema adaptability",
  },
  scope: {
    items: [
      {
        body: "An empty spatial-temporal scope means «location and time unknown» — never «everywhere and always».",
        title: "The strict boundary rule",
      },
      {
        body:
          "«Which taxi service do I usually use here?» asked in Madrid returns Madrid knowledge, and never collides with or overwrites the same question answered in London.",
        title: "Context isolation",
      },
      {
        body:
          "A built-in spatial index over lat, lon and radius_m answers proximity queries: notes, expenses and records near this point.",
        title: "Radius search",
      },
    ],
    lead: "Time and coordinates are first-class indexes here, not flat text tags.",
    title: "Spatial-temporal context",
  },
  stores: {
    items: [
      { body: "Tabular structures, typed facts, exact entity properties.", title: "Relational store" },
      { body: "High-dimensional semantic embeddings for fuzzy similarity search.", title: "Vector store" },
      { body: "Directional links between entities, people and events.", title: "Knowledge graph" },
      { body: "Whole files on your server — images, audio, video, PDF, Markdown, HTML, code — each next to its full description.", title: "Object store" },
    ],
    lead: "Four layers, one contract. The caller never learns which of them answered.",
    title: "Four unified storage tiers",
  },
};

const RU: LandingWords = {
  api: {
    lead: "Один REST API, один ключ. Каждый пример ниже работает на живой службе как есть.",
    samples: [
      { code: CURL_REMEMBER_RU, title: "Сохранение голосовой заметки с координатами" },
      { code: CURL_RADIUS_RU, title: "Поиск по пространственному радиусу" },
      { code: CURL_DEEP_RU, title: "Глубокое исследование с выводом цепочки" },
    ],
    title: "Быстрый старт и примеры API",
  },
  artifacts: {
    lead:
      "Память не просто пишет текстом цифры или факты. При запросах на сведение данных — отчёт по финансам, состояние проекта — система:",
    steps: [
      "Автоматически создаёт сущность или таблицу с теми колонками, которые нужны ответу.",
      "Собирает, сортирует и сводит Markdown-структуру, присваивая уникальный ID артефакта.",
      "Отдаёт короткое резюме вместе с готовым объектом: ответ читается, подробность остаётся адресуемой.",
    ],
    title: "Материализация знаний и генерация отчётов",
  },
  bench: {
    items: [
      "Выполнять прямые запросы к ядру памяти без единой прослойки интерфейса.",
      "Видеть сырой JSON ответа, время исполнения и точный расход токенов модели.",
      "Проверять форму тела запроса раньше, чем написана первая строка клиента.",
    ],
    lead:
      "Память поставляется с интерактивным стендом. Это не демонстрационная страница: здесь интеграция доказывается до того, как её пишут.",
    title: "Проверка на встроенном стенде",
    where: "/{язык}/settings?section=memory-test",
  },
  cta: {
    body:
      "Полный замысел — в паспорте: документе, написанном раньше кода и с тех пор идущем с ним в ногу.",
    primary: "Открыть паспорт",
    secondary: "Открыть стенд",
    title: "Посмотреть, как это устроено",
  },
  comparison: {
    feature: "Возможность",
    lead:
      "Два сравнения: с категориями инструментов памяти и с готовым ассистентом другой философии.",
    ours: "Fractera Memory",
    tables: [
      {
        rivals: ["Обычные RAG-фреймворки", "MemGPT / Letta", "Mem0 / Zep"],
        rows: [
          {
            feature: "Архитектура хранения",
            ours: "Гибрид: граф + вектор + реляционное + объектное",
            rivals: ["Только векторная база", "Реляционное / текстовые файлы", "Вектор плюс простой граф"],
          },
          {
            feature: "Чтение за ноль токенов",
            ours: "Да — детерминированные пути уровней 1–3",
            rivals: ["Нет", "Нет", "Частично"],
          },
          {
            feature: "Родная мультимодальность",
            ours: "Встроена: звук, видео, изображения, PDF, Markdown, HTML, исходный код",
            rivals: ["Нужны внешние парсеры", "Нужны внешние парсеры", "Ориентирован на текст"],
          },
          {
            feature: "Пространственный индекс",
            ours: "Родной поиск по lat/lon и радиусу",
            rivals: ["Только совпадение по тексту", "Только через вызов функций", "Простые метаданные"],
          },
          {
            feature: "Эволюция навыков",
            ours: "A/B-тестирование: чемпион против претендента",
            rivals: ["Нет", "Ручная правка промптов", "Нет"],
          },
          {
            feature: "Свой сервер и открытый код",
            ours: "100% на вашем железе, один узел",
            rivals: ["По-разному", "Да", "Freemium / облако"],
          },
        ],
        title: "Против категорий",
      },
      {
        rivals: ["IVA Agent (smixs/iva-agent)"],
        rows: [
          {
            feature: "Назначение",
            ours: "Автономное ядро памяти за API — для любых интерфейсов",
            rivals: ["Готовый Telegram-ассистент с заметочником в Obsidian"],
          },
          {
            feature: "Модульность",
            ours: "Изолированный микросервис; Telegram-бот — опциональный клиент",
            rivals: ["Монолит: Telegram, юзербот и управление хранилищем в одном коде"],
          },
          {
            feature: "Управление расходами",
            ours: "Пятиуровневый детерминированный роутер; чтение без токенов",
            rivals: ["Каждая операция опирается на вызовы модели, BM25 и векторы"],
          },
          {
            feature: "Работа с данными",
            ours: "Авто-создание SQL-таблиц, артефакты-отчёты с ID, граф связей",
            rivals: ["Markdown-карточки в папку для синхронизации Obsidian"],
          },
          {
            feature: "Гибкость подключения",
            ours: "Десятки интерфейсов одновременно через один REST API",
            rivals: ["Привязан к одному аккаунту Telegram и настройке Obsidian"],
          },
        ],
        title: "Против готового ассистента",
      },
    ],
    title: "Сравнительный анализ",
  },
  evolution: {
    items: [
      {
        body:
          "Модель не оценивает свою работу сама. Вердикт выносится снаружи — на основе оценок архитектора и анализа затрат.",
        title: "Запрет на самооценку",
      },
      {
        body:
          "Претендент заменяет чемпиона только тогда, когда выигрывает по качеству и не уступает по стоимости и скорости.",
        title: "Продвижение по правилам",
      },
      {
        body:
          "Каждая правка фиксируется коммитом. В любой момент доступен сброс до эталонной первой версии через git, без потери накопленных данных.",
        title: "Страховка и версионность",
      },
    ],
    lead:
      "Если память фиксирует повторяющиеся промахи, она создаёт альтернативную версию навыка и запускает её претендентом в тени — на реальном трафике, пока человек получает ответы от проверенного чемпиона.",
    title: "Эволюция навыков с A/B сплит-тестированием",
  },
  faq: {
    items: [
      {
        a: "Нет. Уровни с первого по третий память отвечает вообще без модели: прямой поиск по базе, обход графа, готовый вывод, уже сложенный обратно в хранилища. Ход модели тратится, только когда дешёвые детерминированные пути ничего не вернули, и ответ называет depth_used, чтобы было видно, за что вы заплатили.",
        q: "Каждый запрос стоит токенов?",
      },
      {
        a: "Да. В записи охвата есть lat, lon и необязательный radius_m, а координаты идут в пространственный индекс. Можно спросить, что известно в радиусе 500 метров от точки, и мадридское знание никогда не смешается с лондонским.",
        q: "Умеет ли она отвечать про место по координатам, а не по слову?",
      },
      {
        a: "Голосовые заметки, изображения, видео, PDF, Markdown, HTML и исходный код (TypeScript, Python, SQL и другие). Каждый файл получает полное описание — настолько подробное, что другой ИИ восстановит по нему сам объект, — и саммари примерно в 50 слов: речь расшифровывает OpenAI whisper-1 с метками времени, видео разбирается на звуковую дорожку и кадры на одной шкале, а картинки, документы, страницы и код читает Claude — код при этом никогда не запускается. Оригинал остаётся во встроенном объектном хранилище рядом со своим полным описанием и адресуется из ответа по id.",
        q: "Что можно присылать, кроме текста?",
      },
      {
        a: "Никакую. Вы присылаете фразу. Память добавляет колонки, когда появляются новые роды фактов, и порождает типизированные таблицы, когда род вырастает в сущность. Миграции писать не нужно.",
        q: "Какую схему нужно спроектировать заранее?",
      },
      {
        a: "Он замыкается обратно. Артефакт уходит в объектное хранилище, его саммари — в текст, в векторную базу и в граф знаний, а таблицы связей обновляются. Тот же вопрос потом отвечается на дешёвых уровнях, за доли секунды.",
        q: "Что происходит после дорогого исследования?",
      },
      {
        a: "Она пишет вторую версию навыка и запускает её претендентом в тени, на реальном трафике, пока человеку отвечает чемпион. Для продвижения нужен внешний вердикт и отсутствие проседания по цене: оценивать свою работу самой памяти запрещено.",
        q: "Как она улучшает себя, не ломая работающее?",
      },
      {
        a: "Любой HTTP-клиент: Telegram-бот, веб-чат, мобильное приложение, фоновая задача. Вместе с памятью идёт и её собственная консоль, уже подключённая, и она при этом опциональна: путь API от неё не зависит.",
        q: "Что к ней можно подключить?",
      },
      {
        a: "На вашем сервере, в вашей базе, в вашем объектном хранилище, за ключом, который отзывается одним нажатием. Ни платного посредника, ни телеметрии наружу.",
        q: "Где живут мои данные?",
      },
    ],
    lead: "Короткие ответы на то, о чём спрашивают до интеграции.",
    title: "Вопросы и ответы",
  },
  project: {
    body:
      "Fractera Memory — один из микросервисов платформы Fractera, инженерной инфраструктуры для автономных агентов. Весь проект, включая эту память, с открытым исходным кодом.",
    label: "Проект Fractera на GitHub",
  },
  seo: {
    description:
      "Автономная память для ИИ-агентов на вашем сервере: граф знаний, векторное и реляционное хранилища, встроенное объектное хранилище, поиск по координатам и радиусу, приём голоса, изображений, видео, PDF, Markdown, HTML и исходного кода, детерминированное чтение за ноль токенов и эволюция навыков через A/B. Один REST API, открытый код.",
    title: "Fractera Memory — автономная память для ИИ-агентов на вашем сервере",
  },
  toc: { heading: "На этой странице", label: "Оглавление" },
  hero: {
    badges: ["Ноль комиссий за запрос", "Ноль зависимости от поставщика", "Полная приватность на вашем сервере"],
    body:
      "Память превращает необработанные мультимодальные данные — текст, изображения, голосовые заметки, видео, PDF-документы, страницы Markdown и HTML, исходный код, геолокацию и временные метки — в индексированный граф знаний и реляционные структуры, без лишних вызовов языковых моделей и расходов на токены.",
    eyebrow: "Fractera Memory Starter",
    lead:
      "Автономная система долгосрочной памяти и когнитивный мозг для ИИ-агентов, служащая персональным пультом управления архитектора через Telegram и REST API. Она ликвидирует разрыв между ограниченным контекстным окном модели и полноценной когнитивной непрерывностью.",
    primary: "Читать API",
    secondary: "Открыть паспорт",
    title: "Детерминированное, мультимодальное, самоэволюционирующее ядро памяти для автономных ИИ-агентов",
  },
  install: {
    body:
      "Один запуск робота-установщика Fractera на вашем сервере поднимает все микросервисы платформы, включая память: nginx, сертификаты и ключ доступа настраиваются за вас. Собирать руками нечего.",
    lead: "Про установку нужно знать ровно одно.",
    title: "Установка",
  },
  ladder: {
    example:
      "На вопрос «какой у меня номер паспорта?» система отвечает на уровне 1 мгновенно и бесплатно. Запрос «кто из моих контактов мог знать этого человека?» уходит на уровни 3–5 и возвращается вероятностной цепочкой рассуждений.",
    head: { by: "Кто открывает", cost: "Затраты и назначение", how: "Чем достаётся", level: "Уровень" },
    lead:
      "Память стремится решить любую задачу с минимальными затратами ресурсов и времени. Запрос поднимается на более дорогой уровень только тогда, когда предыдущий дешёвый уровень не дал ответа.",
    rows: [
      {
        by: "Роутер системы",
        cost: "0$ / 0 токенов. Задержка меньше 10 мс. Точечные факты и свойства.",
        how: "Поиск по строкам в локальной базе, без ИИ",
        level: "Уровень 1",
      },
      {
        by: "Роутер системы",
        cost: "Минимальные. Простая обработка или лёгкая эвристика.",
        how: "Одиночный запрос к модели без истории",
        level: "Уровень 2",
      },
      {
        by: "Роутер системы",
        cost: "Низкие. Готовый контекст графа извлекается без вызова модели.",
        how: "Запрос к графу связей плюс сессия контекста",
        level: "Уровень 3",
      },
      {
        by: "Архитектор — depth: deep",
        cost: "Высокие. Семантический поиск по всей истории.",
        how: "Подключение векторного хранилища по смыслу",
        level: "Уровень 4",
      },
      {
        by: "Архитектор — depth: extreme",
        cost: "Максимальные. Сбор гипотез и поиск ненаписанных фактов.",
        how: "Рекурсивное исследование, автономный цикл до 10 минут",
        level: "Уровень 5",
      },
    ],
    title: "Экономический закон архитектуры",
  },
  media: {
    items: [
      { body: "Речь в текст — OpenAI whisper-1, с меткой времени у каждого фрагмента.", title: "Звук" },
      { body: "Читает модель со зрением: каждый элемент, его место, цвета и весь видимый текст.", title: "Изображения" },
      { body: "Звуковая дорожка расшифровывается, шесть кадров прочитываются — одна шкала, кадры между репликами.", title: "Видео" },
      { body: "Документ читается целиком: структура и содержание, таблицы построчно.", title: "PDF" },
      { body: "Markdown хранится тем документом, которым становится; HTML — страницей и её исходником.", title: "Markdown и HTML" },
      { body: "Исходный код описывается — назначение, устройство, экспорт — и хранится дословно, но никогда не запускается.", title: "Исходный код" },
    ],
    lead: "Не препроцессор, который приделывают сбоку. Конвейер живёт внутри памяти.",
    title: "Нативная мультимодальность",
  },
  memoization: {
    chain: [
      "Дорогой расчёт или исследование проходит на уровне 4–5",
      "Создаётся артефакт с ID и саммари вывода рядом с ним",
      "Саммари записывается в векторную базу, граф связей и таблицы",
      "Повторный аналогичный вопрос обрабатывается за 0.2 с на уровнях 1–3 и стоит ноль токенов",
    ],
    lead: "За дорогое не платят дважды. Любая дорогая цепочка замыкается обратно, на дешёвые уровни.",
    title: "Замыкание дорогого расчёта",
  },
  principles: {
    items: [
      {
        body: "Все базы данных и файлы находятся на вашем сервере. Никакой телеметрии и скрытых облачных зависимостей.",
        title: "Ваши данные принадлежат вам",
      },
      {
        body:
          "Факты фиксируются со статусом said — сказано человеком; догадки со статусом guess и обязательным указанием оснований basis.",
        title: "Точность фактов",
      },
      {
        body:
          "Используйте готовый fractera-telegrambot-starter или подключайте собственные веб-чаты, мобильные приложения и скрипты по HTTP. Встроенная консоль — отдельный микросервис, и она опциональна.",
        title: "Безинтерфейсное ядро",
      },
    ],
    title: "Философия разработки",
  },
  problem: {
    body:
      "Fractera Memory работает по принципу чёрного ящика: на входе мультимодальный текст и параметры, на выходе — готовый объект, сведение данных, проверенный вывод или отчёт. Единая система объединяет четыре типа хранилищ под управлением детерминированного роутера.",
    lead:
      "Традиционные подходы — RAG и векторные базы — заставляют ИИ забывать контекст при сбросе сессии, расходуют огромные бюджеты на вычитку длинных логов и не способны накапливать личный опыт.",
    title: "Операционная система архитектора",
  },
  router: {
    cheapBranch: "Уровни 1–3 · прямой поиск по базе и графу",
    cheapCost: "0 токенов, без ИИ, задержка меньше 10 мс",
    deepBranch: "Уровни 4–5 · векторы и глубокие рассуждения",
    deepCost: "Вызов языковой модели: цепочки гипотез и отчёты",
    inbox: "Входящий поток — текст, геолокация, голос, фото, видео, PDF, Markdown, HTML, код, даты",
    lead: "Один вход, один роутер и две очень разные цены за ним.",
    routerBox: "Детерминированный многоуровневый роутер",
    title: "Как проходит запрос",
  },
  schema: {
    body:
      "Вам не нужно вручную создавать SQL-миграции или закладывать фиксированную структуру данных. Память трансформирует структуру хранилища на лету: от добавления новых колонок до автоматического создания реляционных таблиц при появлении новых типов сущностей.",
    title: "Сквозная адаптивность схемы",
  },
  scope: {
    items: [
      {
        body: "Пустой охват контекста означает «не знаю где и когда», но никогда — «везде и всегда».",
        title: "Строгое правило охвата",
      },
      {
        body:
          "Вопрос «каким такси я обычно здесь пользуюсь?», заданный в Мадриде, вернёт локальный ответ для Мадрида и никогда не смешается с тем же вопросом в Лондоне.",
        title: "Контекстная изоляция",
      },
      {
        body:
          "Поддержка lat, lon и radius_m позволяет находить записи, файлы и расходы в пространственном радиусе от указанной точки.",
        title: "Поиск по радиусу",
      },
    ],
    lead: "Время и пространственные координаты — фундаментальные индексы, а не произвольные текстовые теги.",
    title: "Физический контекст",
  },
  stores: {
    items: [
      { body: "Табличные структуры, типизированные факты, явные свойства объектов.", title: "Реляционное хранилище" },
      { body: "Семантический поиск и работа с нечётким текстом.", title: "Векторное хранилище" },
      { body: "Направленные связи между сущностями, людьми и событиями.", title: "Граф знаний" },
      { body: "Файлы целиком на вашем сервере — фото, аудио, видео, PDF, Markdown, HTML, код — каждый рядом со своим полным описанием.", title: "Объектное хранилище" },
    ],
    lead: "Четыре хранилища под одной обёрткой. Зовущий никогда не узнаёт, которое из них ответило.",
    title: "Четыре хранилища под одним договором",
  },
};

const DICT: Record<string, LandingWords> = { en: EN, ru: RU };

/** Слова языка. Неизвестный язык падает на английский — тот же закон, что у соседей. */
export function landingWords(lang: string): LandingWords {
  return DICT[lang] ?? EN;
}

/** Какие языки лендинг умеет говорить сейчас. Прибор спрашивает это, а не список в тексте. */
export const LANDING_LANGS = Object.keys(DICT);
