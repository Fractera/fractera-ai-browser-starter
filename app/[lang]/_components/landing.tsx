import Link from "next/link";
import { Eyebrow, H1, Lead } from "@/components/ui/typography";
import { landingWords } from "../_i18n/landing.i18n";
import { LandingToc } from "./landing-toc";
import { breadcrumbSchema, faqSchema, FRACTERA_PROJECT_URL, softwareSchema, urlFor, webSiteSchema } from "@/lib/seo";

// ПУБЛИЧНАЯ ГЛАВНАЯ СЛУЖБЫ ИИ-БРАУЗЕРА (196-5).
//
// 🪦 СКОПИРОВАНА С ГЛАВНОЙ ПАМЯТИ (186) по слову владельца 2026-09-13: «полностью скопируешь memory и уберешь лишнее».
// Анатомия та же — надзаголовок, H1, лид, карточки, таблица, код, вопросы на `<details>`, одна внешняя ссылка; разделы
// памяти (лестница цены, хранилища, эволюция, сравнения) сняты вместе со словами.
//
// 🔒 ВСЕ СЛОВА ПРИХОДЯТ ИЗ СЛОВАРЯ, В ЭТОМ ФАЙЛЕ НЕТ НИ ОДНОЙ ФРАЗЫ. Страница говорит на одном языке — том, который выбрал
// человек; до 82 языков это растёт веткой словаря.
// 🛑 ЗДЕСЬ НЕТ КОМАНД УСТАНОВКИ — закон главной памяти: команда на странице устаревает молча, установку делает робот.

const NAME = "Fractera AI Browser";

