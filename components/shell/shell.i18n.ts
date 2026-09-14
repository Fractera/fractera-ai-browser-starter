// СЛОВА ШАПКИ И ПОДВАЛА СЛУЖБЫ — СВОИ, А НЕ ЗАИМСТВОВАННЫЕ.
//
// 🔒 СЛОВАРЬ ЗДЕСЬ КРОШЕЧНЫЙ НАМЕРЕННО. В подвале осталась одна строка и три
// подписи к переключателю темы; тянуть ради них словарь чужого подвала значило
// бы вернуть зависимость, ради устранения которой подвал и вычищен.
//
// 🔒 ТЕКСТЫ ВЗЯТЫ ДОСЛОВНО ИЗ ПРЕЖНЕГО `footer-menu.i18n.ts`, а не переписаны
// заново: человек видел эти слова вчера, и менять их заодно с раскладкой значит
// смешивать две правки в одной.

export type ShellUi = {
  /** Красная полоса под шапкой, пока браузер работает (196-8, слово владельца «as red notification»); `{n}` — длина очереди. */
  busy: string;
  /** Та же полоса, когда движок не поднят или перезапускается. */
  engineDown: string;
  rights: string
  /** Подпись кнопки навигации в шапке — ведёт в настройки проекта. */
  settings: string;
  system: string;
  light: string;
  dark: string;
};

const UI: Record<string, ShellUi> = {
  en: {
    busy: "AI browser is working — pages in queue: {n}",
    engineDown: "AI browser engine is not running or is restarting",
    dark: "Theme: dark",
    light: "Theme: light",
    rights: "All rights reserved.",
    settings: "Settings",
    system: "Theme: system",
  },
  es: {
    busy: "El navegador IA está trabajando — páginas en cola: {n}",
    engineDown: "El motor del navegador IA no está en marcha o se está reiniciando",
    dark: "Tema: oscuro",
    light: "Tema: claro",
    rights: "Todos los derechos reservados.",
    settings: "Ajustes",
    system: "Tema: sistema",
  },
  ru: {
    busy: "ИИ-браузер работает — страниц в очереди: {n}",
    engineDown: "Движок ИИ-браузера не запущен или перезапускается",
    dark: "Тема: тёмная",
    light: "Тема: светлая",
    rights: "Все права защищены.",
    settings: "Настройки",
    system: "Тема: системная",
  },
};

/** Слова слоя. Незнакомый язык деградирует до английского, а не до пустоты. */
export function shellUi(lang: string): ShellUi {
  return UI[lang] ?? UI.en;
}
