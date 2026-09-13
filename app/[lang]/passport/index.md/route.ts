import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SEO_LANGS } from "@/lib/seo";

// `/{язык}/passport/index.md` — зеркало паспорта (186-3).
//
// 🔒 ПАСПОРТ ОТДАЁТСЯ ФАЙЛОМ, КАК ОН ЛЕЖИТ: он и написан в Markdown, и
// пересказывать его здесь было бы второй правдой о замысле. Тот же документ
// читают публичная страница, вкладка за входом и агент разработки.
//
// 🛑 ЯЗЫК ПОКА ОДИН, И ЭТО СКАЗАНО ЧЕСТНО: документ ведётся по-русски, поэтому
// оба адреса отдают один и тот же файл. Разойдись это однажды — здесь появится
// выбор файла по языку, и адрес менять не придётся.

export function generateStaticParams() {
  return SEO_LANGS.map((lang) => ({ lang }));
}

export async function GET() {
  try {
    const text = await readFile(join(process.cwd(), "development-docs", "PASSPORT.md"), "utf8");
    return new Response(text, {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch {
    // 🛑 НЕТ ФАЙЛА — ЧЕСТНЫЙ 404, А НЕ ПУСТАЯ СТРАНИЦА: пустое зеркало агент
    // прочитает как «у службы нет паспорта».
    return new Response("passport not found", { status: 404 });
  }
}
