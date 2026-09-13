// СЛОВА СТРАНИЦЫ ПАМЯТИ (178-2).
//
// 🪦 СКОПИРОВАН СО СЛУЖБЫ ЧАТА (`telegram.i18n.ts`) И УРЕЗАН. Тексты стенда
// перенесены ДОСЛОВНО — они уже проверены на живом экране; убрано всё, что
// принадлежит боту, а не памяти.
//
// 🔒 СЛОВАРЬ СВОЙ, А НЕ ОБЩИЙ С ЧАТОМ, И ЭТО ЗАКОН 137: у службы свои файлы в
// своём дереве. Общий словарь сделал бы память зависимой от дерева чужой
// службы — сотри владелец чат, и у памяти пропали бы подписи.
//
// 🔒 ДВА ЯЗЫКА, `en` И `ru`. Остальные приезжают файлом от внешней модели, как
// везде в проекте; это служебный экран архитектора, а не витрина.

import type { MemorySection } from "../_lib/memory-sections";
import type { TestTab } from "../_lib/test-tabs";
import type { OpenAiKeyWords } from "../_components/openai-key";
import type { OpenAiTabWords } from "../_components/openai-tab";
import type { BenchControlWords } from "../_components/memory-test-controls.client";
import type { ApiKeyWords } from "../_components/api-key.client";

export type MemoryUi = {
  title: string;
  subtitle: string;
  layer: string;
  menuTitle: string;
  menuWord: string;
  /** Пункт меню, уводящий на страницу входа в подписку Claude (180-2). */
  terminalLabel: string;
  /** Пункт меню внизу: терминал строителя продукта (189-8). */
  buildLabel: string;
  /** Что сказать, когда документа паспорта нет на диске (182-1). */
  passportMissing: string;
  /** Слова карточки ключа OpenAI — форму задаёт сама карточка (181-1). */
  openai: OpenAiKeyWords;
  /** Объяснение вкладки «Подписка OpenAI» простыми словами (181-1). */
  openaiTab: OpenAiTabWords;
  pages: Record<MemorySection, { title: string; hint: string }>;
  /**
   * Слова двух стендов хранилищ — графа знаний и вектора (189-1).
   *
   * 🔒 ОДИН НАБОР НА ОБА, А НЕ ДВА ПОХОЖИХ: имена вкладок и порядок работы у них
   * общие, различается только то, о каком хранилище идёт речь. Две копии слов
   * разошлись бы на первой правке — в этом проекте оплачено.
   */
  testBench: {
    /** Названия трёх страниц: загрузка · поиск · оценка. */
    tabs: Record<TestTab | "skill" | "bench", string>;
    /** Лид каждой страницы у графа и у вектора — что человек здесь делает. */
    graph: Record<TestTab, string>;
    vector: Record<TestTab, string>;
    /** Лиды стенда объектного хранилища (192-3); с 194-6 — и страницы «Навык». */
    object: Record<TestTab | "skill", string>;
    /** Честная строка о том, что органа ещё нет: молчащий экран читается как поломка. */
    soon: string;
    /** Файла навыка на диске нет — сказано словами, а не пустым экраном (194-6). */
    skillMissing: string;
    /** Лид страницы «Навык» у любого стенда (194-19). */
    skillLead: string;
  };
  /**
   * Слова загрузки в граф знаний (189-2).
   *
   * 🔒 ОТКАЗЫ ПЕРЕЧИСЛЕНЫ ПОИМЁННО, А НЕ СВЕДЕНЫ В «ЧТО-ТО ПОШЛО НЕ ТАК». Пустой
   * якорь, пустой текст и недоступная служба чинятся по-разному, и человек
   * обязан видеть, чем именно.
   */
  graphUpload: {
    anchorsHint: string;
    anchorsLabel: string;
    anchorsPlaceholder: string;
    button: string;
    busy: string;
    docsEmpty: string;
    docsTitle: string;
    errors: { "empty-text": string; "no-anchor": string; offline: string; refused: string };
    grew: string;
    labelsNow: string;
    notReady: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    taken: string;
    textLabel: string;
    textPlaceholder: string;
    waiting: string;
    /**
     * Цена загрузки словами и числами (189-3).
     *
     * 🔒 «КУСКОВ ПРОЧИТАНО» — ЭТО НИЖНЯЯ ГРАНИЦА ХОДОВ МОДЕЛИ, И ТАК И СКАЗАНО.
     * Счётчика вызовов служба графа наружу не отдаёт; придуманная точность была
     * бы ложью о цене, а умолчание — уверенным умолчанием.
     */
    workTitle: string;
    workLine: string;
    workNote: string;
    workNone: string;
  };
  /**
   * Слова поиска по графу (189-4).
   *
   * 🔒 ДВА ПУТИ НАЗВАНЫ СЛОВАМИ ЧЕЛОВЕКА, А НЕ КОДОМ: «со словами от памяти» и
   * «по-старому, без слов». Кнопка `legacy` существует ради доказательства, и
   * человек обязан понимать, что именно он сравнивает.
   */
  /**
   * Слова вкладки «Оценка» — вердикт человека и корпус случаев (189-5).
   *
   * 🔒 «НЕЗАВЕРШЁННЫЕ» НАЗЫВАЮТСЯ ОТДЕЛЬНЫМ СЛОВОМ, А НЕ ПРЯЧУТСЯ В «ПЛОХИЕ».
   * Прогон без вердикта — не провал, а несудимый случай; смешав их, мы получили
   * бы долю удачных, которая падает от того, что человек ушёл от экрана.
   */
  benchCases: {
    bad: string;
    empty: string;
    good: string;
    judged: string;
    lead: string;
    legacyMark: string;
    modelMark: string;
    pending: string;
    summary: string;
    title: string;
    why: string;
  };
  /**
   * Слова стенда векторного хранилища (189-6).
   *
   * 🔒 ОДИН НАБОР НА ЗАГРУЗКУ И ПОИСК: у вектора это две половины одного
   * действия, между ними нет фонового построения связей, как у графа.
   */
  /**
   * Слова стенда объектного хранилища (192-3).
   *
   * 🔒 ОТКАЗЫ ПОИМЁННЫ, КАК У СОСЕДЕЙ: объект без описания, чужой объект,
   * пропавший файл и молчащий склад чинятся по-разному.
   */
  objectBench: {
    aboutHint: string;
    aboutLabel: string;
    aboutPlaceholder: string;
    ask: string;
    askLabel: string;
    askPlaceholder: string;
    asking: string;
    binary: string;
    busy: string;
    button: string;
    close: string;
    costNote: string;
    empty: string;
    errors: {
      "card-failed": string;
      "empty-file": string;
      "no-about": string;
      "not-found": string;
      "not-ours": string;
      offline: string;
      refused: string;
      "store-unreachable": string;
      "too-large": string;
    };
    fileLabel: string;
    chooseFile: string;
    noFile: string;
    /** 194-3: описание файла моделью до сохранения. */
    describe: string;
    describing: string;
    describedBy: string;
    describeErrors: Record<string, string>;
    fullHint: string;
    fullLabel: string;
    fullPlaceholder: string;
    /** 194-5: что легло в память после сохранения. */
    openFile: string;
    savedFile: string;
    savedFull: string;
    savedMissing: string;
    /** 194-9: у найденного объекта нет строки — он лёг до таблицы сообщений. */
    savedNoRow: string;
    /**
     * Вводный текст стенда объектов (слово владельца 2026-09-13: «Совершенно не отражает смысл… данная вкладка
     * позволяет оценить работу связки… Данная служба поддерживает следующие типы объектов: изображение:
     * извлекается… попадает в… хранится…»). По каждому роду — только то, что делает код сегодня.
     */
    intro: {
      /** Заголовок свёрнутой карточки: он один виден, пока карточка закрыта. */
      cardTitle: string;
      paragraphs: string[];
      kindsTitle: string;
      kinds: { title: string; body: string }[];
    };
    savedRow: string;
    savedSummary: string;
    savedTitle: string;
    /** 194-8: подписи просмотра объекта — слова медиатеки панели дословно, плюс аудио. */
    preview: {
      close: string;
      code: string;
      kindAudio: string;
      kindCode: string;
      kindFile: string;
      kindHtml: string;
      kindImage: string;
      kindMarkdown: string;
      kindPdf: string;
      kindVideo: string;
      open: string;
      preview: string;
      reading: string;
      unreadable: string;
    };
    forget: string;
    forgot: string;
    hits: string;
    inStore: string;
    lost: string;
    nearestWas: string;
    nothing: string;
    notConfigured: string;
    open: string;
    shown: string;
    stored: string;
    timing: string;
  };
  vectorBench: {
    ask: string;
    askLabel: string;
    askPlaceholder: string;
    asking: string;
    busy: string;
    button: string;
    costNote: string;
    cutHint: string;
    errors: { "empty-text": string; offline: string; refused: string; "store-unreachable": string };
    forget: string;
    hits: string;
    inStore: string;
    nearestWas: string;
    nothing: string;
    notConfigured: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    stored: string;
    textLabel: string;
    textPlaceholder: string;
    timing: string;
  };
  graphSearch: {
    ask: string;
    askLegacy: string;
    busy: string;
    empty: string;
    errors: { "empty-question": string; "graph-unreachable": string; refused: string };
    forget: string;
    forgetDone: string;
    found: string;
    keywordsLine: string;
    label: string;
    legacyNote: string;
    matchedLine: string;
    modelNone: string;
    modelUnknown: string;
    placeholder: string;
    timing: string;
  };
  /** Слова карточки ключа доступа — форму задаёт сама карточка (185). */
  apiKey: ApiKeyWords;
  memoryTest: {
    lead: string;
    say: string;
    ask: string;
    raw: string;
    sayHint: string;
    askHint: string;
    rawHint: string;
    rawMethod: string;
    rawBody: string;
    send: string;
    sending: string;
    inputTitle: string;
    answerTitle: string;
    nothingYet: string;
    nothingSent: string;
    /** Что лента живёт только в браузере — сказано, а не умолчано. */
    volatile: string;
    failed: string;
    took: string;
    status: string;
    /** Панель «что уедет» и строка о непринятых параметрах (183-1). */
    whatGoes: string;
    droppedTitle: string;
    /** Слова девяти органов управления — форму задаёт сам компонент (183-1). */
    controls: BenchControlWords;
  };
  memoryTables: {
    title: string;
    lead: string;
    refresh: string;
    loading: string;
    empty: string;
    down: string;
    rows: string;
    columns: string;
    noRows: string;
    shown: string;
  };
  journal: {
    entries: string;
    bytes: string;
    clear: string;
    clearing: string;
    cleared: string;
    empty: string;
    down: string;
    shared: string;
    refresh: string;
  };
  /** Слова публичной главной страницы (178-5). */
  home: {
    whatIsBehind: string;
    whereToEnter: string;
  };
};

