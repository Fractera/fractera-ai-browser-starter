import { landingWords } from "@/app/[lang]/_i18n/landing.i18n";
import { FRACTERA_PROJECT_URL, SEO_LANGS, urlFor } from "./seo";

// КАРТА ДЛЯ АГЕНТОВ — `llms.txt` (186-2).
//
// 🎯 ТРЕБОВАНИЕ ВЛАДЕЛЬЦА 2026-09-11: «одновременно создай все необходимые
// записи для индексации агентами». Идея перенесена из главной стартера, где
// такая карта уже живёт (`lib/aio/llms.ts`).
//
// 🔒 ЗАЧЕМ ОНА, ЕСЛИ ЕСТЬ HTML. Агент, пришедший за фактами, платит за разбор
// разметки ходами модели. Карта отдаёт ему то же самое простым текстом: что это
// за служба, что она умеет, где договор и где машинный манифест. Это дешевле
// для него и точнее для нас — мы сами выбираем, что он прочитает первым.
//
// 🔒 ТЕКСТ ПОРОЖДАЕТСЯ ИЗ ТОГО ЖЕ СЛОВАРЯ, ЧТО И СТРАНИЦА. Вторая, «специально
// для машин», редакция описания разошлась бы с видимой на первой правке — и
// именно это расхождение поисковик считает обманом.

/** Карта одного языка: короткая, ссылками, без разметки. */
export function buildLlmsTxt(base: string, lang: string): string {
  const w = landingWords(lang);
  const page = urlFor(base, lang);

  const faq = w.faq.items.map((i) => `- ${i.q}\n  ${i.a}`).join("\n");
  const ladder = w.ladder.rows.map((r) => `- ${r.level}: ${r.how} — ${r.cost} (${r.by})`).join("\n");

  return `# Fractera Memory

> ${w.seo.description}

${w.hero.lead}

## Pages
- [${w.hero.title}](${page}): the landing page of this instance
- [Passport](${urlFor(base, lang, "/passport")}): the full design document, public
- [API reference](${urlFor(base, lang, "/settings?section=api")}): generated from the live contract
- [This page in Markdown](${urlFor(base, lang, "/index.md")}): the whole landing as plain text, no markup
- [Passport in Markdown](${urlFor(base, lang, "/passport/index.md")}): the design document as it is written
- [Machine contract](${base}/v1/contract): the authoritative machine-readable interface
- [Health](${base}/v1/health): liveness, contract version, name-quality figure
- [Capability manifest](https://github.com/Fractera/fractera-memory-starter/blob/main/capabilities.json)

## What it is
${w.problem.body}

## Cost ladder
${ladder}

## Storage tiers
${w.stores.items.map((i) => `- ${i.title}: ${i.body}`).join("\n")}

## Multimodal input
${w.media.items.map((i) => `- ${i.title}: ${i.body}`).join("\n")}

## Spatial-temporal scope
${w.scope.items.map((i) => `- ${i.title}: ${i.body}`).join("\n")}

## Skill evolution
${w.evolution.lead}
${w.evolution.items.map((i) => `- ${i.title}: ${i.body}`).join("\n")}

## Questions and answers
${faq}

## Installation
${w.install.body}

## Project
${w.project.body}
- ${FRACTERA_PROJECT_URL}
`;
}

/** Карта корня: перечисляет языковые карты, чтобы агент не угадывал язык. */
export function buildRootLlmsTxt(base: string): string {
  return `# Fractera Memory

> Self-hosted memory engine for AI agents. One REST API, open source.

## Language maps
${SEO_LANGS.map((l) => `- [${l}](${base}/${l}/llms.txt)`).join("\n")}

## Machine interfaces
- [Contract](${base}/v1/contract)
- [Health](${base}/v1/health)

## Project
- ${FRACTERA_PROJECT_URL}
`;
}
