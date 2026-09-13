import type { MetadataRoute } from "next";
import { origin } from "@/lib/seo";

// ПРАВИЛА ОБХОДА (186-2).
//
// 🔒 ЗАКРЫТО ТО, ЧТО И ТАК ЗА ЗАМКОМ, И ЭТО НЕ ИЗБЫТОЧНОСТЬ: робот, получивший
// перенаправление на вход, оставляет страницу в индексе как недоступную, а
// повторные попытки тратят бюджет обхода на дверь, которая ему не откроется.
//
// 🔒 КАРТА САЙТА НАЗВАНА ЗДЕСЬ ЖЕ — это первое, что робот ищет, и единственное
// место, где он согласен её искать без подсказки.

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await origin();
  return {
    host: base,
    rules: [
      {
        allow: "/",
        disallow: ["/api/", "/settings", "/terminal", "/welcome", "/v1/"],
        userAgent: "*",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