function Section({
  children,
  id,
  lead,
  title,
}: {
  children?: React.ReactNode;
  id: string;
  lead?: string;
  title: string;
}) {
  return (
    // `scroll-mt-16`: шапка липкая и высотой `h-14` — без отступа заголовок раздела останавливался бы под ней.
    <section className="scroll-mt-16 border-border border-t py-12 first:border-t-0" id={id}>
      <div className="mx-auto w-full max-w-5xl px-6">
        <h2 className="text-[length:var(--fs-h2)] font-semibold tracking-tight">{title}</h2>
        {lead ? <p className="mt-3 max-w-3xl text-[length:var(--fs-body)] text-muted-foreground">{lead}</p> : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}

function Card({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-lg border border-muted-foreground/25 p-4">
      <div className="text-[length:var(--fs-body)] font-medium">{title}</div>
      <p className="mt-2 text-[length:var(--fs-small)] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre rounded-md bg-muted px-3 py-3 font-mono text-[length:var(--fs-small)] leading-relaxed">
      {children}
    </pre>
  );
}

export function Landing({ base, lang }: { base: string; lang: string }) {
  const w = landingWords(lang);

  // 🔒 РАЗМЕТКА СТРОИТСЯ ИЗ ТЕХ ЖЕ СТРОК, ЧТО ВИДИТ ЧЕЛОВЕК: вторая копия «для поисковика» разошлась бы с видимой.
  const schemas = [
    softwareSchema({ base, description: w.seo.description, lang, name: NAME }),
    webSiteSchema({ base, description: w.seo.description, lang, name: NAME }),
    faqSchema(w.faq.items),
    breadcrumbSchema([
      { name: NAME, url: urlFor(base, lang) },
      { name: w.cta.primary, url: urlFor(base, lang, "/passport") },
    ]),
  ];

  return (
    <main className="min-h-screen bg-background">
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        type="application/ld+json"
      />
      {/* ── ПЕРВЫЙ ЭКРАН: надзаголовок → H1 → лид → тело → метки → действия. H1 на странице ровно один. */}
      <section className="px-6 pt-12 pb-10">
        <div className="mx-auto w-full max-w-5xl">
          <Eyebrow>{w.hero.eyebrow}</Eyebrow>
          <H1 className="mt-4 max-w-4xl">{w.hero.title}</H1>
          <Lead className="mt-5 max-w-3xl">{w.hero.lead}</Lead>
          <p className="mt-4 max-w-3xl text-[length:var(--fs-small)] leading-relaxed text-muted-foreground">
            {w.hero.body}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {w.hero.badges.map((b) => (
              <li
                className="rounded-full border border-muted-foreground/30 px-3 py-1 text-[length:var(--fs-small)]"
                key={b}
              >
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-primary px-4 py-2 text-[length:var(--fs-small)] font-medium text-primary-foreground hover:opacity-90"
              href={`/${lang}/settings?section=api`}
            >
              {w.hero.primary}
            </Link>
            <Link
              className="rounded-md border border-muted-foreground/30 px-4 py-2 text-[length:var(--fs-small)] font-medium hover:bg-muted"
              href={`/${lang}/passport`}
            >
              {w.hero.secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ── ОГЛАВЛЕНИЕ: порядок и id — ровно те, что у разделов ниже; новый раздел добавляется сюда той же правкой. */}
      <LandingToc
        heading={w.toc.heading}
        items={[
          { id: "concept", text: w.problem.title },
          { id: "flow", text: w.flow.title },
          { id: "returns", text: w.returns.title },
          { id: "security", text: w.security.title },
          { id: "youtube", text: w.youtube.title },
          { id: "bench", text: w.bench.title },
          { id: "api", text: w.api.title },
          { id: "limits", text: w.limits.title },
          { id: "install", text: w.install.title },
          { id: "principles", text: w.principles.title },
          { id: "faq", text: w.faq.title },
          { id: "project", text: w.project.label },
          { id: "cta", text: w.cta.title },
        ]}
        label={w.toc.label}
      />

      <Section id="concept" lead={w.problem.lead} title={w.problem.title}>
        <p className="max-w-3xl text-[length:var(--fs-small)] leading-relaxed">{w.problem.body}</p>
      </Section>

      {/* ── ПУТЬ ЗАПРОСА: вид `flow` каталога в одну колонку ───────────────── */}
      <Section id="flow" lead={w.flow.lead} title={w.flow.title}>
        <ol className="space-y-3">
          {w.flow.steps.map((s, i) => (
            <li className="flex items-start gap-3" key={s.title}>
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30 text-[length:var(--fs-small)]">
                {i + 1}
              </span>
              <span className="text-[length:var(--fs-small)] leading-relaxed">
                <span className="font-medium">{s.title}.</span> {s.body}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="returns" lead={w.returns.lead} title={w.returns.title}>
        <div className="grid gap-3 md:grid-cols-2">
          {w.returns.items.map((i) => (
            <Card body={i.body} key={i.title} title={i.title} />
          ))}
        </div>
      </Section>

      <Section id="security" lead={w.security.lead} title={w.security.title}>
        <div className="grid gap-3 md:grid-cols-3">
          {w.security.items.map((i) => (
            <Card body={i.body} key={i.title} title={i.title} />
          ))}
        </div>
      </Section>

      <Section id="youtube" lead={w.youtube.lead} title={w.youtube.title}>
        <div className="grid gap-3 md:grid-cols-3">
          {w.youtube.items.map((i) => (
            <Card body={i.body} key={i.title} title={i.title} />
          ))}
        </div>
      </Section>

      <Section id="bench" lead={w.bench.lead} title={w.bench.title}>
        <ul className="ml-5 list-disc space-y-2 text-[length:var(--fs-small)] leading-relaxed">
          {w.bench.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[length:var(--fs-small)] text-muted-foreground">{w.bench.where}</p>
      </Section>

      <Section id="api" lead={w.api.lead} title={w.api.title}>
        <div className="space-y-5">
          {w.api.samples.map((s) => (
            <div key={s.title}>
              <div className="mb-2 text-[length:var(--fs-small)] font-medium">{s.title}</div>
              <Code>{s.code}</Code>
            </div>
          ))}
        </div>
      </Section>

      {/* ── ПРЕДЕЛЫ: вид `table` каталога ──────────────────────────────────── */}
      <Section id="limits" lead={w.limits.lead} title={w.limits.title}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[length:var(--fs-small)]">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">{w.limits.head.what}</th>
                <th className="py-2 font-medium">{w.limits.head.value}</th>
              </tr>
            </thead>
            <tbody>
              {w.limits.rows.map((r) => (
                <tr className="border-t border-muted-foreground/15 align-top" key={r.what}>
                  <td className="py-2 pr-4">{r.what}</td>
                  <td className="py-2 font-medium whitespace-nowrap">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="install" lead={w.install.lead} title={w.install.title}>
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
          <p className="max-w-3xl text-[length:var(--fs-small)] leading-relaxed">{w.install.body}</p>
        </div>
      </Section>

      <Section id="principles" title={w.principles.title}>
        <div className="grid gap-3 md:grid-cols-3">
          {w.principles.items.map((i) => (
            <Card body={i.body} key={i.title} title={i.title} />
          ))}
        </div>
      </Section>

      {/* ── ВОПРОСЫ И ОТВЕТЫ: `<details>` — ответ лежит в разметке всегда и читается машиной даже закрытым. */}
      <Section id="faq" lead={w.faq.lead} title={w.faq.title}>
        <div className="divide-y divide-muted-foreground/15 border-y border-muted-foreground/15">
          {w.faq.items.map((i) => (
            <details className="group py-3" key={i.q}>
              <summary className="cursor-pointer list-none text-[length:var(--fs-body)] font-medium marker:content-none">
                <span className="mr-2 inline-block text-muted-foreground transition-transform group-open:rotate-90">
                  ›
                </span>
                {i.q}
              </summary>
              <p className="mt-2 max-w-3xl pl-5 text-[length:var(--fs-small)] leading-relaxed text-muted-foreground">
                {i.a}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* ── ПРОЕКТ: ЕДИНСТВЕННАЯ ВНЕШНЯЯ ССЫЛКА СТРАНИЦЫ (слово владельца, закон главной памяти). */}
      <Section id="project" title={w.project.label}>
        <p className="max-w-3xl text-[length:var(--fs-small)] leading-relaxed">{w.project.body}</p>
        <a
          className="mt-4 inline-block rounded-md border border-muted-foreground/30 px-4 py-2 text-[length:var(--fs-small)] font-medium hover:bg-muted"
          href={FRACTERA_PROJECT_URL}
          rel="noopener"
          target="_blank"
        >
          {w.project.label}
        </a>
      </Section>

      <Section id="cta" title={w.cta.title}>
        <p className="max-w-3xl text-[length:var(--fs-small)] leading-relaxed">{w.cta.body}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-primary px-4 py-2 text-[length:var(--fs-small)] font-medium text-primary-foreground hover:opacity-90"
            href={`/${lang}/passport`}
          >
            {w.cta.primary}
          </Link>
          <Link
            className="rounded-md border border-muted-foreground/30 px-4 py-2 text-[length:var(--fs-small)] font-medium hover:bg-muted"
            href={`/${lang}/settings?section=api`}
          >
            {w.cta.secondary}
          </Link>
        </div>
      </Section>
    </main>
  );
}
