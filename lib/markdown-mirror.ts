import { landingWords } from "@/app/[lang]/_i18n/landing.i18n";
import { FRACTERA_PROJECT_URL, urlFor } from "./seo";

// MARKDOWN-ЗЕРКАЛО ГЛАВНОЙ (186-3 памяти, переписано под браузер в 196-5).
//
// 🔒 ЗАЧЕМ ЗЕРКАЛО, ЕСЛИ АГЕНТ УМЕЕТ ЧИТАТЬ HTML: умеет — и платит ходами модели за разметку, стили и данные гидратации.
// Зеркало отдаёт ТО ЖЕ содержимое без единого тега.
// 🔒 ИСТОЧНИК ОДИН СО СТРАНИЦЕЙ — СЛОВАРЬ. Вторая редакция «для машин» разошлась бы с видимой на первой правке.

/** Полный текст главной в Markdown — всё, что видит человек, в том же порядке. */
export function buildLandingMarkdown(base: string, lang: string): string {
  const w = landingWords(lang);
  const parts: string[] = [];

  parts.push(`# ${w.hero.title}`, "", `> ${w.hero.eyebrow}`, "", w.hero.lead, "", w.hero.body, "");
  parts.push(w.hero.badges.map((b) => `- ${b}`).join("\n"), "");
  parts.push(`- [${w.hero.primary}](${urlFor(base, lang, "/settings?section=api")})`);
  parts.push(`- [${w.hero.secondary}](${urlFor(base, lang, "/passport")})`, "");

  parts.push(`## ${w.problem.title}`, "", w.problem.lead, "", w.problem.body, "");

  parts.push(`## ${w.flow.title}`, "", w.flow.lead, "");
  w.flow.steps.forEach((s, i) => parts.push(`${i + 1}. **${s.title}.** ${s.body}`));
  parts.push("");

  const cards = (title: string, lead: string, items: Array<{ body: string; title: string }>) => {
    parts.push(`## ${title}`, "");
    if (lead) parts.push(lead, "");
    for (const i of items) parts.push(`- **${i.title}.** ${i.body}`);
    parts.push("");
  };

  cards(w.returns.title, w.returns.lead, w.returns.items);
  cards(w.security.title, w.security.lead, w.security.items);
  cards(w.youtube.title, w.youtube.lead, w.youtube.items);

  parts.push(`## ${w.bench.title}`, "", w.bench.lead, "");
  for (const i of w.bench.items) parts.push(`- ${i}`);
  parts.push("", `\`${w.bench.where}\``, "");

  parts.push(`## ${w.api.title}`, "", w.api.lead, "");
  for (const s of w.api.samples) parts.push(`### ${s.title}`, "", "```bash", s.code, "```", "");

  parts.push(`## ${w.limits.title}`, "", w.limits.lead, "");
  parts.push(`| ${w.limits.head.what} | ${w.limits.head.value} |`, "|---|---|");
  for (const r of w.limits.rows) parts.push(`| ${r.what} | ${r.value} |`);
  parts.push("");

  parts.push(`## ${w.install.title}`, "", w.install.lead, "", w.install.body, "");

  cards(w.principles.title, "", w.principles.items);

  parts.push(`## ${w.faq.title}`, "", w.faq.lead, "");
  for (const i of w.faq.items) parts.push(`### ${i.q}`, "", i.a, "");

  parts.push(`## ${w.project.label}`, "", w.project.body, "", `- ${FRACTERA_PROJECT_URL}`, "");

  // 🔒 ЗЕРКАЛО НАЗЫВАЕТ СВОЙ ОРИГИНАЛ: агент процитирует человеческий адрес, а не `.md`.
  parts.push("---", "", `Source page: ${urlFor(base, lang)}`, "");

  return parts.join("\n");
}
