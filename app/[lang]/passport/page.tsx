import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Suspense } from "react";
import { PassportBody } from "../settings/_components/passport-body.client";
import { memoryUi } from "../settings/_i18n/memory.i18n";
import { landingWords } from "../_i18n/landing.i18n";
import { languageAlternates, origin, urlFor } from "@/lib/seo";

// ПУБЛИЧНЫЙ ПАСПОРТ — СВОЙ АДРЕС `/{язык}/passport` (186).
//
// 🪦 ЭТА СТРАНИЦА БЫЛА КОРНЕМ СЛУЖБЫ (182-3) И ПЕРЕЕХАЛА СЮДА 2026-09-11, когда
// владелец заказал на корень лендинг. Паспорт при этом НЕ ПРОПАЛ и остался
// публичным: ссылка на него стоит в первом экране лендинга и в его завершающем
// призыве. Способность, потерявшая адрес, снаружи неотличима от удалённой.
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-10: «паспорт продублируй на публичную страницу, чтобы
// он был доступен без авторизации. Заменить существующим — дай текст, и всё».
//
// 🔒 ОДИН ДОКУМЕНТ, ДВА ЧИТАТЕЛЯ, НИ ОДНОЙ КОПИИ. Файл `development-docs/PASSPORT.md`
// читают обе страницы — публичная здесь и «Паспорт» за входом; тело рисует один и
// тот же островок. Вторая копия текста разошлась бы с первой на первой же правке,
// и заметил бы это тот, кто читает не ту.
//
// 🔒 ЧИТАЕТСЯ С ДИСКА НА КАЖДЫЙ ЗАПРОС: правка файла видна на следующей загрузке,
// без сборки и без перезапуска.
//
// ✗ ЧТЕНИЕ ФАЙЛА ЖИВЁТ ПОД `<Suspense>`, И ЭТО ОПЛАЧЕНО СБОРКОЙ, А НЕ ВЫВЕДЕНО.
// Первая версия читала документ прямо в теле страницы, и сборка упала:
// «Route "/[lang]": Uncached data was accessed outside of <Suspense>» — под
// `cacheComponents` этого требует уже сама раскладка. 🛑 Хуже отказа была его цена:
// собранного дерева не осталось, и служба ответила `502` до починки. Тот же закон
// уже записан у соседних страниц этого репозитория — я его знал и не применил.
//
// 🛑 ЗДЕСЬ НЕТ НИ КНОПОК, НИ ССЫЛОК НА СЛУЖЕБНОЕ. Вход и аккаунт живут в шапке —
// тот же довод, что у чата (156-2): вторая пара кнопок спорила бы с шапкой за то,
// какая из них правда.
//
// 🛑 `dynamic`/`runtime` НЕ ОБЪЯВЛЯЮТСЯ: у шаблона включён `cacheComponents`.

const LANGS = ["ru", "en"] as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/**
 * Мета-теги паспорта (186-2).
 *
 * 🔒 У ПАСПОРТА СВОЙ ЗАГОЛОВОК И СВОЁ ОПИСАНИЕ, А НЕ ЗАИМСТВОВАННЫЕ У ЛЕНДИНГА.
 * Две страницы с одинаковым `title` поисковик считает дублем и оставляет в
 * выдаче одну — обычно не ту, что нужна.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const w = landingWords(lang);
  const base = await origin();
  const url = urlFor(base, lang, "/passport");
  const title = `${w.cta.primary} — Fractera Memory`;

  return {
    alternates: { canonical: url, languages: languageAlternates(base, "/passport") },
    description: w.cta.body,
    metadataBase: new URL(base),
    openGraph: {
      description: w.cta.body,
      locale: lang,
      siteName: "Fractera Memory",
      title,
      type: "article",
      url,
    },
    robots: { follow: true, index: true },
    title,
  };
}

export default function MemoryPassport(props: { params: Promise<{ lang: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MemoryPassportBody {...props} />
    </Suspense>
  );
}

async function MemoryPassportBody({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const ui = memoryUi(lang);

  let passport = "";
  try {
    passport = await readFile(join(process.cwd(), "development-docs", "PASSPORT.md"), "utf8");
  } catch {
    // Файла нет — страница скажет это словами, а не покажет пустоту.
    passport = "";
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16" data-public-passport>
      {passport ? (
        <PassportBody text={passport} />
      ) : (
        <>
          <h1 className="font-semibold text-[length:var(--fs-h1)]">{ui.title}</h1>
          <p className="text-muted-foreground">{ui.passportMissing}</p>
        </>
      )}
    </main>
  );
}
