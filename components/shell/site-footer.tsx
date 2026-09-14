import { Suspense } from "react";
import { headers } from "next/headers";
import { shellUi } from "./shell.i18n";
import { ThemeToggle } from "./theme-toggle.client";
import { FRACTERA_SERVICES, serviceUrl, servicesUi } from "./services";

// ПОДВАЛ СЛУЖБЫ — ВЕРХНИЙ БЛОК СО ССЫЛКАМИ НА ВСЕ СЛУЖБЫ FRACTERA И СТРОКА КОПИРАЙТА.
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-14 (шаг 197): «типовой фут который должен перекрёстный ссылаться во все эти страницы» — чат,
// память, ИИ-браузер. 🪦 Прежняя редакция (186-4, слово 2026-09-11) держала одну ссылку на соседа.
//
// 🔒 ФАЙЛ БАЙТ В БАЙТ ОДИН В ТРЁХ РЕПОЗИТОРИЯХ, вместе с `services.ts` — список и слова живут там.
// 🔒 ТЕКУЩАЯ СЛУЖБА ПОКАЗАНА, НО НЕ ССЫЛКОЙ: подвал одинаков везде, а ссылка на страницу, где человек уже стоит, — пустой
// ход. Своя служба узнаётся сравнением выведенного адреса с адресом запроса, а не константой в файле: иначе три копии
// перестали бы быть одним файлом.
// 🔒 В ПОДВАЛЕ НЕТ ЧУЖИХ КОНФИГОВ (закон 137): адреса выводятся из хоста запроса.
// 🛑 ЗАГОЛОВКИ ЧИТАЮТСЯ ПОД `<Suspense>`: под `cacheComponents` обращение к запросу вне границы ожидания роняет пререндер.
// 🛑 ГОД БЕРЁТСЯ ИЗ `new Date()`, и лечение стоит в `app/[lang]/layout.tsx` (`connection()` перед вызовом).

export function SiteFooter({ lang }: { lang: string }) {
  const ui = shellUi(lang);

  return (
    <footer className="w-full border-border border-t">
      {/* ВЕРХНИЙ БЛОК: все службы Fractera одной строкой. */}
      <div className="w-full border-border border-b px-6 py-4 md:px-8">
        <Suspense fallback={<div className="h-5" />}>
          <ServiceLinks lang={lang} />
        </Suspense>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-8">
        <span className="text-[length:var(--fs-small)] text-muted-foreground">
          © {new Date().getFullYear()} Fractera. {ui.rights}
        </span>
        <ThemeToggle
          labels={{ dark: ui.dark, light: ui.light, system: ui.system }}
        />
      </div>
    </footer>
  );
}

/** Ссылки на службы. Служба, чей адрес не выводится из хоста, не показывается вовсе: ссылка в никуда хуже её отсутствия. */
async function ServiceLinks({ lang }: { lang: string }) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const ui = servicesUi(lang);
  const own = host ? `${proto}://${host}` : "";
  const links = FRACTERA_SERVICES.map((s) => ({ href: serviceUrl(s, host, proto), id: s.id })).filter((l) => l.href);

  if (!links.length) return <div className="h-5" />;

  return (
    <nav aria-label={ui.label} className="flex flex-wrap items-center gap-4">
      {links.map((l) =>
        l.href === own ? (
          <span aria-current="page" className="text-[length:var(--fs-small)] font-medium text-foreground" key={l.id}>
            {ui.names[l.id]}
          </span>
        ) : (
          <a
            className="text-[length:var(--fs-small)] text-muted-foreground hover:text-foreground"
            href={`${l.href}/${lang}`}
            key={l.id}
          >
            {ui.names[l.id]}
          </a>
        ),
      )}
    </nav>
  );
}
