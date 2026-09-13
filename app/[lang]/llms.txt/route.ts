import { buildLlmsTxt } from "@/lib/llms";
import { origin, SEO_LANGS } from "@/lib/seo";

// `/{язык}/llms.txt` — та же карта на языке раздела (186-2).
//
// 🔒 ПО КАРТЕ НА ЯЗЫК, ПОТОМУ ЧТО КАРТА ПЕРЕЧИСЛЯЕТ АДРЕСА, А ОНИ У КАЖДОГО
// ЯЗЫКА СВОИ. Текст при этом порождается из того же словаря, что и страница:
// вторая редакция «для машин» разошлась бы с видимой на первой правке.

export function generateStaticParams() {
  return SEO_LANGS.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const base = await origin();
  return new Response(buildLlmsTxt(base, lang), {
    headers: { "Cache-Control": "public, max-age=3600", "Content-Type": "text/plain; charset=utf-8" },
  });
}
