// СЛОВА ВКЛАДКИ API — ОТДЕЛЬНЫЙ СЛОВАРЬ, ПО ОБЩЕМУ СТАНДАРТУ (185-2).
//
// 🎯 ТРЕБОВАНИЕ ВЛАДЕЛЬЦА 2026-09-11, ДОСЛОВНО: «на одной странице не надо
// делать текст и на русском и на английском поддерживать стандарт
// мультиязычности чтобы мы в будущем могли эти страницы масштабировать до 82
// языков».
//
// 🪦 ОТМЕНЯЕТ ЕГО ЖЕ РЕШЕНИЕ ТОГО ЖЕ ДНЯ — «используем английский язык для
// любой версии» и «Postman должен быть описан на обоих языках». Обе половины
// прежнего решения сняты одной правкой: страница говорит на ОДНОМ языке — том,
// который человек выбрал, — и Postman в том числе.
//
// 🔒 КАК ЭТО ДОРАСТЁТ ДО 82 ЯЗЫКОВ: сюда добавляются ветки с теми же ключами,
// файлом от внешней модели — ровно так же, как у `lib/words.mjs` и у словаря
// страницы. Ни один компонент при этом не правится.
//
// 🔒 ОПИСАНИЯ МЕТОДОВ И ПАРАМЕТРОВ ЖИВУТ ЗДЕСЬ, А НЕ В ДОГОВОРЕ, И ЭТО НЕ
// ПРОТИВОРЕЧИТ ЗАКОНУ «ПОРОЖДАТЬ, А НЕ ПЕРЕЧИСЛЯТЬ». Порождается СПИСОК: какие
// методы есть, какие у них параметры, какие обязательны — всё это страница
// берёт из `contract.mjs` и переписать руками не может. Здесь лежат только
// ПЕРЕВОДЫ, ключами по именам из договора.
// 🛑 И РАСХОЖДЕНИЕ ЛОВИТСЯ ПРИБОРОМ, А НЕ ВНИМАТЕЛЬНОСТЬЮ: `scripts/probe/api-i18n.mjs`
// проверяет, что у каждого метода и каждого параметра договора есть слова в
// КАЖДОМ языке. Нет перевода — страница показывает текст договора и помечает
// его как непереведённый, а прибор краснеет.

export type ApiDocWords = {
  /** Заголовки разделов — они же пункты оглавления. */
  h: {
    overview: string;
    baseUrl: string;
    auth: string;
    methods: string;
    catalogue: string;
    service: string;
    threads: string;
    paramsReport: string;
    refusals: string;
    examples: string;
    limits: string;
    postman: string;
  };
  overview: { lead: string; audience: string; twoVerbs: string };
  baseUrl: { lead: string; readBody: string };
  auth: { lead: string; headers: string; denied: string };
  methods: { lead: string; body: string; parameter: string; type: string; required: string; meaning: string; yes: string; no: string; returns: string; onMiss: string; untranslated: string };
  catalogue: { lead: string; law: string; health: string; contract: string };
  threads: { lead: string; measured: string; deny: string; unknown: string };
  paramsReport: { lead: string; accepted: string; notSupported: string; badForm: string; never: string };
  refusals: { lead: string; moneyVsKey: string };
  examples: { tell: string; ask: string; deny: string; scope: string; keepFile: string; keepUrl: string; find: string; file: string };
  limits: { lead: string; items: string[] };
  postman: { lead: string; steps: string[]; quota: string };
  /** Переводы описаний методов договора: about · returns · onMiss. */
  method: Record<string, { about: string; returns: string; onMiss: string }>;
  /** Переводы описаний параметров договора, ключ — имя параметра. */
  param: Record<string, string>;
  /** Переводы описаний каталога, ключ — путь из договора. */
  catalogueItem: Record<string, string>;
};

