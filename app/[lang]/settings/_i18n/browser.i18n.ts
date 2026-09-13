// СЛОВА СТРАНИЦЫ СЛУЖБЫ ИИ-БРАУЗЕРА (196-2). Заменяют словарь службы памяти, с которой страница скопирована.
// 🔒 Один язык на странице, ветки en/ru с одинаковыми ключами — стандарт, доращиваемый до 82 языков файлом.

import type { ApiKeyWords } from "../_components/api-key.client";
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
    settings: { hint: "The access key for outside tools.", title: "Access key" },
  },
  passportMissing: "The service passport file is not on this server.",
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
    settings: { hint: "Ключ доступа для чужих программ.", title: "Ключ доступа" },
  },
  passportMissing: "Файла паспорта службы на этом сервере нет.",
  subtitle: "Настоящий браузер для машин: память, другие службы и агенты открывают страницу по адресу и получают итоговый HTML и весь текст.",
  title: "ИИ-браузер",
};

const DICT: Record<string, BrowserUi> = { en: EN, ru: RU };

export function browserUi(lang: string): BrowserUi {
  return DICT[lang] ?? EN;
}
