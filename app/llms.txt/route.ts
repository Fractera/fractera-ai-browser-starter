import { buildRootLlmsTxt } from "@/lib/llms";
import { origin } from "@/lib/seo";

// `/llms.txt` — вход для агента, пришедшего к службе впервые (186-2).
//
// 🔒 КОРНЕВАЯ КАРТА ПЕРЕЧИСЛЯЕТ ЯЗЫКОВЫЕ, А НЕ ПОВТОРЯЕТ ИХ. Одна карта на все
// языки заставила бы агента угадывать, какой перевод ему нужен, — и он взял бы
// первый.
//
// 🛑 `dynamic`/`revalidate` НЕ ОБЪЯВЛЯЮТСЯ: у шаблона включён `cacheComponents`.
// Адрес считается от хоста запроса, поэтому маршрут и так исполняется на запрос.

export async function GET() {
  const base = await origin();
  return new Response(buildRootLlmsTxt(base), {
    headers: { "Cache-Control": "public, max-age=3600", "Content-Type": "text/plain; charset=utf-8" },
  });
}