const EN: ApiDocWords = {
  auth: {
    denied:
      "The key is compared in constant time, so a wrong key reveals nothing about how wrong it was. Calls without a valid key get 401 with error: \"no-access\".",
    headers: "Send it in either header — both are accepted:",
    lead:
      "Every /v1/* call except /v1/health requires the memory access key. One key covers both reading and writing: there are no separate scopes, and pretending otherwise would be a lie about what the server checks.",
  },
  baseUrl: {
    lead:
      "All calls are POST with a JSON body, except the catalogue and the two service endpoints below. Send Content-Type: application/json. Responses are always JSON and always no-store.",
    readBody:
      "Read the body, not the status code. Memory answers 200 with ok:false for refusals it understands — a missing thread, a malformed date, an exhausted subscription window. A non-200 status means the call never reached the verb at all. A client that branches on the status code alone will report a refusal as success.",
  },
  catalogue: {
    contract:
      "The machine-readable contract. Tool schemas for an agent should be generated from this response over HTTP rather than copied from source: a copy diverges silently.",
    health:
      "Open, no key required: liveness, contract version and the name-quality figure. Installers and watchdogs call it, and saying «I am alive» reveals nothing about anyone.",
    law:
      "A source table is named in the answer and never accepted in the question. Knowing the names helps you ask a better question; it does not let you query a table directly. Deciding where to look is memory's job — that is what makes it a black box rather than a database with a thin cover.",
    lead:
      "Two read-only endpoints answer the question «what does memory have» — in names, not in rows.",
  },
  catalogueItem: {
    "GET /v1/tables": "names of everything memory keeps about a person; usually this is enough",
    "GET /v1/tables/{имя}": "the description of one table — if its name did not explain itself",
    "GET /v1/objects/{id}/file": "the object's file itself — bytes with the type and name it was stored with; id comes from find_objects or keep_object",
  },
  examples: {
    ask: "Ask what it knows. No question means everything, and that path calls no model at all:",
    deny: "Continue the same reasoning and overturn what it concluded:",
    file: "Download the file of an object — the same bytes that were stored:",
    find: "Find objects by meaning — other words than inside the object are fine; no model is called:",
    keepFile: "Keep a whole thing — a photo, a voice note, a PDF, source code. The body is a form with the file; memory describes it itself:",
    keepUrl: "Or name the file by its address — memory downloads it itself. Addresses inside the machine and web pages are refused:",
    scope: "Give the fact a scope — several dates and places are normal, so scope is a list:",
    tell: "Tell memory something a person said, in their own words:",
  },
  h: {
    auth: "Authentication",
    baseUrl: "Base URL",
    catalogue: "Catalogue",
    examples: "Worked examples",
    limits: "Boundaries that are design, not gaps",
    methods: "Methods",
    overview: "Memory API — what this service is",
    paramsReport: "Every optional parameter reports its own fate",
    postman: "Testing with Postman",
    refusals: "Refusal codes",
    service: "Health and contract",
    threads: "Threads of reasoning, and why continuing one is cheaper",
  },
  limits: {
    items: [
      "The caller never queries a table directly. Source names travel out in the answer and are not accepted in the question: deciding where to look is memory's job, and that is what keeps it a black box rather than a database under a thin cover.",
      "Memory keeps no history of your requests. Each call is a closed cycle; continuity is offered explicitly, through the reasoning thread, so nothing leaks between callers by accident.",
      "Facts about third parties are recognised and reported rather than stored against the wrong person. The answer says what was skipped and why.",
      "Relations between two people are kept as graph edges, not as fields on a row: a relation has a source and a target, and squeezing it into a column would lose one of them.",
      "A value is never quietly promoted. An inference is stored only with its grounds, and an empty scope means «I do not know where and when» — never «everywhere, always»."
    ],
    lead: "Stated plainly, because a boundary nobody named is one every caller works around in their own way:",
  },
  method: {
    find_objects: {
      about:
        "Find memory's objects by the meaning of a question — photos, documents, recordings, code kept by keep_object or by remember attachments. Searches the search cards with one embedding and no model turn.",
      onMiss:
        "Nothing closer than the threshold — ok:true, found:false and an empty results. That is not «it does not exist»: ask again in other words. The store is unreachable — ok:false with the reason.",
      returns:
        "found; results — what came closer than the threshold, best first: id, title, summary, kind, messageId (the row in messages_that_came_into_memory), name, mime, size, score, preview; threshold — the closeness threshold; lost — search cards whose file was erased behind memory's back.",
    },
    keep_object: {
      about:
        "Keep a whole thing in memory — a photo, voice note, video, PDF, Markdown, HTML, source code, text. Send a multipart form with the file in the file part, or JSON with url — then memory downloads the file itself. Memory writes the description: the full one next to the file, the summary into the table row and the search card, the full one with its origin into the graph. Send your own summary and no model is called.",
      onMiss:
        "A kind memory cannot read — 400 describe-kind-unsupported, nothing written. An address inside the machine or a private network — 400 url-forbidden; a web page — 400 is-a-page; the address does not answer — 502 url-unreachable. A storage step failed — 502 with the reason: what was already written is removed, the row stays with status failed and its messageId comes back. The model did not answer or the subscription window ran out — 502 with the reason.",
      returns:
        "messageId — the row in messages_that_came_into_memory linking the object, its search card and its graph document; object — the object card (id, name, size); title and summary — how the object will be found; kind; described — whether the model was called; ms — how long it took; url — the final address, when the file was named by one.",
    },
    open_object: {
      about:
        "Open an object you found: its card, its text in parts for textual kinds, and the address of the file itself. Call it when the summary from find_objects was not enough to answer.",
      onMiss: "An unknown id or one that is not memory's — ok:false with error not-found or not-ours. The store is unreachable — ok:false with the reason.",
      returns:
        "card — the object card; text — a piece of the text (null for images, video, audio), with from, shown, total and limit saying where this piece is and how much there is; file — the file address: GET it from the memory address with the same key.",
    },
    forget_journal: {
      about:
        "Erase memory's account of its own work. Knowledge about people is untouched — only the journal is cleared. Irreversible: what is erased comes back from nowhere.",
      onMiss: "The journal was empty anyway — ok:true and cleared:0.",
      returns: "cleared — how many entries were erased. A number, not a «done»: it proves exactly what was removed.",
    },
    journal: {
      about:
        "What memory did: its own account of its work, in plain text. For whoever is working out why memory answered the way it did. Not for a conversation with a person — this is a story about the service, not knowledge about them.",
      onMiss: "No entries yet — ok:true and an empty text: memory simply did nothing since the last clearing.",
      returns:
        "text — the document as it stands; entries — how many records it holds; bytes — how much space it takes. Every record says what arrived, what the model returned, what was decided, WHAT WAS DROPPED AND WHY, what went out and how long it took.",
    },
    people: {
      about:
        "Who memory knows at all. For a caller asking about the system rather than about themselves: a screen, a probe, an installer. An agent in a conversation does not need it — it always knows who it is talking to.",
      onMiss: "It knows nobody — ok:true and an empty list: not an error, an honest «nobody has told me anything yet».",
      returns: "people — those it has records about, each with the date of the first record.",
    },
    recall: {
      about:
        "Ask memory about a person. Without a question it returns everything it knows — instantly, and without spending a model call. With a question it searches mechanically first.",
      onMiss:
        "Nothing is recorded about this person — ok:true and an empty known. If the question matches nothing, everything known comes back and the answer says there was no exact match.",
      returns:
        "known — what is known; every value carries from_table (which table answered), claim (said by the person or inferred) and basis (what it was inferred from). not_yet_known — what is missing and why it matters; used_model — whether the model was called. depth_asked and depth_used — the limit you asked for and the level memory actually reached. used_input — which of the context you sent took part in the search. chain — the steps of the search, and only if you asked for them. params — the fate of every optional parameter.",
    },
    remember: {
      about:
        "Tell memory what a person said, in their own words. Where it lands, whether a new place is created and what to do about a contradiction — memory decides.",
      onMiss:
        "There are no facts about the person in the phrase — ok:true and an empty noted; that is not an error. If it cannot be parsed at all, a refusal arrives with its reason: out of credit, key rejected, or the model unreachable.",
      returns:
        "what_happened — words you can say to a person; noted — what exactly was written down, each entry with from_table and claim. On a contradiction it says «was X, now Y»: the latest wins, but out loud. params — the fate of every optional parameter. objects — the fate of every media attachment: the object id and messageId, or a refusal with its reason. thread — the name of the reasoning thread: send it back to continue this same chain.",
    },
  },
  methods: {
    body: "body",
    lead:
      "Generated from the live contract — the same object the service returns from GET /v1/contract. If a parameter appears here, the server accepts it today.",
    meaning: "meaning",
    no: "no",
    onMiss: "When nothing is found.",
    parameter: "parameter",
    required: "required",
    returns: "Returns.",
    type: "type",
    untranslated: "[not translated yet]",
    yes: "yes",
  },
  overview: {
    audience:
      "This page is written for machines and for the people who wire them: an agent, a bot, a backend job, a spreadsheet script. Below is the complete public surface. The method list is generated from the live contract, so it cannot drift away from what the server actually accepts.",
    lead:
      "Fractera Memory is a black box. You speak to it in ordinary human sentences and you ask it questions in ordinary human sentences. Where a fact is stored, whether a new column or a new table is created, whether a language model is called at all — memory decides on its own and does not expose any of that. There is no schema to design and no table to declare before you start.",
    twoVerbs:
      "Two verbs, and that is the whole idea. remember changes what memory knows; recall never changes anything. Everything else — the catalogue, the journal — exists to explain what memory did, not to let you reach inside it.",
  },
  param: {
    anchors: "Graph anchors — a JSON array of names of people, places, products. Not given — the model names them, or the title is used.",
    at: "Date of the entry, YYYY-MM-DD.",
    author: "Who sent it, in words — for example the person's name in Telegram. Not given — who is used.",
    file: "Either file or url. The file itself — the file part of multipart/form-data. Memory decides the kind from the name and type: image · video · audio · PDF · Markdown · HTML · source code · text.",
    from: "Which character to continue the text from. Not given — from the beginning.",
    full: "Your own full description — detailed enough to reconstruct the object from it.",
    id: "The object id from find_objects or keep_object.",
    media: "Attachments: a list of {url} — file addresses. Memory downloads each file and keeps it the same way as keep_object: description, object store, search card, graph, table row. Memory decides the kind itself. A web page (text/html) is refused: pages are kept by the links method. The fate of each attachment comes back in objects.",
    name: "The file name with its extension. Not given — the name of the file part or of the address is used.",
    question: "What you are looking for, in an ordinary sentence — other words than inside the object are fine.",
    source: "Where the object came from: api · telegram · …. Not given — api. It goes into the table row and the header of the graph document.",
    summary: "Your own summary, about 50 words. Given — no model is called, and the full description comes from full.",
    tags: "Tags — a JSON array of strings in a form field.",
    title: "Your own title. Not given — the model writes it.",
    url: "Either url or file. An http or https file address — JSON body; memory downloads the file itself, up to 200 MB. Addresses inside the machine or a private network, and web pages (text/html), are refused.",
    deny: "Overturning an earlier conclusion: what is wrong with it. The conclusion is cancelled, the fact is not — the grounds remain. Meaningful only together with thread: without returning to the earlier chain there is nothing to overturn.",
    depth: "Depth limit in words: standard · deep · extreme. Level numbers stay inside memory; what travels out is words and cost.",
    history: "The previous conversation: a calling model may hand it over together with the question.",
    lang: "Language of the words meant for a person: ru or en. Not given — Russian; unknown — English.",
    need_table: "Require what was recorded to become its own table at once, without waiting for a second value of the same kind.",
    place: "Place of the entry.",
    prior: "What has already been found before this question.",
    scope: "Scope: a LIST of {at, place, lat, lon, radius_m} entries. Date as YYYY-MM-DD, place in words; an entry needs at least one of the two. There can be many: one phrase may carry several dates and places. An empty scope means «I do not know where and when», not «everywhere and always».",
    text: "For remember: the person's phrase as it was said, without paraphrasing. For recall: the question in a human sentence — without it, everything known comes back.",
    thread: "The reasoning thread: the identifier of an earlier deliberation, to continue it instead of starting over. Memory returns it in every answer where it thought. Continuing is CHEAPER than a fresh call.",
    want_chain: "Whether to return the steps of the search. Default is no: whoever asked decides whether to fill their own context.",
    who: "Whose facts these are: a stable key for the person.",
  },
  paramsReport: {
    accepted: "taken and acted upon; note states what it did and where its limit is",
    badForm: "wrong shape; the parameter is dropped, the reason is named, and the rest of the call still runs",
    lead: "Any answer that received optional parameters carries params — one row per parameter you sent:",
    never:
      "A parameter you sent will never simply vanish. If params says nothing about it, you did not send it.",
    notSupported:
      "well-formed, but the ability behind it is not built yet — said in words, never by silence",
  },
  postman: {
    lead: "Seven steps, and the last one is the one people skip.",
    quota:
      "A note on quota: remember spends a turn of the owner's Claude subscription — the same window the Telegram bot and the architect's own work live on. recall without a question spends nothing. Load-test the reading path, not the writing one.",
    steps: [
      "Generate the access key above and copy it. It is shown once; if you lose it, generate a new one — the old one stops working at that moment.",
      "In Postman create an environment, for example «Fractera Memory», with two variables: base = the address shown above, and key = the key you copied. Mark the key variable as secret.",
      "First request: GET {{base}}/v1/health, no headers. A 200 with a JSON body means the service is alive. If this fails, nothing below will work — fix reachability first.",
      "Second request: GET {{base}}/v1/contract. Headers: x-memory-key = {{key}}. This proves the key itself works. A 401 here means the key is wrong or was replaced by a newer one.",
      "Third request: POST {{base}}/v1/remember. Headers: x-memory-key = {{key}} and Content-Type: application/json. Body → raw → JSON: { \"who\": \"postman-test\", \"text\": \"my name is Roman\", \"lang\": \"en\" }. Expect ok:true, a noted array and a thread identifier. This call spends a real model turn, so keep the phrase short.",
      "Fourth request: POST {{base}}/v1/recall with body { \"who\": \"postman-test\", \"lang\": \"en\" }. It returns everything known about that person and calls no model — it should come back in milliseconds.",
      "Negative check, and do not skip it: remove the x-memory-key header from the recall request and send it again. You must get 401 with no-access. If it still succeeds, you are talking to something that is not this service.",
    ],
  },
  refusals: {
    lead:
      "Two fields always travel together: a permanent machine code (refusal or error) and human words (what_happened). Branch on the code; show the words. The words are translated, the codes never change.",
    moneyVsKey:
      "Money and keys are different refusals on purpose. An exhausted subscription window heals by itself; a rejected key does not. One code for both would leave you guessing whether to wait or to act.",
  },
  threads: {
    deny:
      "This is why deny requires a thread. Overturning a conclusion without being able to return to the reasoning that produced it means nothing. Sent without thread, deny comes back as not_supported with a note saying exactly what is missing.",
    lead:
      "When memory thinks, it runs a real conversation with the model, and that conversation has a name. Every answer in which memory thought carries thread. Send it back with the next call and the same conversation continues: the model sees its own earlier conclusion.",
    measured:
      "Measured on this machine, three turns of one thread: cost 0.0289 → 0.0065 → 0.0036; cached input read 8204 → 15305 → 16148 tokens. Continuing a thread is cheaper than restating the context in a fresh call, not more expensive. The cache is hourly: an older thread still resumes, but the first turn after the pause pays for the cache again.",
    unknown:
      "A thread that no longer exists is its own named refusal — think-thread-unknown — not a generic parse failure. Drop the identifier and call again: memory will start a new thread.",
  },
};