const EN: MemoryUi = {
  // 🔒 СЛОВА КАРТОЧКИ КЛЮЧА — ЕДИНСТВЕННОЕ РУССКОЕ МЕСТО ВКЛАДКИ API, И ТОЛЬКО
  // ПОТОМУ, ЧТО ЭТО ОРГАН УПРАВЛЕНИЯ, А НЕ ДОКУМЕНТАЦИЯ: на кнопку нажимает
  // человек, документацию читает машина.
  apiKey: {
    copied: "Copied",
    copy: "Copy",
    exists: "current key",
    failed: "The key was not created",
    generate: "Generate access key",
    lead:
      "One key for reading and writing. It is stored on this machine only, checked on every call, and never leaves the server except here, once, at the moment you create it.",
    missing: "no key yet",
    regenerate: "Generate a new key",
    shownOnce: "Copy it now — this is the only time the full key is shown.",
    title: "Access key",
    warning:
      "Generating a new key revokes the current one immediately. Anything already using it stops working at that moment — there is no separate revoke button, because this is the same action.",
    working: "Working…",
  },
  journal: {
    bytes: "bytes",
    clear: "Clear history — erases for good",
    cleared: "Entries erased: {n}. Knowledge about people is untouched.",
    clearing: "erasing…",
    down: "The memory service did not answer",
    empty:
      "The journal is empty: memory has done nothing since the last clearing. This is not a failure — entries appear as soon as memory is asked for something.",
    entries: "entries",
    refresh: "Refresh",
    shared:
      "The development agent reads this very document — as a file on disk. Clearing erases it for both at once: there is no second source.",
  },
  home: {
    whatIsBehind:
      "A public page of the service. What is behind it — the memory bench and the journal of its work — opens after signing in with the architect role.",
    whereToEnter:
      "The sign-in button is at the top right. After signing in, «Account» with your email and roles appears there, and the sections appear on the left.",
  },
  layer: "Memory service",
  memoryTables: {
    columns: "columns",
    down: "The memory service did not answer",
    empty:
      "Memory has not built a single table yet. Say something to it above — the tables appear on their own, and nobody declares them in advance.",
    lead: "Everything memory built out of what it was told. Tables and columns are created by memory itself, at the moment it needs them.",
    loading: "reading…",
    noRows: "the table exists, no rows in it yet",
    refresh: "Refresh",
    rows: "rows",
    shown: "shown",
    title: "What memory built",
  },
  memoryTest: {
    answerTitle: "Memory's answer",
    ask: "Ask",
    askHint: "The phrase goes to recall. Empty field means everything memory knows.",
    controls: {
      chain: {
        hint: "Recursive thinking produces a lot of text. Whether to fill your own context with it is decided by whoever asked — not by memory.",
        label: "Return the chain of reasoning",
        off: "No",
        on: "Yes",
      },
      deny: {
        hint: "Overturn a conclusion memory made. The conclusion is cancelled, the grounds are kept: a refuted guess that is deleted gets reborn by the same search.",
        label: "This is wrong, because…",
        placeholder: "why the previous answer is wrong",
      },
      depth: {
        deep: "Deep",
        deepHint:
          "Search by meaning in the vector store is added. Slower and more expensive — turn it on when the standard depth found nothing.",
        extreme: "Extreme",
        extremeHint:
          "Memory goes into recursive research, up to ten minutes. It spends the same subscription quota the bot lives on. Only when deep did not answer either.",
        label: "Search depth",
        standard: "Standard",
        standardHint:
          "Memory goes on its own: the database first, then the model, then the knowledge graph. Seconds. Enough almost always.",
      },
      history: {
        hint: "A calling model may pass memory the previous conversation. A bench that cannot do the same tests the wrong path.",
        label: "Conversation history",
        placeholder: "what was said before this question",
      },
      advanced: "Advanced parameters",
      legend: "the mark says whether the parameter reaches the contract today",
      nothingSet: "nothing set — the phrase goes as it is",
      needTable: {
        hint: "An input parameter: the caller may state that the answer has to become a table. Whether it does is still memory's decision.",
        label: "A table is required",
      },
      prior: {
        hint: "What has already been found before this question — the caller may send it along with the question.",
        label: "Results of previous searches",
        placeholder: "what was already found",
      },
      scope: {
        add: "Add an entry",
        date: "Date",
        entry: "Entry",
        remove: "Remove",
        hint: "Date and place are the scope of a fact. There can be many of them — one phrase may carry several dates and places, so each one gets its own card. An empty scope means «I do not know where and when», not «everywhere and always».",
        label: "Calendar and geotag",
        place: "Place",
        placePlaceholder: "city or place",
      },
      setNow: "set",
      supported: "reaches memory",
      thread: {
        hint: "Claude keeps its own thread of reasoning, with its own name and its own cache. Memory returns that name in every answer where it thought; send it back and the same thread continues — the model sees its own earlier conclusion, and it costs LESS than a fresh call. Denying a conclusion only makes sense with a thread.",
        label: "Thread of the earlier reasoning",
        placeholder: "identifier from a previous answer",
        take: "take from the last answer",
      },
      title: "Controls",
      unsupported: "does not reach yet",
      upload: {
        hint: "Memory only understands text today. The buttons stand here because the kinds of data are declared — and they are switched off because the ability is not built.",
        html: "HTML",
        image: "Image",
        label: "Send data that is not text",
        pdf: "PDF",
        sound: "Sound",
        video: "Video",
      },
      who: {
        bench: "bench-1 — the bench's own name",
        hint: "Memory answers about a particular person. The list is what memory itself knows — the bench does not invent people.",
        label: "On whose behalf",
        loading: "asking memory who it knows…",
      },
    },
    droppedTitle: "Set here, but this method does not accept it yet",
    failed: "The bench could not reach the door",
    inputTitle: "What we send",
    lead: "Phrases go straight to the memory service — this page runs on the service itself, so there is nothing in between at all.",
    nothingSent: "Nothing sent yet.",
    nothingYet: "Memory has not answered yet — send a phrase on the left.",
    raw: "Raw call",
    rawBody: "Request body, JSON",
    rawHint:
      "Any method of the contract, body as JSON. A method that is not built answers 501 — and the bench shows that too.",
    rawMethod: "Method name",
    say: "Say",
    sayHint: "The phrase goes to remember — the same way a person tells the bot something.",
    send: "Send",
    sending: "sending…",
    status: "status",
    took: "took",
    volatile: "The list lives in this browser tab and disappears on reload.",
    whatGoes: "What goes to memory",
  },
  menuTitle: "Memory",
  menuWord: "Menu",
  passportMissing:
    "The passport document is not on disk yet: development-docs/PASSPORT.md. It is written first — before any code.",
  buildLabel: "Build this product",
  terminalLabel: "Claude subscription",
  openai: {
    badFormat: "That does not look like an OpenAI key — they start with sk-",
    balanceNote:
      "The remaining balance cannot be shown: OpenAI returns it only to a browser session of your account or to an admin key with the api.usage.read scope. An ordinary project key never sees it.",
    check: "Check",
    checking: "Checking…",
    consumerApp: "the site project",
    consumerData: "data layer",
    consumerGraph: "knowledge graph",
    consumerMachine: "memory and the bot",
    exists: "An OpenAI key is set",
    failed: "Action failed",
    funded: "The balance is positive",
    fundsUnknown: "Could not tell whether there is credit — try again later",
    invalid: "OpenAI did not accept this key",
    keyLabel: "Key from platform.openai.com",
    keyPlaceholder: "sk-…",
    keyReplace: "Paste a new key to replace the saved one",
    lead:
      "One key for the whole server: entered here, it reaches every service that needs it. If you have already entered it somewhere else, there is no need to enter it again.",
    missing: "No OpenAI key yet",
    noFunds: "The key works, but the account is out of credit",
    partial: "The key has not reached every service",
    restartNote:
      "Most services pick up a new key at once. The site project and the knowledge graph read it when they start, so they get it after their next restart.",
    save: "Save",
    saved: "OpenAI key saved",
    saving: "Saving…",
    title: "OpenAI key",
    valid: "The key is valid",
  },
  openaiTab: {
    heading: "Why the project needs an OpenAI key",
    intro:
      "Claude does the thinking in this project — on your subscription. The OpenAI key is needed for two helper jobs, and neither gets done without it:",
    voiceTitle: "Voice becomes text",
    voice:
      "When you dictate a message instead of typing it, the recording has to become text. OpenAI does that. Without the key a voice message stays a sound that nobody has read.",
    vectorsTitle: "Search by meaning",
    vectors:
      "To find the right piece in your documents and past conversations, every text is turned into a fingerprint of its meaning — a vector. The agentic RAG and the vector store compare these fingerprints and find what is close in meaning, even when the words differ. OpenAI makes the fingerprints.",
    without:
      "Without the key the main things keep working: Claude answers, memory remembers what was said. What you lose is voice-to-text and search by meaning.",
  },
  pages: {
    journal: {
      hint: "What memory did: its own account of its work. The same document is read by the development agent, as a file.",
      title: "Journal",
    },
    openai: {
      hint: "What the OpenAI key is for — and the key itself, one for the whole server.",
      title: "OpenAI subscription",
    },
    settings: {
      hint: "Keys and switches of this service. The Anthropic key here is the same one the chat uses: it lives in the machine secret store.",
      title: "Settings",
    },
    api: {
      hint: "How external tools talk to this memory: the key, the methods, the limits — and how to test it in Postman.",
      title: "API",
    },
    "memory-test": {
      hint: "Send a phrase straight to memory and see its answer — no agent in the chain.",
      title: "Memory test",
    },
    "graph-test": {
      hint: "Load your own text, watch the graph being built from it, then ask in other words and see how fast the answer comes back.",
      title: "Knowledge graph test",
    },
    "vector-test": {
      hint: "The same three steps against the vector store: load, search by meaning, judge what came back.",
      title: "Vector store test",
    },
    "object-test": {
      hint: "This tab tests the object store together with every service that keeps data with it: each object that enters memory is written to the database, the vector store and the knowledge graph, and is kept as it is in the object store.",
      title: "Object store test",
    },
    passport: {
      hint: "What memory is and how it works — written before it is built. Read it, approve it or change it; the code comes after.",
      title: "Passport",
    },
  },
  graphUpload: {
    anchorsHint:
      "Without an anchor the record is accepted and then found by nobody: a question comes from a name, and a record with no link to a name has nothing to be reached by.",
    anchorsLabel: "Anchors — who or what this is about",
    anchorsPlaceholder: "Denis, Kremlin",
    button: "Transform and save",
    busy: "The model is reading your text…",
    docsEmpty: "The graph holds nothing yet.",
    docsTitle: "What the graph holds",
    errors: {
      "empty-text": "There is no text to load.",
      "no-anchor": "Name at least one anchor — otherwise the record cannot be found later.",
      offline: "The graph engine is not answering. Nothing was loaded.",
      refused: "The graph refused the document.",
    },
    grew: "Entities grew: {from} → {to}.",
    labelsNow: "Entities in the graph: {n}.",
    notReady: "The graph engine is not reachable from here — loading is unavailable.",
    sourceLabel: "Name it (optional)",
    sourcePlaceholder: "my-notes",
    taken: "Accepted in {ms} ms. Relations are built in the background — the list below refreshes itself.",
    textLabel: "Your text",
    textPlaceholder: "Paste what memory should learn…",
    waiting: "Building…",
    workLine:
      "Chunks read by the model: {chunks} · entities extracted: {entities} · relations: {relations}.",
    workNone: "The graph has not reported any work yet.",
    workNote:
      "Chunks read is the lower bound on model turns: the engine exposes no call counter, and an invented number would be a lie about the cost. This is where the expensive half of the work happens — reading afterwards is nearly free.",
    workTitle: "What the load cost",
  },
  benchCases: {
    bad: "Found the wrong thing",
    empty: "No runs yet. Ask something on the Search tab and come back.",
    good: "Found the right thing",
    judged: "Judged.",
    lead:
      "Only you can say whether the right thing was found. The engine is never allowed to grade its own work — a model retelling its own run errs in its own favour.",
    legacyMark: "asked the old way",
    modelMark: "model turn: {turn}",
    pending: "awaiting your verdict",
    summary:
      "Runs: {total} · right: {good} · wrong: {bad} · awaiting verdict: {pending} · average answer: {avg} ms.",
    title: "Case book",
    why: "Why (optional)",
  },
  objectBench: {
    aboutHint:
      "About 50 words: what the object is and what it is about. The object is found by this summary. Required for pictures, PDFs, audio and video; for a text file it is optional.",
    aboutLabel: "Summary",
    aboutPlaceholder: "Diagram of the development loop, from an admin request to deploy",
    ask: "Find the object",
    askLabel: "What are you looking for",
    askPlaceholder: "Describe the thing, not the words inside it…",
    asking: "Searching…",
    binary: "This kind is not read: here is its card. Refer to it by id.",
    busy: "Storing the file and its card…",
    button: "Store the object",
    close: "Close",
    costNote:
      "Storing costs one embedding, whatever the size of the file. «Get description» is optional and costs one model turn: audio is transcribed by OpenAI, everything else is read by Claude on the owner's subscription — the same quota the Telegram bot uses.",
    empty: "The object store holds nothing yet.",
    errors: {
      "card-failed": "The file was accepted but its card was not; the file was removed again, nothing is half-stored.",
      "empty-file": "There is no file to store.",
      "no-about": "Describe this object in words — a picture or PDF without a description could never be found.",
      "not-found": "There is no object with this id.",
      "not-ours": "This file belongs to the platform media library, not to memory.",
      offline: "The store is not answering. Nothing was stored.",
      refused: "The store refused the file.",
      "store-unreachable": "The store is not answering.",
      "too-large": "The file is larger than 20 MB.",
    },
    fileLabel: "File",
    chooseFile: "Choose file",
    noFile: "No file chosen",
    describe: "Get description",
    describing: "The model is describing the file… {s} s",
    describedBy: "Described by {by} in {s} s · content language: {lang}. Read and correct both fields before storing.",
    describeErrors: {
      "describe-answer-unusable": "The model answered in the wrong shape. Try again or write the description yourself.",
      "describe-empty-file": "The file is empty.",
      "describe-ffmpeg-failed": "The video could not be split into a sound track and frames.",
      "describe-kind-unsupported": "Files of this kind are not described. Write the description yourself.",
      "describe-too-large": "The file is larger than 20 MB.",
      failed: "The description failed. You can write it yourself.",
      "model-key-missing": "There is no OpenAI key on this machine — audio cannot be transcribed.",
      "model-key-rejected": "The OpenAI key was rejected — it has to be replaced.",
      "model-quota-exhausted": "The OpenAI account has run out of paid tokens.",
      "model-unreachable": "OpenAI did not accept the file or is not answering.",
      "think-not-authorized": "Claude on this server is not signed in to a subscription.",
      "think-quota-exhausted": "The Claude subscription limit on the server is used up. Try again after it resets.",
      "think-subscription-disabled": "Subscription access for Claude is disabled.",
      "think-timed-out": "The model took too long (over 5 minutes).",
    },
    fullHint:
      "So detailed that an AI could reconstruct the object from this text alone. Kept next to the file in the object store.",
    fullLabel: "Full description",
    fullPlaceholder: "Composition, every element and its position, colours, all visible text…",
    openFile: "Open the file",
    savedFile: "File — in the object store",
    savedFull: "Full description — kept next to the file",
    savedMissing: "The object was stored, but its record could not be read back.",
    savedNoRow: "This object has no row in messages_that_came_into_memory: it was stored before the table existed. The file and its description are shown.",
    intro: {
      cardTitle: "How an object is stored, and what the service accepts",
      paragraphs: [
        "Every object is written to four places at once, or to none: the file itself and its full description go to the object store; the summary goes to a row of messages_that_came_into_memory and to the search card in the vector store; and when the description names people, places or products, a document goes to the knowledge graph. If any step fails, what was already written is removed and the row is kept as failed, with the reason.",
        "That is what lets memory find an object by every rule of its architecture: cheaply — by the meaning of the search card, with one embedding and no model turn; exactly — by the title and tags in the table row (the stand does not use this path yet); and deeply — through the graph, when the question is about how things are connected.",
        "Memory sets no size limit of its own: the server accepts files up to 200 MB, and speech is transcribed up to 25 MB.",
      ],
      kindsTitle: "What the service accepts",
      kinds: [
        { title: "Image", body: "Read by Claude with vision: every element, its position, colours and all visible text become the full description; a summary of about 50 words. The picture is kept as it is; it is found by its summary." },
        { title: "Video", body: "ffmpeg cuts out the sound track and six evenly spaced frames. OpenAI whisper-1 transcribes the track with timestamps, Claude reads the frames — one timeline where frames sit between the spoken lines. The video is kept as it is." },
        { title: "Audio", body: "OpenAI whisper-1 transcribes the speech with a timestamp on every segment; Claude writes the description and the summary from the transcript. The recording is kept as it is." },
        { title: "PDF", body: "Claude reads the document whole: structure, headings and content, tables row by row. The PDF is kept as it is and opens in the browser's own viewer." },
        { title: "Markdown", body: "Claude reads the document; its opening also goes into the search card. Kept as the file and shown as the document it renders into." },
        { title: "HTML", body: "Claude reads the page; its opening also goes into the search card. Shown as a page in a sandbox — its scripts cannot reach memory — and as its source." },
        { title: "Source code", body: "TypeScript, JavaScript, Python, SQL, JSON, YAML and more. Claude analyses rather than copies: what the code does for a person, what it exports and imports, which technologies it uses — up to about 3000 characters. The file is kept as text, highlighted in the code viewer and never run." },
        { title: "Plain text", body: "TXT and CSV: Claude reads the content, the opening goes into the search card." },
        { title: "Anything else", body: "Kept as it is if you write the summary yourself: the model does not describe kinds it cannot read." },
      ],
    },
    savedRow: "Row in messages_that_came_into_memory",
    savedSummary: "Summary — in the table row and the search card",
    savedTitle: "What went into memory",
    preview: {
      close: "Close",
      code: "Code",
      kindAudio: "Audio",
      kindCode: "Code",
      kindFile: "File",
      kindHtml: "HTML",
      kindImage: "Image",
      kindMarkdown: "Markdown",
      kindPdf: "PDF",
      kindVideo: "Video",
      open: "Open",
      preview: "Preview",
      reading: "Reading…",
      unreadable: "Could not read the file",
    },
    forget: "Forget every object memory holds",
    forgot: "Forgotten: {n}.",
    hits: "Objects closer than {threshold}: {n}.",
    inStore: "Objects in memory: {n}.",
    lost: "Cards without a file: {n} — the file was deleted outside memory.",
    nearestWas: "The nearest was {score} —",
    nothing:
      "Nothing closer than {threshold}. The store always has a nearest object; this one is too far to count as an answer.",
    notConfigured: "The card store (vectors) is not configured on this machine — objects cannot be found.",
    open: "Open",
    shown: "Shown {shown} of {total} characters.",
    stored: "Stored {name} · {size} bytes · card {card} characters · {ms} ms.",
    timing: "Answered in {ms} ms, no model turn.",
  },
  vectorBench: {
    ask: "Search by meaning",
    askLabel: "Your question",
    askPlaceholder: "Ask about the meaning, not the wording…",
    asking: "Searching…",
    busy: "Computing embeddings…",
    button: "Transform and save",
    costNote:
      "No model reads this text: only embeddings are computed. That is why loading here is far cheaper and faster than into the graph — and why no knowledge of relations comes out of it.",
    cutHint:
      "The text is split into pieces by blank lines: a paragraph is the natural unit of meaning. Very short pieces are attached to the previous one — a fragment close to everything is close to nothing.",
    errors: {
      "empty-text": "There is no text to load.",
      offline: "The store is not answering. Nothing was loaded.",
      refused: "The store refused the text.",
      "store-unreachable": "The store is not answering.",
    },
    forget: "Forget everything the bench loaded",
    hits: "Hits closer than {threshold}: {n}.",
    inStore: "In the bench collection: {n} pieces · model {model}.",
    nearestWas: "The nearest was {score} —",
    nothing: "Nothing closer than {threshold}. The store always returns its nearest piece; this one is too far to count as an answer.",
    notConfigured: "The vector store is not configured on this machine — loading is unavailable.",
    sourceLabel: "Name it (optional)",
    sourcePlaceholder: "my-notes",
    stored: "Stored {n} pieces in {ms} ms · {dims} dimensions each.",
    textLabel: "Your text",
    textPlaceholder: "Paste what memory should be able to find by meaning…",
    timing: "Answered in {ms} ms, no model turn.",
  },
  graphSearch: {
    ask: "Ask — memory supplies the keywords",
    askLegacy: "Ask the old way, without keywords",
    busy: "Asking…",
    empty: "Nothing was found for this question.",
    errors: {
      "empty-question": "There is no question to ask.",
      "graph-unreachable": "The graph engine is not answering.",
      refused: "The graph refused the question.",
    },
    forget: "Forget everything the bench loaded",
    forgetDone: "Forgotten: {n}. Deletion runs in the background — the list empties within seconds.",
    found: "Found: {n} entity blocks.",
    keywordsLine: "Keywords we sent — topics: {high} · things: {low}.",
    label: "Your question",
    legacyNote:
      "Asked the old way: we sent no keywords, so the engine extracted them itself — with a model call. Whether it actually called one or answered from its cache we do not know, and we do not claim to.",
    matchedLine: "Recognised as entities the graph already knows: {names}.",
    modelNone:
      "No model turn: we named the keywords ourselves, so the engine had nothing left to extract.",
    modelUnknown: "Model turn: unknown — see the note below.",
    placeholder: "Ask in words that are not in the text…",
    timing: "Keywords prepared in {words} ms · the graph answered in {ask} ms.",
  },
  testBench: {
    graph: {
      search:
        "Ask in words that are not in the text. The graph answers from entities and relations it extracted at load time — this is where the answer must be instant.",
      upload:
        "Paste your text and press the button. A model reads it once and pulls out entities and relations: the cost sits here, at load time, on purpose.",
      verdict:
        "Only you can say whether the right thing was found. The numbers next to your verdict — seconds and model turns — are measured, not guessed.",
    },
    skillMissing:
      "The skill file {path} is not on this server — the delivery did not bring it.",
    skillLead:
      "The instructions the memory agent follows with this store — the very files it reads, byte for byte. Each opens on a click.",
    soon: "This control is built in the next sub-step. Nothing is hidden here: today the page only shows what it will hold.",
    tabs: {
      bench: "Test",
      search: "Search",
      skill: "Skill",
      upload: "Load",
      verdict: "Verdict",
    },
    vector: {
      search:
        "Ask by meaning, not by matching words. The store returns the closest passages with their distance — and an unrelated question must return nothing.",
      upload:
        "The same text becomes a fingerprint of its meaning. No model reads it; only the embeddings are computed, and that is much cheaper.",
      verdict:
        "The same verdict, the same case book. Two stores judged by one form, so their numbers can be compared at all.",
    },
    object: {
      search:
        "Ask for the thing, not a quote from it. The store returns whole objects — document, picture, PDF — each with an id and a closeness score; an unrelated question must return nothing.",
      upload:
        "Put a file as it is. It is kept whole; what makes it findable is its card — the name, your description and, for a text file, its opening. Nobody looks inside a picture or a PDF, so describe those in words.",
      skill:
        "The skill the memory agent will follow when a file arrives from the API: describe it, store it whole, answer by id. This is the file itself, read from disk on every load — the same text the agent reads.",
      verdict:
        "The same verdict and the same case book as the other two stores — three stores judged by one form.",
    },
  },
  subtitle:
    "The memory service speaking for itself: send it a phrase, see the answer, see what it built out of it.",
  title: "Memory",
};

