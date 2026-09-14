// СЛОВА СТРАНИЦЫ СЛУЖБЫ ИИ-БРАУЗЕРА (196-2). Заменяют словарь службы памяти, с которой страница скопирована.
// 🔒 Один язык на странице, ветки en/ru с одинаковыми ключами — стандарт, доращиваемый до 82 языков файлом.

import type { ApiKeyWords } from "../_components/api-key.client";
import type { ReadTestWords } from "../_components/read-test.client";
import type { Section } from "../_lib/sections";

export type BrowserUi = {
  layer: string;
  title: string;
  subtitle: string;
  menuTitle: string;
  menuWord: string;
  passportMissing: string;
  pages: Record<Section, { title: string; hint: string }>;
  apiKey: ApiKeyWords;
  readTest: ReadTestWords;
};

const EN: BrowserUi = {
  apiKey: {
    copied: "Copied",
    copy: "Copy",
    exists: "A key exists:",
    failed: "The key could not be created. Try again.",
    generate: "Generate a key",
    lead: "Outside tools and agents call the browser with this key: in the x-ai-browser-key header or as Authorization: Bearer.",
    missing: "No key yet — outside tools cannot call the browser.",
    regenerate: "Replace the key",
    shownOnce: "The key is shown once. Copy it now.",
    title: "AI browser access key",
    warning: "Replacing the key stops the previous one at once.",
    working: "Working…",
  },
  layer: "Fractera",
  menuTitle: "AI browser",
  menuWord: "Sections",
  pages: {
    api: { hint: "The contract other programs use: methods, key, examples.", title: "API" },
    passport: { hint: "What this service is and how it is built.", title: "Passport" },
    "read-test": { hint: "Open pages by address and see exactly what programs receive.", title: "Read test" },
    settings: { hint: "The access key for outside tools.", title: "Access key" },
  },
  passportMissing: "The service passport file is not on this server.",
  readTest: {
    counts: { audios: "Audio", blocked: "Blocked", buttons: "Buttons", fields: "Fields", forms: "Forms", headings: "Headings", iframes: "Frames", images: "Images", links: "Links", videos: "Video" },
    error: "Refused",
    failed: "Not opened",
    finalUrl: "final address",
    html: "Final HTML",
    lead: "Paste one or more addresses, one per line. The browser on this server opens each page, waits for its scripts and returns the final HTML, all the text, headings, interactive elements and media by attributes. Addresses of this machine, loopback and private networks are refused — on every request the page makes, not only the first.",
    limitNote: "Up to 10 addresses per call, opened one after another.",
    meta: "Meta",
    ms: "ms",
    placeholder: "https://example.com\nhttps://todomvc.com/examples/react/dist/",
    run: "Open",
    running: "Opening…",
    status: "code",
    text: "Visible text",
    total: "On the page in total",
    truncatedNote: "The screen shows the beginning; programs receive the full value.",
  },
  subtitle: "A real browser for machines: memory, other services and agents open a page by its address and get the final HTML and all the text.",
  title: "AI browser",
};

const RU: BrowserUi = {
  apiKey: {
    copied: "Скопировано",
    copy: "Копировать",
    exists: "Ключ есть:",
    failed: "Ключ не создался. Попробуйте ещё раз.",
    generate: "Создать ключ",
    lead: "С этим ключом браузер зовут чужие программы и агенты: в заголовке x-ai-browser-key или как Authorization: Bearer.",
    missing: "Ключа ещё нет — чужие программы браузер позвать не могут.",
    regenerate: "Заменить ключ",
    shownOnce: "Ключ показывается один раз. Скопируйте его сейчас.",
    title: "Ключ доступа к ИИ-браузеру",
    warning: "Замена ключа сразу останавливает прежний.",
    working: "Выполняется…",
  },
  layer: "Fractera",
  menuTitle: "ИИ-браузер",
  menuWord: "Разделы",
  pages: {
    api: { hint: "Договор, которым пользуются другие программы: методы, ключ, примеры.", title: "API" },
    passport: { hint: "Что это за служба и как она устроена.", title: "Паспорт" },
    "read-test": { hint: "Откройте страницы по адресу и посмотрите ровно то, что получают программы.", title: "Тест чтения" },
    settings: { hint: "Ключ доступа для чужих программ.", title: "Ключ доступа" },
  },
  passportMissing: "Файла паспорта службы на этом сервере нет.",
  readTest: {
    counts: { audios: "Звук", blocked: "Отвергнуто", buttons: "Кнопки", fields: "Поля", forms: "Формы", headings: "Заголовки", iframes: "Фреймы", images: "Картинки", links: "Ссылки", videos: "Видео" },
    error: "Отказ",
    failed: "Не открылось",
    finalUrl: "итоговый адрес",
    html: "Итоговый HTML",
    lead: "Вставьте один или несколько адресов, по одному в строке. Браузер на этом сервере открывает каждую страницу, дожидается её скриптов и отдаёт итоговый HTML, весь текст, заголовки, интерактивные элементы и медиа по атрибутам. Адреса самой машины, петли и частных сетей отвергаются — на каждом запросе страницы, а не только на первом.",
    limitNote: "До 10 адресов за вызов, открываются по очереди.",
    meta: "Мета",
    ms: "мс",
    placeholder: "https://example.com\nhttps://todomvc.com/examples/react/dist/",
    run: "Открыть",
    running: "Открываю…",
    status: "код",
    text: "Видимый текст",
    total: "Всего на странице",
    truncatedNote: "На экране — начало; программы получают значение целиком.",
  },
  subtitle: "Настоящий браузер для машин: память, другие службы и агенты открывают страницу по адресу и получают итоговый HTML и весь текст.",
  title: "ИИ-браузер",
};

const DICT: Record<string, BrowserUi> = { en: EN, ru: RU };

export function browserUi(lang: string): BrowserUi {
  return DICT[lang] ?? EN;
}
