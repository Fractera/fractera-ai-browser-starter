import { landingWords } from "@/app/[lang]/_i18n/landing.i18n";
import { FRACTERA_PROJECT_URL, urlFor } from "./seo";

// MARKDOWN-ЗЕРКАЛО СТРАНИЦЫ (186-3).
//
// 🎯 ВОПРОС ВЛАДЕЛЬЦА 2026-09-11: «агент может прочитать всё содержимое? там
// есть Markdown-зеркало?» На тот момент — нет, и это было честным ответом.
// Идея перенесена с главной стартера, где зеркало живёт по спецификации
// llmstxt.org: markdown-версия лежит рядом со страницей, а для адреса-каталога
// добавляется `index.md`.
//
// 🔒 ЗАЧЕМ ЗЕРКАЛО, ЕСЛИ АГЕНТ УМЕЕТ ЧИТАТЬ HTML. Умеет — и платит за это
// ходами модели: разметка, стили, скрипты и данные гидратации занимают в разы
// больше знаков, чем сам текст. Зеркало отдаёт ТО ЖЕ содержимое без единого
// тега, и агент получает всю страницу целиком, а не её краткую карту.
//
// 🔒 ИСТОЧНИК ОДИН СО СТРАНИЦЕЙ — СЛОВАРЬ. Вторая редакция «для машин»
// разошлась бы с видимой на первой правке, а расхождение зеркала с оригиналом
// поисковик читает как обман, и правильно делает.

/** Полный текст лендинга в Markdown — всё, что видит человек. */
export function buildLandingMarkdown(base: string, lang: string): string {
  const w = landingWords(lang);
  const L = (s: string) => s;

  const parts: string[] = [];

  parts.push(`# ${w.hero.title}`);
  parts.push("");
  parts.push(`> ${w.hero.eyebrow}`);
  parts.push("");
  parts.push(w.hero.lead);
  parts.push("");
  parts.push(w.hero.body);
  parts.push("");
  parts.push(w.hero.badges.map((b) => `- ${b}`).join("\n"));
  parts.push("");
  parts.push(`- [${w.hero.primary}](${urlFor(base, lang, "/settings?section=api")})`);
  parts.push(`- [${w.hero.secondary}](${urlFor(base, lang, "/passport")})`);
  parts.push("");

  parts.push(`## ${w.problem.title}`, "", w.problem.lead, "", w.problem.body, "");

  parts.push(`## ${w.router.title}`, "", w.router.lead, "");
  parts.push(`1. ${w.router.inbox}`);
  parts.push(`2. ${w.router.routerBox}`);
  parts.push(`3. ${w.router.cheapBranch} — ${w.router.cheapCost}`);
  parts.push(`4. ${w.router.deepBranch} — ${w.router.deepCost}`);
  parts.push("");

  parts.push(`## ${w.schema.title}`, "", w.schema.body, "");

  parts.push(`## ${w.ladder.title}`, "", w.ladder.lead, "");
  parts.push(
    `| ${w.ladder.head.level} | ${w.ladder.head.how} | ${w.ladder.head.cost} | ${w.ladder.head.by} |`
  );
  parts.push("|---|---|---|---|");
  for (const r of w.ladder.rows) parts.push(`| ${r.level} | ${r.how} | ${r.cost} | ${r.by} |`);
  parts.push("", `*${w.ladder.example}*`, "");

  const cards = (title: string, lead: string, items: Array<{ body: string; title: string }>) => {
    parts.push(`## ${title}`, "", lead, "");
    for (const i of items) parts.push(`- **${i.title}.** ${i.body}`);
    parts.push("");
  };

  cards(w.scope.title, w.scope.lead, w.scope.items);

  parts.push(`## ${w.artifacts.title}`, "", w.artifacts.lead, "");
  w.artifacts.steps.forEach((s, i) => parts.push(`${i + 1}. ${s}`));
  parts.push("");

  parts.push(`## ${w.memoization.title}`, "", w.memoization.lead, "");
  w.memoization.chain.forEach((s, i) => parts.push(`${i + 1}. ${s}`));
  parts.push("");

  cards(w.evolution.title, w.evolution.lead, w.evolution.items);
  cards(w.stores.title, w.stores.lead, w.stores.items);
  cards(w.media.title, w.media.lead, w.media.items);

  parts.push(`## ${w.bench.title}`, "", w.bench.lead, "");
  for (const i of w.bench.items) parts.push(`- ${i}`);
  parts.push("", `\`${w.bench.where}\``, "");

  // 🔒 ТАБЛИЦЫ СРАВНЕНИЯ ПОРОЖДАЮТСЯ ТЕМ ЖЕ ПРОХОДОМ, ЧТО НА ЭКРАНЕ: число
  // соперников приходит данными, и зеркало его не знает заранее.
  parts.push(`## ${w.comparison.title}`, "", w.comparison.lead, "");
  for (const t of w.comparison.tables) {
    parts.push(`### ${t.title}`, "");
    parts.push(`| ${w.comparison.feature} | ${w.comparison.ours} | ${t.rivals.join(" | ")} |`);
    parts.push(`|${"---|".repeat(t.rivals.length + 2)}`);
    for (const row of t.rows) {
      parts.push(`| ${row.feature} | ${row.ours} | ${row.rivals.join(" | ")} |`);
    }
    parts.push("");
  }

  parts.push(`## ${w.api.title}`, "", w.api.lead, "");
  for (const s of w.api.samples) {
    parts.push(`### ${s.title}`, "", "```bash", s.code, "```", "");
  }

  parts.push(`## ${w.install.title}`, "", w.install.lead, "", w.install.body, "");

  cards(w.principles.title, "", w.principles.items);

  parts.push(`## ${w.faq.title}`, "", w.faq.lead, "");
  for (const i of w.faq.items) parts.push(`### ${i.q}`, "", i.a, "");

  parts.push(`## ${w.project.label}`, "", w.project.body, "", `- ${FRACTERA_PROJECT_URL}`, "");

  // 🔒 ЗЕРКАЛО НАЗЫВАЕТ СВОЙ ОРИГИНАЛ. Агент, пришедший сюда по ссылке, должен
  // знать человеческий адрес страницы — иначе он процитирует `.md`, и человек
  // по этой ссылке увидит простыню текста вместо страницы.
  parts.push("---", "", `Source page: ${urlFor(base, lang)}`, "");

  return L(parts.join("\n"));
}