const RU: MemoryUi = {
  apiKey: {
    copied: "Скопировано",
    copy: "Копировать",
    exists: "текущий ключ",
    failed: "Ключ не создан",
    generate: "Сгенерировать ключ доступа",
    lead:
      "Один ключ на чтение и запись. Он хранится только на этой машине, проверяется при каждом вызове и покидает сервер ровно один раз — здесь, в момент создания.",
    missing: "ключа ещё нет",
    regenerate: "Сгенерировать новый ключ",
    shownOnce: "Скопируйте сейчас — полностью ключ показывается только этот раз.",
    title: "Ключ доступа",
    warning:
      "Новый ключ отменяет прежний немедленно. Всё, что уже им пользуется, перестанет работать в тот же миг — отдельной кнопки «отозвать» нет, потому что это одно и то же действие.",
    working: "Создаю…",
  },
  journal: {
    bytes: "байт",
    clear: "Очистить историю — стирает насовсем",
    cleared: "Стёрто записей: {n}. Знание о людях не затронуто.",
    clearing: "стираем…",
    down: "Служба памяти не ответила",
    empty:
      "Журнал пуст: с последней очистки память ничего не делала. Это не отказ — записи появятся, как только к памяти обратятся.",
    entries: "записей",
    refresh: "Обновить",
    shared:
      "Этот же документ читает агент разработки — файлом на диске. Очистка стирает его для обоих сразу: второго источника нет.",
  },
  home: {
    whatIsBehind:
      "Публичная страница службы. То, что за ней — стенд памяти и журнал её работы, — открывается после входа с ролью архитектора.",
    whereToEnter:
      "Кнопка входа — справа вверху. После входа там же появится «Аккаунт» с почтой и ролями, а слева — разделы.",
  },
  layer: "Служба памяти",
  memoryTables: {
    columns: "колонок",
    down: "Служба памяти не ответила",
    empty:
      "Память пока не построила ни одной таблицы. Скажите ей что-нибудь выше — таблицы появляются сами, заранее их никто не объявляет.",
    lead: "Всё, что память построила из сказанного. Таблицы и колонки она заводит сама, в тот момент, когда они ей нужны.",
    loading: "читаем…",
    noRows: "таблица есть, строк в ней пока нет",
    refresh: "Обновить",
    rows: "строк",
    shown: "показано",
    title: "Что память построила",
  },
  memoryTest: {
    answerTitle: "Ответ памяти",
    ask: "Спросить",
    askHint: "Фраза уходит в recall. Пустое поле — всё, что памяти известно.",
    controls: {
      chain: {
        hint: "Рекурсивное размышление порождает много текста. Переполнять свой контекст или нет решает тот, кто спросил, — а не память за него.",
        label: "Возвращать цепочку размышлений",
        off: "Нет",
        on: "Да",
      },
      deny: {
        hint: "Опровергнуть прежний вывод памяти. Отменяется вывод, а не факт: основание остаётся — стёртая догадка рождается заново тем же поиском.",
        label: "Это неверно, потому что…",
        placeholder: "чем прежний ответ неверен",
      },
      depth: {
        deep: "Глубокий",
        deepHint:
          "Добавляется поиск по смыслу в векторной базе. Дольше и дороже — включайте, когда стандарт ничего не нашёл.",
        extreme: "Экстремальный",
        extremeHint:
          "Память уходит в рекурсивное исследование, до десяти минут. Тратит ту же квоту подписки, которой живёт бот. Только когда и глубокий не дал ответа.",
        label: "Глубина поиска",
        standard: "Стандарт",
        standardHint:
          "Память идёт сама: сначала база, потом модель, потом граф знаний. Секунды. Хватает почти всегда.",
      },
      history: {
        hint: "Зовущая модель по своему усмотрению передаёт памяти предыдущий разговор. Стенд, который так не умеет, проверяет не тот путь.",
        label: "История разговора",
        placeholder: "что говорили до этого вопроса",
      },
      advanced: "Расширенные параметры",
      legend: "метка говорит, доезжает ли параметр до договора сегодня",
      nothingSet: "ничего не выставлено — фраза уедет как есть",
      needTable: {
        hint: "Входной параметр: зовущий вправе сказать, что ответ должен стать таблицей. Заводить ли её — по-прежнему решение памяти.",
        label: "Требуется создать таблицу",
      },
      prior: {
        hint: "Что уже нашли до этого вопроса — зовущий вправе прислать это вместе с вопросом.",
        label: "Результаты предыдущих поисков",
        placeholder: "что уже было найдено",
      },
      scope: {
        add: "Добавить запись",
        date: "Дата",
        entry: "Запись",
        remove: "Убрать",
        hint: "Дата и место — это охват факта. Их бывает много: у одной фразы может быть несколько дат и мест, поэтому каждая запись — своя карточка. Пустой охват значит «не знаю где и когда», а не «везде и всегда».",
        label: "Календарь и геометка",
        place: "Место",
        placePlaceholder: "город или место",
      },
      setNow: "выставлено",
      supported: "доезжает",
      thread: {
        hint: "У Claude есть собственная нить размышления — со своим именем и своим кэшем. Память возвращает это имя в каждом ответе, где думала; пришлите его обратно — и продолжится та же цепочка: модель увидит свой прежний вывод, а стоит это ДЕШЕВЛЕ нового вызова. Опровергать вывод имеет смысл только с нитью.",
        label: "Нить прежнего разбора",
        placeholder: "идентификатор из прошлого ответа",
        take: "взять из последнего ответа",
      },
      title: "Органы управления",
      unsupported: "пока не доезжает",
      upload: {
        hint: "Память сегодня понимает только текст. Кнопки стоят здесь потому, что роды данных объявлены, — и выключены потому, что способности нет.",
        html: "HTML",
        image: "Изображение",
        label: "Отправить не текст",
        pdf: "PDF",
        sound: "Звук",
        video: "Видео",
      },
      who: {
        bench: "bench-1 — служебное имя стенда",
        hint: "Память отвечает про конкретного человека. Список — тот, что память знает сама; людей стенд не выдумывает.",
        label: "От чьего имени",
        loading: "спрашиваем память, кого она знает…",
      },
    },
    droppedTitle: "Выставлено здесь, но этот метод пока такого не принимает",
    failed: "Стенд не достучался до двери",
    inputTitle: "Что отправляем",
    lead: "Фразы уходят прямо в службу памяти — эта страница работает на самой службе, значит между вами и памятью нет вообще ничего.",
    nothingSent: "Пока ничего не отправляли.",
    nothingYet: "Память ещё не отвечала — отправьте фразу слева.",
    raw: "Сырой вызов",
    rawBody: "Тело запроса, JSON",
    rawHint: "Любой метод договора, тело — JSON. Непостроенный метод отвечает 501, и стенд это тоже покажет.",
    rawMethod: "Имя метода",
    say: "Сказать",
    sayHint: "Фраза уходит в remember — так же, как человек рассказывает что-то боту.",
    send: "Отправить",
    sending: "отправляем…",
    status: "код",
    took: "заняло",
    volatile: "Список живёт в этой вкладке браузера и исчезает при перезагрузке.",
    whatGoes: "Что уедет в память",
  },
  menuTitle: "Память",
  menuWord: "Меню",
  passportMissing:
    "Документа паспорта пока нет на диске: development-docs/PASSPORT.md. Он пишется первым — раньше кода.",
  buildLabel: "Постройте этот продукт",
  terminalLabel: "Подписка Claude",
  openai: {
    badFormat: "Это не похоже на ключ OpenAI — они начинаются с sk-",
    balanceNote:
      "Остаток показать нельзя: OpenAI отдаёт его только браузерной сессии вашего кабинета или админскому ключу с правом api.usage.read. Обычный проектный ключ его не видит.",
    check: "Проверить",
    checking: "Проверяю…",
    consumerApp: "проект сайта",
    consumerData: "слой данных",
    consumerGraph: "граф знаний",
    consumerMachine: "память и бот",
    exists: "Ключ OpenAI существует",
    failed: "Действие не выполнено",
    funded: "Баланс положительный",
    fundsUnknown: "Про средства ответить не удалось — попробуйте позже",
    invalid: "OpenAI этот ключ не принял",
    keyLabel: "Ключ с platform.openai.com",
    keyPlaceholder: "sk-…",
    keyReplace: "Вставьте новый ключ, чтобы заменить сохранённый",
    lead:
      "Ключ один на весь сервер: введённый здесь, он доезжает до всех служб, которым нужен. Если вы уже вводили его в другом месте — второй раз вводить не нужно.",
    missing: "Ключ OpenAI не задан",
    noFunds: "Ключ рабочий, но на счёте кончились средства",
    partial: "Ключ доехал не до всех служб",
    restartNote:
      "Большинство служб подхватывают новый ключ сразу. Проект сайта и граф знаний читают его при запуске — им он достанется после ближайшего перезапуска.",
    save: "Сохранить",
    saved: "Ключ OpenAI сохранён",
    saving: "Сохраняю…",
    title: "Ключ OpenAI",
    valid: "Ключ верный",
  },
  openaiTab: {
    heading: "Зачем проекту ключ OpenAI",
    intro:
      "Думает в проекте Claude — по вашей подписке. Ключ OpenAI нужен для двух вспомогательных дел, и без него они не делаются:",
    voiceTitle: "Голос превращается в текст",
    voice:
      "Когда вы не печатаете сообщение, а надиктовываете его, запись нужно превратить в текст. Это делает OpenAI. Без ключа голосовое сообщение так и останется звуком, который никто не прочитал.",
    vectorsTitle: "Поиск по смыслу",
    vectors:
      "Чтобы находить нужное в ваших документах и прошлых разговорах, каждый текст превращается в «отпечаток смысла» — вектор. Агентный RAG и векторная база сравнивают такие отпечатки и находят близкое по смыслу, даже когда слова другие. Отпечатки делает OpenAI.",
    without:
      "Без ключа главное продолжает работать: Claude отвечает, память запоминает сказанное. Пропадут расшифровка голоса и поиск по смыслу.",
  },
  pages: {
    journal: {
      hint: "Что память делала: её собственный рассказ о своей работе. Этот же документ читает агент разработки — файлом.",
      title: "Журнал",
    },
    openai: {
      hint: "Зачем нужен ключ OpenAI — и сам ключ, один на весь сервер.",
      title: "Подписка OpenAI",
    },
    settings: {
      hint: "Ключи и выключатели самой службы. Ключ Anthropic здесь тот же, что у чата: он лежит в складе секретов машины.",
      title: "Настройки",
    },
    api: {
      hint: "Как внешние инструменты работают с этой памятью: ключ, методы, пределы — и как проверить это в Postman.",
      title: "API",
    },
    "memory-test": {
      hint: "Отправьте фразу прямо в память и посмотрите её ответ — агента в цепочке нет.",
      title: "Тест памяти",
    },
    "graph-test": {
      hint: "Загрузите свой текст, посмотрите, как из него строится граф, а потом спросите другими словами — и увидьте, за сколько приходит ответ.",
      title: "Тест графа знаний",
    },
    "vector-test": {
      hint: "Те же три шага для векторного хранилища: загрузить, найти по смыслу, оценить найденное.",
      title: "Тест векторного хранилища",
    },
    "object-test": {
      hint: "Эта вкладка проверяет связку объектного хранилища со всеми службами, которые участвуют в хранении данных: каждый объект, попавший в память, прописывается в базе данных, векторном хранилище и графе знаний и сохраняется в исходном виде в объектном хранилище.",
      title: "Тест объектного хранилища",
    },
    passport: {
      hint: "Что такое память и как она работает — написанное раньше, чем построено. Читаете, утверждаете или меняете; код идёт после.",
      title: "Паспорт",
    },
  },
  subtitle:
    "Служба памяти говорит сама за себя: отправьте ей фразу, посмотрите ответ и то, что она из него построила.",
  graphUpload: {
    anchorsHint:
      "Без якоря запись примут, а найти её не сможет никто: вопрос приходит от имени, и у записи без связи с именем нет ничего, чем её достать.",
    anchorsLabel: "Якоря — к кому или к чему это относится",
    anchorsPlaceholder: "Денис, Кремль",
    button: "Преобразовать и сохранить",
    busy: "Модель читает ваш текст…",
    docsEmpty: "В графе пока ничего нет.",
    docsTitle: "Что лежит в графе",
    errors: {
      "empty-text": "Нечего загружать: текста нет.",
      "no-anchor": "Назовите хотя бы один якорь — иначе запись потом не найти.",
      offline: "Движок графа не отвечает. Ничего не загружено.",
      refused: "Граф отказался принять документ.",
    },
    grew: "Сущностей стало больше: {from} → {to}.",
    labelsNow: "Сущностей в графе: {n}.",
    notReady: "Движок графа отсюда недостижим — загрузка недоступна.",
    sourceLabel: "Как назвать (необязательно)",
    sourcePlaceholder: "мои-заметки",
    taken: "Принято за {ms} мс. Связи строятся в фоне — список ниже обновляется сам.",
    textLabel: "Ваш текст",
    textPlaceholder: "Вставьте то, что память должна выучить…",
    waiting: "Строится…",
    workLine:
      "Кусков прочитано моделью: {chunks} · сущностей извлечено: {entities} · связей: {relations}.",
    workNone: "Граф пока не отчитывался о работе.",
    workNote:
      "Кусков прочитано — это нижняя граница числа ходов модели: счётчика вызовов служба наружу не отдаёт, а придуманная точность была бы ложью о цене. Здесь и происходит дорогая половина работы — чтение после неё почти бесплатно.",
    workTitle: "Чем обошлась загрузка",
  },
  benchCases: {
    bad: "Нашло не то",
    empty: "Прогонов пока нет. Спросите что-нибудь на вкладке «Поиск» и вернитесь.",
    good: "Нашло то",
    judged: "Вердикт записан.",
    lead:
      "Нашлось нужное или нет — можете сказать только вы. Оценивать собственную работу памяти запрещено: модель, пересказывающая свой прогон, ошибается в свою пользу.",
    legacyMark: "спрошено по-старому",
    modelMark: "ход модели: {turn}",
    pending: "ждёт вашего вердикта",
    summary:
      "Прогонов: {total} · нашло то: {good} · не то: {bad} · без вердикта: {pending} · ответ в среднем: {avg} мс.",
    title: "Корпус случаев",
    why: "Почему (необязательно)",
  },
  objectBench: {
    aboutHint:
      "Примерно 50 слов: что это за объект и о чём он. По этому саммари объект потом находят. Обязательно для картинок, PDF, звука и видео; для текстового файла необязательно.",
    aboutLabel: "Саммари",
    aboutPlaceholder: "Схема цикла разработки: от запроса администратора до выкладки",
    ask: "Найти объект",
    askLabel: "Что вы ищете",
    askPlaceholder: "Опишите саму вещь, а не слова внутри неё…",
    asking: "Ищем…",
    binary: "Этот род не читается: вот его карточка. Ссылайтесь на объект по идентификатору.",
    busy: "Кладём файл и его карточку…",
    button: "Сохранить объект",
    close: "Закрыть",
    costNote:
      "Сохранение стоит одного встраивания, каким бы большим ни был файл. «Получить описание» — по желанию и стоит одного хода модели: звук расшифровывает OpenAI, всё остальное читает Claude по подписке владельца — из той же квоты, что и Telegram-бот.",
    empty: "В объектном хранилище пока ничего нет.",
    errors: {
      "card-failed": "Файл принят, а карточка — нет; файл тут же удалён, наполовину ничего не лежит.",
      "empty-file": "Нечего сохранять: файла нет.",
      "no-about": "Опишите объект словами — картинку или PDF без описания не найдёт никто.",
      "not-found": "Объекта с таким идентификатором нет.",
      "not-ours": "Этот файл принадлежит медиатеке платформы, а не памяти.",
      offline: "Хранилище не отвечает. Ничего не сохранено.",
      refused: "Хранилище отказалось принять файл.",
      "store-unreachable": "Хранилище не отвечает.",
      "too-large": "Файл больше 20 МБ.",
    },
    fileLabel: "Файл",
    chooseFile: "Выбрать файл",
    noFile: "Файл не выбран",
    describe: "Получить описание",
    describing: "Модель описывает файл… {s} с",
    describedBy: "Описал: {by}, за {s} с · язык содержимого: {lang}. Прочитайте и поправьте оба поля до сохранения.",
    describeErrors: {
      "describe-answer-unusable": "Модель ответила не по форме. Попробуйте ещё раз или опишите сами.",
      "describe-empty-file": "Файл пустой.",
      "describe-ffmpeg-failed": "Видео не удалось разобрать на звуковую дорожку и кадры.",
      "describe-kind-unsupported": "Файлы такого рода не описываются. Опишите сами.",
      "describe-too-large": "Файл больше 20 МБ.",
      failed: "Описание не получилось. Можно написать его самому.",
      "model-key-missing": "На машине нет ключа OpenAI — звук расшифровать нечем.",
      "model-key-rejected": "Ключ OpenAI отвергнут — его нужно заменить.",
      "model-quota-exhausted": "На счёте OpenAI кончились оплаченные токены.",
      "model-unreachable": "OpenAI не принял файл или не отвечает.",
      "think-not-authorized": "Claude на сервере не вошёл в подписку.",
      "think-quota-exhausted": "Лимит подписки Claude на сервере исчерпан. Попробуйте после сброса.",
      "think-subscription-disabled": "Доступ Claude по подписке отключён.",
      "think-timed-out": "Модель думала слишком долго (больше 5 минут).",
    },
    fullHint:
      "Настолько подробно, чтобы ИИ мог восстановить объект по одному этому тексту. Хранится рядом с файлом в объектном хранилище.",
    fullLabel: "Полное описание",
    fullPlaceholder: "Композиция, каждый элемент и его место, цвета, весь видимый текст…",
    openFile: "Открыть файл",
    savedFile: "Файл — в объектном хранилище",
    savedFull: "Полное описание — рядом с файлом",
    savedMissing: "Объект сохранён, но прочитать его запись не удалось.",
    savedNoRow: "У этого объекта нет строки в messages_that_came_into_memory: он сохранён раньше, чем появилась таблица. Показаны файл и его описание.",
    intro: {
      cardTitle: "Как объект ложится в память и какие объекты поддерживает служба",
      paragraphs: [
        "Каждый объект ложится сразу в четыре места или ни в одно: сам файл и его полное описание — в объектное хранилище; саммари — в строку таблицы messages_that_came_into_memory и в карточку поиска векторного хранилища; а если в описании названы люди, места или продукты — документ в граф знаний. Сорвалась любая ступень — уже записанное снимается, а строка остаётся со статусом failed и причиной.",
        "Благодаря этому объект находится по всем правилам архитектуры памяти: дёшево — по смыслу карточки поиска, одним встраиванием и без хода модели; точно — по названию и тегам в строке таблицы (стенд этот путь пока не использует); глубоко — через граф, когда вопрос о том, как вещи связаны.",
        "Своего предела размера у памяти нет: сервер принимает файлы до 200 МБ, речь расшифровывается до 25 МБ.",
      ],
      kindsTitle: "Какие объекты поддерживает служба",
      kinds: [
        { title: "Изображение", body: "Читает Claude со зрением: каждый элемент, его место, цвета и весь видимый текст становятся полным описанием, плюс саммари примерно в 50 слов. Картинка хранится как есть и находится по саммари." },
        { title: "Видео", body: "ffmpeg вырезает звуковую дорожку и шесть кадров равномерно. Дорожку расшифровывает OpenAI whisper-1 с метками времени, кадры читает Claude — одна шкала, где кадры стоят между репликами. Видео хранится как есть." },
        { title: "Аудио", body: "Речь расшифровывает OpenAI whisper-1 с меткой времени у каждого фрагмента; описание и саммари Claude пишет по расшифровке. Запись хранится как есть." },
        { title: "PDF", body: "Claude читает документ целиком: структура, заголовки и содержание, таблицы построчно. PDF хранится как есть и открывается собственным просмотрщиком браузера." },
        { title: "Markdown", body: "Claude читает документ, его начало ложится ещё и в карточку поиска. Хранится файлом, показывается тем документом, которым становится." },
        { title: "HTML", body: "Claude читает страницу, её начало ложится в карточку поиска. Показывается страницей в песочнице — её скрипты не дотягиваются до памяти — и своим исходником." },
        { title: "Исходный код", body: "TypeScript, JavaScript, Python, SQL, JSON, YAML и другие. Claude анализирует, а не переписывает: что код делает для человека, что экспортирует и импортирует, на каких технологиях построен — до ~3000 знаков. Файл хранится текстом, подсвечивается просмотрщиком кода и никогда не запускается." },
        { title: "Простой текст", body: "TXT и CSV: Claude читает содержимое, начало ложится в карточку поиска." },
        { title: "Любой другой файл", body: "Хранится как есть, если саммари написать самому: роды, которые модель не умеет читать, она не описывает." },
      ],
    },
    savedRow: "Строка messages_that_came_into_memory",
    savedSummary: "Саммари — в строке таблицы и в карточке поиска",
    savedTitle: "Что легло в память",
    preview: {
      close: "Закрыть",
      code: "Код",
      kindAudio: "Аудио",
      kindCode: "Код",
      kindFile: "Файл",
      kindHtml: "HTML",
      kindImage: "Изображение",
      kindMarkdown: "Markdown",
      kindPdf: "PDF",
      kindVideo: "Видео",
      open: "Открыть",
      preview: "Просмотр",
      reading: "Читаю…",
      unreadable: "Файл прочитать не удалось",
    },
    forget: "Забыть все объекты памяти",
    forgot: "Забыто: {n}.",
    hits: "Объектов ближе {threshold}: {n}.",
    inStore: "Объектов в памяти: {n}.",
    lost: "Карточек без файла: {n} — файл удалили мимо памяти.",
    nearestWas: "Ближайшее было {score} —",
    nothing:
      "Ничего ближе {threshold}. У хранилища всегда есть ближайший объект; этот слишком далёк, чтобы считаться ответом.",
    notConfigured: "Склад карточек (векторы) на этой машине не настроен — объекты не найти.",
    open: "Открыть",
    shown: "Показано {shown} из {total} знаков.",
    stored: "Сохранён {name} · {size} байт · карточка {card} знаков · {ms} мс.",
    timing: "Ответ за {ms} мс, без хода модели.",
  },
  vectorBench: {
    ask: "Найти по смыслу",
    askLabel: "Ваш вопрос",
    askPlaceholder: "Спрашивайте о смысле, а не о формулировке…",
    asking: "Ищем…",
    busy: "Считаем встраивания…",
    button: "Преобразовать и сохранить",
    costNote:
      "Этот текст не читает ни одна модель: считаются только встраивания. Поэтому загрузка сюда заметно дешевле и быстрее, чем в граф, — и поэтому же знания о связях отсюда не возникает.",
    cutHint:
      "Текст режется на куски по пустым строкам: абзац и есть естественная единица смысла. Совсем короткие прилепляются к предыдущему — обрывок, близкий ко всему, не близок ни к чему.",
    errors: {
      "empty-text": "Нечего загружать: текста нет.",
      offline: "Хранилище не отвечает. Ничего не загружено.",
      refused: "Хранилище отказалось принять текст.",
      "store-unreachable": "Хранилище не отвечает.",
    },
    forget: "Забыть всё, что загрузил стенд",
    hits: "Попаданий ближе {threshold}: {n}.",
    inStore: "В коллекции стенда: кусков {n} · модель {model}.",
    nearestWas: "Ближайшее было {score} —",
    nothing:
      "Ничего ближе {threshold}. Хранилище всегда возвращает свой ближайший кусок; этот слишком далёк, чтобы считаться ответом.",
    notConfigured: "Векторное хранилище на этой машине не настроено — загрузка недоступна.",
    sourceLabel: "Как назвать (необязательно)",
    sourcePlaceholder: "мои-заметки",
    stored: "Уложено кусков: {n} за {ms} мс · по {dims} измерений в каждом.",
    textLabel: "Ваш текст",
    textPlaceholder: "Вставьте то, что память должна уметь находить по смыслу…",
    timing: "Ответ за {ms} мс, без хода модели.",
  },
  graphSearch: {
    ask: "Спросить — слова даёт память",
    askLegacy: "Спросить по-старому, без слов",
    busy: "Спрашиваем…",
    empty: "По этому вопросу ничего не нашлось.",
    errors: {
      "empty-question": "Нечего спрашивать: вопроса нет.",
      "graph-unreachable": "Движок графа не отвечает.",
      refused: "Граф отказался отвечать на вопрос.",
    },
    forget: "Забыть всё, что загрузил стенд",
    forgetDone: "Забыто: {n}. Удаление идёт в фоне — список опустеет за считаные секунды.",
    found: "Нашлось: блоков сущностей — {n}.",
    keywordsLine: "Ключевые слова, которые мы послали — темы: {high} · вещи: {low}.",
    label: "Ваш вопрос",
    legacyNote:
      "Спрошено по-старому: слов мы не дали, и движок извлекал их сам — вызовом модели. Позвал он её на самом деле или ответил из своего кэша, мы не знаем и не утверждаем.",
    matchedLine: "Узнано как сущности, которые граф уже знает: {names}.",
    modelNone:
      "Ходов модели не было: ключевые слова мы назвали сами, и движку нечего было извлекать.",
    modelUnknown: "Ход модели: неизвестно — смотрите примечание ниже.",
    placeholder: "Спросите словами, которых в тексте нет…",
    timing: "Слова собраны за {words} мс · граф ответил за {ask} мс.",
  },
  testBench: {
    graph: {
      search:
        "Спросите словами, которых в тексте нет. Граф отвечает из сущностей и связей, добытых при загрузке, — здесь ответ обязан приходить мгновенно.",
      upload:
        "Вставьте свой текст и нажмите кнопку. Модель прочитает его один раз и вытащит сущности и связи: цена стоит здесь, на загрузке, и это сделано намеренно.",
      verdict:
        "Нашлось нужное или нет — можете сказать только вы. Числа рядом с вашим вердиктом — секунды и ходы модели — измерены, а не прикинуты.",
    },
    skillMissing:
      "Файла навыка {path} на этом сервере нет — доставка его не привезла.",
    skillLead:
      "Инструкции, по которым агент памяти работает с этим хранилищем, — те самые файлы, которые он читает, байт в байт. Каждая открывается нажатием.",
    soon: "Этот орган строится следующим подшагом. Здесь ничего не спрятано: сегодня страница показывает только то, что будет на ней стоять.",
    tabs: {
      bench: "Тест",
      search: "Поиск",
      skill: "Навык",
      upload: "Загрузка",
      verdict: "Оценка",
    },
    vector: {
      search:
        "Спрашивайте по смыслу, а не по совпадению слов. Хранилище вернёт ближайшие куски и их близость — а посторонний вопрос обязан не найти ничего.",
      upload:
        "Тот же текст превращается в отпечаток смысла. Модель его не читает — считаются только встраивания, и это заметно дешевле.",
      verdict:
        "Тот же вердикт и тот же корпус случаев. Два хранилища судятся одной формой — иначе их числа не с чем сравнивать.",
    },
    object: {
      search:
        "Спрашивайте о самой вещи, а не цитату из неё. Хранилище вернёт объекты целиком — документ, картинку, PDF — с идентификатором и близостью; посторонний вопрос обязан не найти ничего.",
      upload:
        "Положите файл как есть. Он хранится целиком, а находит его карточка — имя, ваше описание и, у текстового файла, его начало. Внутрь картинки и PDF никто не смотрит, поэтому их описывайте словами.",
      skill:
        "Навык, по которому агент памяти будет действовать, когда файл придёт через API: описать, сохранить целиком, ответить номерами. Это сам файл, прочитанный с диска при каждой загрузке, — тот же текст, что читает агент. Навык написан по-английски: машинный слой памяти одноязычен.",
      verdict:
        "Тот же вердикт и тот же корпус случаев, что у двух других хранилищ, — три хранилища судятся одной формой.",
    },
  },
  title: "Память",
};

const DICT: Record<string, MemoryUi> = { en: EN, ru: RU };

/** Слова языка. Неизвестный язык падает на английский — тот же закон, что у соседей. */
export function memoryUi(lang: string): MemoryUi {
  return DICT[lang] ?? EN;
}
