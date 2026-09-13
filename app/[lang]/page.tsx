import type { Metadata } from "next";
import { Suspense } from "react";
import { Landing } from "./_components/landing";
import { landingWords } from "./_i18n/landing.i18n";
import { languageAlternates, origin, urlFor } from "@/lib/seo";

// КОРНЕВАЯ СТРАНИЦА СЛУЖБЫ ПАМЯТИ — ЛЕНДИНГ (186).
//
// 🎯 ЗАКАЗ ВЛАДЕЛЬЦА 2026-09-11: «нужно сгенерировать корневую страницу памяти»
// по двум присланным текстам, видами из каталога блоков.
//
// 🪦 ДО ЭТОГО КОРЕНЬ ПОКАЗЫВАЛ ПАСПОРТ (182-3). Паспорт не удалён и не спрятан:
// он живёт на `/{язык}/passport`, и лендинг ведёт туда дважды — из первого
// экрана и из завершающего призыва. Документ, потерявший адрес, снаружи
// неотличим от удалённого.
//
// 🔒 СТРАНИЦА НЕ ЧИТАЕТ НИ ФАЙЛОВ, НИ ЗАГОЛОВКОВ — только словарь, поэтому
// `<Suspense>` ей не нужен: под `cacheComponents` его требует обращение к
// запросу, а его здесь нет. Соседние страницы обёрнуты именно потому, что
// читают диск или заголовки.
//
// 🛑 `dynamic`/`runtime` НЕ ОБЪЯВЛЯЮТСЯ: у шаблона включён `cacheComponents`.

const LANGS = ["ru", "en"] as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/**
 * Мета-теги страницы (186-2).
 *
 * 🔒 КАНОНИЧЕСКИЙ АДРЕС И ПЕРЕВОДЫ СЧИТАЮТСЯ ОТ ХОСТА ЗАПРОСА. Константа здесь
 * означала бы, что каждый экземпляр службы объявляет себя чужим доменом — для
 * поисковика это не опечатка, а склейка страниц клиента со страницами платформы.
 * 🔒 `x-default` УКАЗЫВАЕТ НА ЯЗЫК, А НЕ НА КОРЕНЬ: корень отдаёт
 * перенаправление, а канонический адрес, ведущий на перенаправление, — это
 * страница, отказывающаяся индексироваться собой.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const w = landingWords(lang);
  const base = await origin();
  const url = urlFor(base, lang);

  return {
    // 🔒 ЗЕРКАЛО ОБЪЯВЛЕНО В МЕТЕ, А НЕ ТОЛЬКО В КАРТЕ (186-3): агент, пришедший
    // на страницу напрямую, находит markdown-версию прямо в её заголовке и не
    // платит ходами за разбор разметки.
    alternates: {
      canonical: url,
      languages: languageAlternates(base),
      types: { "text/markdown": `${url}/index.md` },
    },
    description: w.seo.description,
    metadataBase: new URL(base),
    openGraph: {
      description: w.seo.description,
      locale: lang,
      siteName: "Fractera Memory",
      title: w.seo.title,
      type: "website",
      url,
    },
    robots: { follow: true, index: true },
    title: w.seo.title,
    twitter: { card: "summary_large_image", description: w.seo.description, title: w.seo.title },
  };
}

// ✗ ГРАНИЦА ОЖИДАНИЯ ЗДЕСЬ ОПЛАЧЕНА СБОРКОЙ, И ЭТО ТРЕТИЙ РАЗ ЗА ДЕНЬ.
// Страница читает заголовки запроса — адрес экземпляра нужен и разметке, и
// каноническому адресу, — а под `cacheComponents` обращение к запросу живёт
// только под `<Suspense>`. Первая версия читала их в теле: «Error occurred
// prerendering page /ru», и сборка не дала дерева вовсе.
// 🔒 ПРАВИЛО ШИРЕ СЛУЧАЯ: приём, скопированный с соседней страницы, приносит с
// собой и условие, при котором сосед его применяет. У настроек тело уже под
// Suspense, поэтому там это незаметно.
export default function MemoryHome(props: { params: Promise<{ lang: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MemoryHomeBody {...props} />
    </Suspense>
  );
}

async function MemoryHomeBody({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const base = await origin();
  return <Landing base={base} lang={lang} />;
}
