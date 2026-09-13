import { buildLandingMarkdown } from "@/lib/markdown-mirror";
import { origin, SEO_LANGS } from "@/lib/seo";

// `/{язык}/index.md` — markdown-зеркало лендинга (186-3).
//
// 🔒 ФОРМА АДРЕСА ВЗЯТА ИЗ СПЕЦИФИКАЦИИ llmstxt.org и у главной стартера:
// markdown-версия живёт рядом со страницей, а для адреса-каталога добавляется
// `index.md`. Агент, прочитавший `llms.txt`, приходит сюда за полным текстом.
//
// 🔒 ТЕКСТ ПОРОЖДАЕТСЯ ИЗ ТОГО ЖЕ СЛОВАРЯ, ЧТО И СТРАНИЦА: зеркало, написанное
// отдельно, разошлось бы с оригиналом на первой правке.

export function generateStaticParams() {
  return SEO_LANGS.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const base = await origin();
  return new Response(buildLandingMarkdown(base, lang), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
