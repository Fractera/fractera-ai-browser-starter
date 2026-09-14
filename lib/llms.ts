import { landingWords } from "@/app/[lang]/_i18n/landing.i18n";
import { FRACTERA_PROJECT_URL, SEO_LANGS, urlFor } from "./seo";

// КАРТА ДЛЯ АГЕНТОВ — `llms.txt` (186-2 памяти, переписано под браузер в 196-5).
//
// 🔒 ТЕКСТ ПОРОЖДАЕТСЯ ИЗ ТОГО ЖЕ СЛОВАРЯ, ЧТО И СТРАНИЦА: вторая редакция «для машин» разошлась бы с видимой.

/** Карта одного языка: короткая, ссылками, без разметки. */
export function buildLlmsTxt(base: string, lang: string): string {
  const w = landingWords(lang);
  const page = urlFor(base, lang);
  const list = (items: Array<{ body: string; title: string }>) => items.map((i) => `- ${i.title}: ${i.body}`).join("\n");

  return `# Fractera AI Browser

> ${w.seo.description}

${w.hero.lead}

## Pages
- [${w.hero.title}](${page}): the home page of this instance
- [Passport](${urlFor(base, lang, "/passport")}): the service design document, public
- [API reference](${urlFor(base, lang, "/settings?section=api")}): generated from the live contract
- [This page in Markdown](${urlFor(base, lang, "/index.md")}): the whole home page as plain text
- [Passport in Markdown](${urlFor(base, lang, "/passport/index.md")}): the design document as it is written
- [Machine contract](${base}/v1/contract): the authoritative machine-readable interface
- [Health](${base}/v1/health): liveness, contract version, browser engine state

## What it solves
${w.problem.lead}
${w.problem.body}

## How a request travels
${w.flow.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`).join("\n")}

## What comes back
${list(w.returns.items)}

## Nothing inside the machine is reachable
${list(w.security.items)}

## YouTube
${list(w.youtube.items)}

## Limits
${w.limits.rows.map((r) => `- ${r.what}: ${r.value}`).join("\n")}

## Questions and answers
${w.faq.items.map((i) => `- ${i.q}\n  ${i.a}`).join("\n")}

## Installation
${w.install.body}

## Project
${w.project.body}
- ${FRACTERA_PROJECT_URL}
`;
}

/** Карта корня: перечисляет языковые карты, чтобы агент не угадывал язык. */
export function buildRootLlmsTxt(base: string): string {
  return `# Fractera AI Browser

> Self-hosted real browser for AI agents and services. One REST API, open source.

## Language maps
${SEO_LANGS.map((l) => `- [${l}](${base}/${l}/llms.txt)`).join("\n")}

## Machine interfaces
- [Contract](${base}/v1/contract)
- [Health](${base}/v1/health)

## Project
- ${FRACTERA_PROJECT_URL}
`;
}
