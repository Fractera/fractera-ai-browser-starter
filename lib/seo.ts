import { headers } from "next/headers";

// ПОИСКОВЫЙ СЛОЙ СЛУЖБЫ ПАМЯТИ (186-2).
//
// 🎯 ТРЕБОВАНИЕ ВЛАДЕЛЬЦА 2026-09-11: «атрибуты этой страницы должны иметь
// максимальную поисковую оптимизацию… обратись к стартовому шаблону главной
// страницы Fractera и перенеси его идеи — блок вопросов и ответов, разметку,
// поиск и всё прочее. Именно там оригинальная и экстремально сильная
// архитектура. Одновременно создай все необходимые записи для индексации
// агентами».
//
// 🔒 ПЕРЕНЕСЕНЫ ИДЕИ, А НЕ ФАЙЛЫ, И ЭТО ТОТ ЖЕ ЗАКОН 137. В стартере схемы
// строятся из `APP-CONFIG` гостевого приложения; у памяти такого конфига нет и
// быть не должно — она обязана работать, когда проекта на 3000 нет вовсе.
// Поэтому здесь те же СХЕМЫ и тот же порядок, но источник другой: адрес берётся
// из запроса, слова — из словаря страницы.
//
// 🔒 АДРЕС ВЫВОДИТСЯ ИЗ ХОСТА, А НЕ ПИШЕТСЯ КОНСТАНТОЙ. Канонический адрес,
// указывающий на чужой домен, — не опечатка, а склейка страниц клиента со
// страницами платформы в глазах поисковика. ✗ и это уже стояло в раскладке:
// `metadataBase: https://chat.vercel.ai`, хвост вендоренного чата.

/** Языки службы. Список здесь единственный — второй разошёлся бы молча. */
export const SEO_LANGS = ["ru", "en"] as const;

/** Язык по умолчанию для `x-default`. */
export const SEO_DEFAULT_LANG = "en";

/**
 * Внешняя ссылка на проект Fractera — ровно одна на страницу.
 *
 * 🎯 СЛОВО ВЛАДЕЛЬЦА: «эти страницы будут попадать каждому пользователю, нужно
 * поставить одну внешнюю ссылку на проект Fractera».
 * 🔒 ОДНА, И ЭТО ЧИСЛО: ссылка, повторённая в каждом разделе, читается машиной
 * как навязчивая перелинковка, а человеком — как реклама. Одна на странице, в
 * подвале смысла, плюс её же машинное упоминание в разметке `isPartOf`.
 */
export const FRACTERA_PROJECT_URL = "https://github.com/Fractera/Agentic-Engineering-Infrastructure";

/** Адрес этого экземпляра службы — тот, по которому пришёл человек. */
export async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://127.0.0.1:3700";
}

/** Канонический адрес страницы языка. */
export function urlFor(base: string, lang: string, subPath = ""): string {
  return `${base}/${lang}${subPath}`;
}

/**
 * Ссылки на переводы.
 *
 * 🔒 `x-default` ОБЯЗАТЕЛЕН И УКАЗЫВАЕТ НА ОДИН ИЗ ЯЗЫКОВ, А НЕ НА КОРЕНЬ:
 * корень службы отдаёт перенаправление по языку браузера, и канонический адрес,
 * указывающий на перенаправление, — это страница, отказывающаяся индексироваться
 * собой.
 */
export function languageAlternates(base: string, subPath = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of SEO_LANGS) out[l] = urlFor(base, l, subPath);
  out["x-default"] = urlFor(base, SEO_DEFAULT_LANG, subPath);
  return out;
}

type Schema = Record<string, unknown>;

/**
 * Что это за вещь — для машины.
 *
 * 🔒 `SoftwareApplication`, А НЕ `Organization`: страница описывает программу,
 * которую ставят на свой сервер, и именно этот тип несёт цену, лицензию и
 * требования. Организация здесь вторична и приезжает отдельной схемой.
 */
export function softwareSchema({
  base,
  description,
  lang,
  name,
}: {
  base: string;
  description: string;
  lang: string;
  name: string;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "AI memory engine",
    description,
    inLanguage: lang,
    isAccessibleForFree: true,
    license: FRACTERA_PROJECT_URL,
    name,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    operatingSystem: "Linux",
    softwareRequirements: "Node.js, a self-hosted server",
    url: urlFor(base, lang),
    // 🔒 СВЯЗЬ С ПРОЕКТОМ ОБЪЯВЛЕНА МАШИНЕ ТОЖЕ: человек видит ссылку в подвале,
    // машина — это поле. Два адресата одного факта, и ни одной второй правды.
    isPartOf: { "@type": "SoftwareSourceCode", codeRepository: FRACTERA_PROJECT_URL, name: "Fractera" },
  };
}

export function webSiteSchema({
  base,
  description,
  lang,
  name,
}: {
  base: string;
  description: string;
  lang: string;
  name: string;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description,
    inLanguage: lang,
    name,
    url: urlFor(base, lang),
  };
}

/**
 * Вопросы и ответы — та самая идея стартера, ради которой раздел и заведён.
 *
 * 🔒 РАЗМЕТКА СТРОИТСЯ ИЗ ТЕХ ЖЕ СТРОК, ЧТО ВИДИТ ЧЕЛОВЕК. Вторая копия вопросов
 * «для поисковика» разошлась бы с видимой на первой правке — и это ровно тот
 * случай, за который поисковик наказывает: разметка, не совпадающая с текстом
 * страницы.
 */
export function faqSchema(items: Array<{ a: string; q: string }>): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer", text: i.a },
      name: i.q,
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((i, n) => ({
      "@type": "ListItem",
      item: i.url,
      name: i.name,
      position: n + 1,
    })),
  };
}
