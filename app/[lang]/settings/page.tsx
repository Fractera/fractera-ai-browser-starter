import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Suspense } from "react";
import { headers } from "next/headers";
import { KeyRound } from "lucide-react";
import { publicServiceUrl } from "@/lib/fractera/auth-url";
import { PageCrumbs } from "@/components/nav/page-crumbs.server";
import { Eyebrow, H1, Lead } from "@/components/ui/typography";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PassportBody } from "./_components/passport-body.client";
import { ApiDoc } from "./_components/api-doc";
import { ApiKeyCard } from "./_components/api-key.client";
import { ReadTestBench } from "./_components/read-test.client";
import { SettingsCard } from "./_components/settings-card";
import { browserUi } from "./_i18n/browser.i18n";
import { passportOutline } from "./_lib/passport-outline";
import { hrefOfSection, resolveSection, SECTIONS } from "./_lib/sections";

// СТРАНИЦА СЛУЖБЫ ИИ-БРАУЗЕРА (196-2) — СКОПИРОВАНА СО СТРАНИЦЫ НАСТРОЕК СЛУЖБЫ ПАМЯТИ.
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-13: «полностью скопируешь memory и уберешь лишнее». Раскладка та же — крошки, шапка,
// `WorkspaceShell` с меню разделов, паспорт с липким оглавлением, страница API, карточка ключа; убраны стенды памяти,
// журнал, подписки моделей и терминал.
// 🔒 ПАСПОРТ ЧИТАЕТСЯ С ДИСКА НА КАЖДЫЙ ЗАПРОС и только при открытом разделе — тот же приём, что у памяти.
// 🔒 АДРЕС СЛУЖБЫ ДЛЯ ПРИМЕРОВ API — ИЗ ЗАПРОСА, а не из константы: на другом сервере страница покажет его домен.

const LANGS = ["ru", "en"] as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function BrowserSettingsPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BrowserSettingsBody {...props} />
    </Suspense>
  );
}

async function BrowserSettingsBody({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  const active = resolveSection(typeof sp.section === "string" ? sp.section : undefined);
  const ui = browserUi(lang);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";

  let passport = "";
  if (active === "passport") {
    try {
      passport = await readFile(join(process.cwd(), "development-docs", "PASSPORT.md"), "utf8");
    } catch {
      passport = "";
    }
  }
  const passportTabs = passportOutline(passport).map((i) => ({ active: false, href: `#${i.id}`, label: i.title }));

  return (
    <main className="min-h-screen bg-background">
      <div className="px-6 py-[var(--page-py-work)]" data-app-column>
        <div className="flex flex-col gap-4">
          <PageCrumbs
            trail={[
              { href: `/${lang}`, label: ui.layer },
              { href: hrefOfSection(lang, "passport"), label: ui.title },
              { label: ui.pages[active].title },
            ]}
          />
          <header className="flex flex-col gap-4 border-border border-b pb-8">
            <Eyebrow>{ui.layer}</Eyebrow>
            <H1>{ui.title}</H1>
            <Lead className="max-w-3xl">{ui.subtitle}</Lead>
          </header>
        </div>

        <WorkspaceShell
          id="ai-browser"
          lead={ui.pages[active].hint}
          menu={SECTIONS.map((id) => ({ active: id === active, href: hrefOfSection(lang, id), label: ui.pages[id].title }))}
          menuTitle={ui.menuTitle}
          menuWord={ui.menuWord}
          tabs={active === "passport" ? passportTabs : undefined}
          title={ui.pages[active].title}
        >
          <div className="space-y-6">
            {active === "passport" &&
              (passport ? (
                <PassportBody text={passport} />
              ) : (
                <p className="text-[length:var(--fs-small)] text-muted-foreground">{ui.passportMissing}</p>
              ))}

            {active === "api" && <ApiDoc base={publicServiceUrl(host, proto)} keyWords={ui.apiKey} lang={lang} />}

            {active === "read-test" && <ReadTestBench words={ui.readTest} />}

            {active === "settings" && (
              <SettingsCard icon={<KeyRound className="size-4 text-muted-foreground" />} open title={ui.apiKey.title}>
                <ApiKeyCard words={ui.apiKey} />
              </SettingsCard>
            )}
          </div>
        </WorkspaceShell>
      </div>
    </main>
  );
}
