import type { MetadataRoute } from "next";
import { origin, SEO_LANGS, urlFor } from "@/lib/seo";

// КАРТА САЙТА (186-2).
//
// 🔒 ПЕРЕЧИСЛЕНЫ ТОЛЬКО ПУБЛИЧНЫЕ АДРЕСА. Служебные экраны живут за ролью
// архитектора: строка о них в карте была бы приглашением поисковику постучаться
// туда, где его встретит перенаправление на вход, — и страница осталась бы в
// индексе как «недоступна».
//
// 🔒 ПЕРЕВОДЫ ОБЪЯВЛЕНЫ ЧЕРЕЗ `alternates`, А НЕ ОТДЕЛЬНЫМИ СТРОКАМИ: так
// поисковик видит, что это одна страница на двух языках, а не две разные.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await origin();
  const now = new Date();

  const languages = (sub: string) =>
    Object.fromEntries(SEO_LANGS.map((l) => [l, urlFor(base, l, sub)]));

  return [
    ...SEO_LANGS.map((lang) => ({
      alternates: { languages: languages("") },
      changeFrequency: "weekly" as const,
      lastModified: now,
      priority: 1,
      url: urlFor(base, lang),
    })),
    ...SEO_LANGS.map((lang) => ({
      alternates: { languages: languages("/passport") },
      changeFrequency: "weekly" as const,
      lastModified: now,
      priority: 0.8,
      url: urlFor(base, lang, "/passport"),
    })),
  ];
}
