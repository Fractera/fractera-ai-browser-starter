// СЛУЖБЫ FRACTERA СО СВОИМИ СТРАНИЦАМИ — ОДИН СПИСОК НА ТРИ ПОДВАЛА (шаг 197, 2026-09-14).
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-14, ДОСЛОВНО: «Более-менее стандартной страницы для субдомена чата, memory и браузер имеет
// типовой фут который должен перекрёстный ссылаться во все эти страницы. Добавь».
// 🪦 ОТМЕНЯЕТ ЕГО ЖЕ РЕШЕНИЕ 2026-09-11 «пока только перелинковкой друг на друга; больше добавлять ссылок не нужно» — тогда
// служб со страницами было две, и у каждой в подвале стояла одна ссылка на соседа.
//
// 🔒 ЭТОТ ФАЙЛ ЛЕЖИТ БАЙТ В БАЙТ В ТРЁХ РЕПОЗИТОРИЯХ: `fractera-telegrambot-starter`, `fractera-memory-starter`,
// `fractera-ai-browser-starter` (`components/shell/services.ts`), вместе с `site-footer.tsx`. Копии, поправленные по
// отдельности, разошлись бы молча — и одна служба перестала бы ссылаться на новую. Новая служба со своей страницей
// добавляется строкой сюда и тем же файлом во все три дерева.
// 🔒 АДРЕС ВЫВОДИТСЯ ИЗ ХОСТА, А НЕ ПИШЕТСЯ КОНСТАНТОЙ: на домене — `<приставка>.<апекс>`, на голом IP — соседний порт.
// Константа увела бы человека с его сервера на наш. Свой вывод здесь, а не из `lib/fractera/auth-url.ts`: у трёх служб
// эти файлы разошлись (одно и то же имя функции означало в одной соседа, в другой — себя).
// 🛑 ПУСТОЙ АДРЕС — ЗАКОННЫЙ ИСХОД: хост без поддомена и без порта сосчитать не из чего, и ссылки тогда нет вовсе.

export type ServiceId = "chat" | "memory" | "ai-browser";

/** Службы со своими страницами: имя в `SUBDOMAINS` панели и порт. Порядок — порядок в подвале. */
export const FRACTERA_SERVICES: ReadonlyArray<{ id: ServiceId; port: string; prefix: string }> = [
  { id: "chat", port: "3600", prefix: "chat" },
  { id: "memory", port: "3700", prefix: "memory" },
  { id: "ai-browser", port: "3800", prefix: "ai-browser" },
];

/** Публичный адрес службы, выведенный из хоста, по которому открыта текущая страница. */
export function serviceUrl(service: { port: string; prefix: string }, host: string, proto: string): string {
  if (!host) return "";
  const byPort = host.match(/^(.+):(\d+)$/);
  if (byPort) return `${proto}://${byPort[1]}:${service.port}`;
  const parts = host.split(".");
  if (parts.length < 3) return "";
  return `${proto}://${service.prefix}.${parts.slice(1).join(".")}`;
}

type ServicesUi = { label: string; names: Record<ServiceId, string> };

const UI: Record<string, ServicesUi> = {
  en: { label: "Fractera services", names: { "ai-browser": "AI browser", chat: "Chat service", memory: "Memory service" } },
  es: { label: "Servicios de Fractera", names: { "ai-browser": "Navegador IA", chat: "Servicio de chat", memory: "Servicio de memoria" } },
  ru: { label: "Службы Fractera", names: { "ai-browser": "ИИ-браузер", chat: "Служба чата", memory: "Служба памяти" } },
};

/** Слова подвала. Незнакомый язык деградирует до английского, а не до пустоты. */
export function servicesUi(lang: string): ServicesUi {
  return UI[lang] ?? UI.en;
}
