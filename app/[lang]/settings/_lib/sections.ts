/**
 * Разделы страницы службы ИИ-браузера (196-2).
 *
 * 🔒 ЕДИНСТВЕННЫЙ ИСТОЧНИК И МЕНЮ, И МАРШРУТИЗАЦИИ — тот же закон, что у `memory-sections.ts` службы памяти, с которой
 * страница скопирована. Разделов ЧЕТЫРЕ (196-3), и число правится вместе с массивом: паспорт · API · тест чтения · ключ.
 * 🛑 Тексты главной — 196-5.
 */
export const SECTIONS = ["passport", "api", "read-test", "settings"] as const;

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
