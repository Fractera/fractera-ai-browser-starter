/**
 * Разделы страницы службы ИИ-браузера (196-2).
 *
 * 🔒 ЕДИНСТВЕННЫЙ ИСТОЧНИК И МЕНЮ, И МАРШРУТИЗАЦИИ — тот же закон, что у `memory-sections.ts` службы памяти, с которой
 * страница скопирована. Разделов ТРИ, и число правится вместе с массивом: паспорт · API · ключ.
 * 🛑 Стенд «тест чтения» — шаг 196-3 (вместе с несколькими ссылками), тексты главной — 196-5.
 */
export const SECTIONS = ["passport", "api", "settings"] as const;

export type Section = (typeof SECTIONS)[number];

export function isSection(v: unknown): v is Section {
  return typeof v === "string" && (SECTIONS as readonly string[]).includes(v);
}

/** Неизвестное значение падает на паспорт, а не на пустой экран: адрес приходит из строки браузера. */
export function resolveSection(raw: string | undefined): Section {
  return isSection(raw) ? raw : "passport";
}

export function hrefOfSection(lang: string, section: Section): string {
  return `/${lang}/settings?section=${section}`;
}