const RU: ApiDocWords = {
  auth: {
    denied:
      "Ключ сравнивается за постоянное время, поэтому неверный ключ ничего не сообщает о том, насколько он неверен. Вызов без годного ключа получает 401 с error: \"no-access\".",
    headers: "Шлите его любым из двух заголовков — принимаются оба:",
    lead:
      "Каждый вызов /v1/*, кроме /v1/health, требует ключ доступа к памяти. Один ключ покрывает и чтение, и запись: раздельных прав нет, и делать вид, будто они есть, значило бы соврать о том, что проверяет сервер.",
  },
  baseUrl: {
    lead:
      "Все вызовы — POST с телом JSON, кроме каталога и двух служебных адресов ниже. Шлите Content-Type: application/json. Ответ всегда JSON и всегда no-store.",
    readBody:
      "Читайте тело, а не код ответа. Память отвечает 200 с ok:false на отказы, которые понимает сама: нет нити, кривая дата, исчерпано окно подписки. Код, отличный от 200, означает, что вызов не дошёл до глагола вовсе. Клиент, ветвящийся только по коду, объявит отказ успехом.",
  },
  catalogue: {
    contract:
      "Договор машинно. Схемы инструментов агента порождаются из этого ответа ПО HTTP, а не копируются из исходника: копия расходится молча.",
    health:
      "Открыт, ключ не нужен: живость, версия договора и мера качества имён. Его зовут установщик и сторож, а сказать «я жива» не значит выдать хоть что-то о человеке.",
    law:
      "Имя источника называется в ОТВЕТЕ и никогда не принимается в вопросе. Знание имён помогает спросить точнее; запросить таблицу напрямую оно не даёт. Где искать — решает память, и именно это делает её чёрным ящиком, а не базой данных под тонкой крышкой.",
    lead:
      "Два адреса только на чтение отвечают на вопрос «что у памяти есть» — именами, а не строками.",
  },
  catalogueItem: {
    "GET /v1/tables": "имена всего, что память о человеке ведёт; часто этого довольно",
    "GET /v1/tables/{имя}": "описание одной таблицы — если имя не объяснило само себя",
    "GET /v1/objects/{id}/file": "сам файл объекта — байты с тем типом и именем, с которыми он сохранён; id из find_objects или keep_object",
  },
  examples: {
    ask: "Спросить, что ей известно. Без вопроса придёт всё, и этот путь не зовёт модель вовсе:",
    deny: "Продолжить то же размышление и опровергнуть сделанный вывод:",
    file: "Скачать файл объекта — те же байты, что были сохранены:",
    find: "Найти объекты по смыслу — другими словами, чем в самом объекте, тоже можно; модель не зовётся:",
    keepFile: "Положить вещь целиком — снимок, голосовое, PDF, исходный код. Тело — форма с файлом; описание память пишет сама:",
    keepUrl: "Или назвать файл адресом — память скачает его сама. Адреса внутри машины и веб-страницы отвергаются:",
    scope: "Дать факту охват — дат и мест бывает несколько, поэтому охват это список:",
    tell: "Сказать памяти то, что сказал человек, — его же словами:",
  },
  h: {
    auth: "Ключ доступа",
    baseUrl: "Адрес службы",
    catalogue: "Каталог",
    examples: "Разобранные примеры",
    limits: "Границы, которые являются решением, а не пробелом",
    methods: "Методы",
    overview: "API памяти — что это за служба",
    paramsReport: "У каждого необязательного параметра есть названная судьба",
    postman: "Проверка через Postman",
    refusals: "Коды отказов",
    service: "Живость и договор",
    threads: "Нить размышления и почему продолжать её дешевле",
  },
  limits: {
    items: [
      "Зовущий никогда не обращается к таблице напрямую. Имена источников едут в ОТВЕТЕ и не принимаются в вопросе: где искать — решает память, и именно это делает её чёрным ящиком, а не базой под тонкой крышкой.",
      "Память не хранит историю ваших запросов. Каждый вызов — замкнутый цикл; преемственность даётся явно, нитью размышления, и ничего не перетекает между зовущими случайно.",
      "Факты о третьих лицах распознаются и называются, а не записываются не тому человеку. Ответ говорит, что пропущено и почему.",
      "Связь между двумя людьми хранится ребром графа, а не полем строки: у связи есть источник и цель, и колонка потеряла бы одно из двух.",
      "Значение никогда не повышается молча. Вывод хранится только с основанием, а пустой охват значит «не знаю где и когда» — никогда «везде и всегда»."
    ],
    lead: "Названо прямо, потому что границу, которую никто не назвал, каждый зовущий обходит по-своему:",
  },
  method: {
    find_objects: {
      about:
        "Найти объекты памяти по смыслу вопроса — снимки, документы, записи, код, положенные keep_object или вложениями remember. Ищет по карточкам поиска одним встраиванием, без хода модели.",
      onMiss:
        "Ничего ближе порога — ok:true, found:false и пустой results. Это не «такого нет»: переспросите другими словами. Хранилище недоступно — ok:false и причина.",
      returns:
        "found; results — найденное ближе порога, лучшее первым: id, title, summary, kind, messageId (строка messages_that_came_into_memory), name, mime, size, score, preview; threshold — порог близости; lost — карточки, чей файл стёрт мимо памяти.",
    },
    keep_object: {
      about:
        "Положить в память вещь целиком — снимок, голосовое, видео, PDF, Markdown, HTML, исходный код, текст. Шлите форму multipart с файлом в части file или JSON с url — тогда файл скачивает сама память. Описание пишет память: полное — рядом с файлом, саммари — в строку таблицы и карточку поиска, полное с происхождением — в граф. Пришлите своё саммари — и модель не зовётся.",
      onMiss:
        "Род, который память не читает, — 400 describe-kind-unsupported, ничего не записано. Адрес внутри машины или частной сети — 400 url-forbidden; веб-страница — 400 is-a-page; адрес не отвечает — 502 url-unreachable. Сорвалась ступень хранилищ — 502 с причиной: уже положенное снято, строка осталась со статусом failed, её messageId в ответе. Модель не ответила или кончилось окно подписки — 502 с причиной.",
      returns:
        "messageId — строка messages_that_came_into_memory со ссылками на объект, карточку поиска и документ графа; object — карточка объекта (id, имя, размер); title и summary — по ним объект будут находить; kind — род; described — звалась ли модель; ms — сколько заняло; url — итоговый адрес, если файл назван адресом.",
    },
    open_object: {
      about:
        "Открыть найденный объект: карточка, текст частями для текстовых родов и адрес самого файла. Звать, когда саммари из find_objects не хватило для ответа.",
      onMiss: "Чужой или несуществующий id — ok:false и error not-found или not-ours. Хранилище недоступно — ok:false и причина.",
      returns:
        "card — карточка объекта; text — кусок текста (null у изображения, видео, аудио), from, shown, total и limit — где этот кусок и сколько всего; file — адрес файла: GET этот путь от адреса памяти с тем же ключом.",
    },
    forget_journal: {
      about:
        "Стереть рассказ памяти о своей работе. Знание о людях этим не затрагивается — стирается только журнал. Необратимо: стёртое не восстанавливается ничем.",
      onMiss: "Журнал и так был пуст — ok:true и cleared:0.",
      returns: "cleared — сколько записей стёрто. Число, а не «готово»: оно доказывает, что стёрли именно то, что было.",
    },
    journal: {
      about:
        "Что память делала: её собственный рассказ о своей работе, обычным текстом. Нужен тому, кто разбирается, почему память ответила именно так. В разговоре с человеком не нужен: это не знание о нём, а рассказ о службе.",
      onMiss: "Записей ещё нет — ok:true и пустой text: память просто ничего не делала с момента последней очистки.",
      returns:
        "text — документ целиком, как он лежит; entries — сколько в нём записей; bytes — сколько занимает. Каждая запись говорит: что пришло, что ответила модель, какое решение принято, ЧТО ОТБРОШЕНО И ПОЧЕМУ, что ушло наружу и сколько это заняло.",
    },
    people: {
      about:
        "Кого память вообще знает. Нужен тому, кто спрашивает не о себе, а о системе: экрану, прибору, установщику. Агенту в разговоре не нужен — он всегда знает, с кем говорит.",
      onMiss: "Не знает никого — ok:true и пустой список: это не ошибка, а честное «пока никто ничего не рассказывал».",
      returns: "people — список тех, о ком есть записи, с датой первой записи.",
    },
    recall: {
      about:
        "Спросить память о человеке. Без вопроса отдаёт всё, что знает, — мгновенно и не тратя вызова модели. С вопросом сначала ищет механически.",
      onMiss:
        "О человеке ничего не записано — ok:true и пустой known. Вопрос не совпал ни с чем — приходит всё известное, и сказано, что точного совпадения нет.",
      returns:
        "known — что известно; у каждого значения есть from_table (какая таблица дала ответ), claim (сказано человеком или выведено) и basis (из чего выведено). not_yet_known — чего не хватает и почему это важно; used_model — звалась ли модель. depth_asked и depth_used — какой предел просили и до какого уровня память дошла на самом деле. used_input — что из присланного контекста участвовало в поиске. chain — шаги поиска, и только если их попросили. params — судьба каждого необязательного параметра.",
    },
    remember: {
      about:
        "Сказать памяти то, что сказал человек, — его же фразой. Куда это ляжет, заводить ли новое место и что делать с противоречием, решает память.",
      onMiss:
        "Фактов о человеке во фразе нет — ok:true и пустой noted, это не ошибка. Если разобрать нельзя, приходит отказ с причиной: кончились деньги, ключ отвергнут или модель недоступна.",
      returns:
        "what_happened — словами, которые можно произнести человеку; noted — что именно записано, с from_table и claim у каждой записи. При противоречии сказано «было X, стало Y»: последнее побеждает, но вслух. params — судьба каждого необязательного параметра. objects — судьба каждого вложения media: id объекта и messageId либо отказ с причиной. thread — имя нити разбора: пришлите его обратно, чтобы продолжить эту же цепочку.",
    },
  },
  methods: {
    body: "тело",
    lead:
      "Порождено из живого договора — того же объекта, что служба отдаёт по GET /v1/contract. Если параметр здесь есть, сервер принимает его сегодня.",
    meaning: "что значит",
    no: "нет",
    onMiss: "Когда ничего не нашлось.",
    parameter: "параметр",
    required: "обязателен",
    returns: "Что возвращает.",
    type: "тип",
    untranslated: "[перевода пока нет]",
    yes: "да",
  },
  overview: {
    audience:
      "Эта страница написана для машин и для тех, кто их подключает: агента, бота, фоновой задачи, скрипта в таблице. Ниже — вся публичная поверхность. Список методов порождается из живого договора, поэтому разойтись с тем, что сервер на самом деле принимает, он не может.",
    lead:
      "Память Fractera — чёрный ящик. Вы говорите ей обычными человеческими фразами и спрашиваете её обычными человеческими фразами. Куда лечь факту, заводить ли колонку или таблицу, звать ли вообще модель — память решает сама и наружу об этом не рассказывает. Ни схемы проектировать, ни таблицу объявлять заранее не нужно.",
    twoVerbs:
      "Два глагола — и в этом вся мысль. remember меняет то, что память знает; recall не меняет ничего. Всё остальное — каталог, журнал — существует, чтобы объяснить, что память делала, а не чтобы дать дотянуться внутрь.",
  },
  param: {
    anchors: "Якоря графа — JSON-массив имён людей, мест, продуктов. Не названы — их называет модель, иначе берётся название.",
    at: "Дата записи охвата, гггг-мм-дд.",
    author: "Кто прислал — словами, например имя человека в Telegram. Не назван — берётся who.",
    file: "Либо file, либо url. Сам файл — часть file в multipart/form-data. Род память определяет по имени и типу: изображение · видео · аудио · PDF · Markdown · HTML · исходный код · текст.",
    from: "С какого знака продолжить текст. Не назван — с начала.",
    full: "Своё полное описание — настолько подробное, чтобы по нему можно было восстановить объект.",
    id: "id объекта из find_objects или keep_object.",
    media: "Вложения: список {url} — адреса файлов. Каждый файл память скачивает и кладёт тем же путём, что keep_object: описание, объектное хранилище, карточка поиска, граф, строка таблицы. Род определяет сама память. Веб-страница (text/html) отвергается: страницы кладутся методом ссылок. Судьба каждого вложения — в objects.",
    name: "Имя файла с расширением. Не названо — берётся имя части file или из адреса.",
    question: "Что ищем — обычной фразой; другими словами, чем в самом объекте, тоже можно.",
    source: "Откуда пришёл объект: api · telegram · …. Не названо — api. Ложится в строку таблицы и в шапку документа графа.",
    summary: "Своё саммари, около 50 слов. Прислано — модель не зовётся, полное описание берётся из full.",
    tags: "Теги — JSON-массив строк в поле формы.",
    title: "Своё название. Не названо — его пишет модель.",
    url: "Либо url, либо file. Адрес файла http или https — тело JSON; память скачивает файл сама, до 200 МБ. Адреса внутри машины или частной сети и веб-страницы (text/html) отвергаются.",
    deny: "Отрицание прежнего вывода: чем он неверен. Отменяется вывод, а не факт — основание остаётся. Имеет смысл только вместе с thread: без возврата к прежней цепочке опровергать нечего.",
    depth: "Предел глубины словами: standard · deep · extreme. Номера уровней остаются внутри памяти — наружу идут слова и цена.",
    history: "Предыдущий разговор: зовущая модель вправе отдать его вместе с вопросом.",
    lang: "Язык слов для человека: ru или en. Не назван — русский; незнакомый — английский.",
    need_table: "Требовать, чтобы записанное сразу стало своей таблицей, не дожидаясь второго значения того же рода.",
    place: "Место записи охвата.",
    prior: "Что уже нашли до этого вопроса.",
    scope: "Охват: СПИСОК записей вида {at, place, lat, lon, radius_m}. Дата — гггг-мм-дд, место — словом; в записи должно быть хотя бы одно из двух. Записей бывает много: у одной фразы может быть несколько дат и мест. Пустой охват значит «не знаю где и когда», а не «везде и всегда».",
    text: "Для remember: фраза человека как есть, без пересказа. Для recall: вопрос человеческой фразой — без него придёт всё известное.",
    thread: "Нить разбора: идентификатор прежнего размышления, чтобы продолжить его, а не начинать заново. Память возвращает его в каждом ответе, где думала. Продолжение ДЕШЕВЛЕ нового вызова.",
    want_chain: "Возвращать ли шаги поиска. Умолчание — нет: переполнять свой контекст решает тот, кто спросил.",
    who: "Чьи это факты: устойчивый ключ человека.",
  },
  paramsReport: {
    accepted: "принят и подействовал; note называет, что именно он сделал и где его предел",
    badForm: "не та форма; параметр отброшен, причина названа, остальной вызов при этом отрабатывает",
    lead: "Любой ответ, получивший необязательные параметры, несёт params — по строке на каждый присланный:",
    never:
      "Присланный параметр никогда не исчезает просто так. Если params о нём молчит — значит вы его не слали.",
    notSupported:
      "по форме годен, но способности за ним пока нет — и это сказано словами, а не молчанием",
  },
  postman: {
    lead: "Семь шагов, и последний — тот, который пропускают.",
    quota:
      "Про квоту: remember тратит ход подписки Claude владельца — то самое окно, которым живут бот Telegram и работа архитектора. recall без вопроса не тратит ничего. Нагружать проверками стоит путь чтения, а не записи.",
    steps: [
      "Сгенерируйте ключ доступа выше и скопируйте его. Он показывается один раз; потеряли — сгенерируйте новый, и в этот же миг старый перестанет работать.",
      "В Postman заведите окружение, например «Fractera Memory», и в нём две переменные: base = показанный выше адрес и key = скопированный ключ. Переменную с ключом пометьте как secret.",
      "Первый запрос: GET {{base}}/v1/health, без заголовков. Ответ 200 с телом JSON означает, что служба жива. Не вышло — дальше ничего не заработает, сначала разберитесь с доступностью.",
      "Второй запрос: GET {{base}}/v1/contract. Заголовки: x-memory-key = {{key}}. Это доказывает, что работает сам ключ. Ответ 401 здесь значит, что ключ неверен или заменён более новым.",
      "Третий запрос: POST {{base}}/v1/remember. Заголовки: x-memory-key = {{key}} и Content-Type: application/json. Body → raw → JSON: { \"who\": \"postman-test\", \"text\": \"меня зовут Роман\", \"lang\": \"ru\" }. Ожидайте ok:true, массив noted и идентификатор thread. Этот вызов тратит настоящий ход модели — держите фразу короткой.",
      "Четвёртый запрос: POST {{base}}/v1/recall с телом { \"who\": \"postman-test\", \"lang\": \"ru\" }. Он отдаёт всё, что известно о человеке, и не зовёт модель вовсе — ответ обязан прийти за миллисекунды.",
      "Негативная проверка, и её не пропускайте: уберите заголовок x-memory-key из запроса на чтение и отправьте снова. Обязан прийти 401 с no-access. Если запрос всё равно прошёл — вы разговариваете не с этой службой.",
    ],
  },
  refusals: {
    lead:
      "Наружу всегда едут два поля: вечный машинный код (refusal или error) и человеческие слова (what_happened). Ветвитесь по коду, показывайте слова. Слова переводятся, коды не меняются никогда.",
    moneyVsKey:
      "Деньги и ключ — разные отказы намеренно. Исчерпанное окно подписки проходит само, отвергнутый ключ — нет. Один код на оба заставил бы гадать, ждать или действовать.",
  },
  threads: {
    deny:
      "Именно поэтому deny требует нити. Опровергнуть вывод, не имея возможности вернуться к размышлению, которое его породило, значит не сделать ничего. Присланный без thread, deny приходит как not_supported и говорит, чего именно не хватает.",
    lead:
      "Когда память думает, она ведёт с моделью настоящий разговор, и у этого разговора есть имя. Каждый ответ, где память думала, несёт thread. Пришлите его со следующим вызовом — и продолжится тот же разговор: модель увидит свой прежний вывод.",
    measured:
      "Измерено на этой машине, три хода одной нити: цена 0.0289 → 0.0065 → 0.0036; прочитано из кэша 8204 → 15305 → 16148 токенов. Продолжить нить ДЕШЕВЛЕ, чем пересказать контекст в новом вызове, а не дороже. Кэш часовой: нить постарше продолжится, но первый ход после паузы снова оплачивает кэш.",
    unknown:
      "Нить, которой больше нет, — отдельный названный отказ think-thread-unknown, а не общий «не разобрал». Уберите идентификатор и позовите снова: память начнёт новую нить.",
  },
};

const DICT: Record<string, ApiDocWords> = { en: EN, ru: RU };

/** Слова языка. Неизвестный язык падает на английский — тот же закон, что у соседей. */
export function apiDocWords(lang: string): ApiDocWords {
  return DICT[lang] ?? EN;
}

/** Какие языки вкладка умеет говорить сейчас. Прибор спрашивает это, а не список в тексте. */
export const API_DOC_LANGS = Object.keys(DICT);
