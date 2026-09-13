import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Suspense } from "react";
import { PassportBody } from "../settings/_components/passport-body.client";
import { browserUi } from "../settings/_i18n/browser.i18n";
import { languageAlternates, origin, urlFor } from "@/lib/seo";

// ПУБЛИЧНЫЙ ПАСПОРТ СЛУЖБЫ ИИ-БРАУЗЕРА — копия паспорта службы памяти (196-2).
// 🔒 У паспорта свой заголовок и своё описание, а не заимствованные у главной: одинаковый `title` поисковик считает дублем.

const LANGS = ["ru", "en"] as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const ui = browserUi(lang);
  const base = await origin();
  const url = urlFor(base, lang, "/passport");
  const title = `${ui.pages.passport.title} — Fractera AI Browser`;
  return {
    alternates: { canonical: url, languages: languageAlternates(base, "/passport") },
    description: ui.subtitle,
    metadataBase: new URL(base),
    openGraph: { description: ui.subtitle, locale: lang, siteName: "Fractera AI Browser", title, type: "article", url },
    robots: { follow: true, index: true },
    title,
  };
}

export default function BrowserPassport(props: { params: Promise<{ lang: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BrowserPassportBody {...props} />
    </Suspense>
  );
}

async function BrowserPassportBody({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const ui = browserUi(lang);
  let passport = "";
  try {
    passport = await readFile(join(process.cwd(), "development-docs", "PASSPORT.md"), "utf8");
  } catch {
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
