// ОГЛАВЛЕНИЕ ГЛАВНОЙ ПАМЯТИ (194-12).
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-13: «add to page block toc1 from
// https://aifa.dev/ru/architect/design?section=blocks&kind=page-material». Блок каталога `toc01`,
// источник — `fractera-next-starter/sections/blocks/toc.server.tsx`, карточка — `sections/blocks/toc.md`.
//
// 🔒 РИСУНОК ПЕРЕНЕСЁН БЕЗ ИЗМЕНЕНИЙ: плашка, надпись с числом пунктов, номер-знак `aria-hidden` с полным
// `muted-foreground` (проверка доступности источника), второй уровень без номеров, пустой список не рисует
// ничего.
//
// 🔒 ИЗМЕНЕНО ПРОТИВ ИСТОЧНИКА:
// 1. Не `SectionRenderer` каталога, а обычный серверный компонент: у главной памяти нет ни договора секций,
//    ни `getPageUi` — пункты и подписи приходят пропсами.
// 2. `aria-label` берётся из словаря. У источника он был «Contents» по-английски во всех языках — долг,
//    названный в его же комментарии; здесь он закрыт, а не перенесён.
// 3. Отступ `mt-8` заменён обёрткой ширины главной: оглавление стоит между первым экраном и телом.
//
// 🛑 ПРАВИЛО КАРТОЧКИ «ЯКОРЯ СОВПАДАЮТ ПО ПОСТРОЕНИЮ» ЗДЕСЬ ИСПОЛНЯЕТСЯ ИЗМЕРЕНИЕМ, А НЕ КОНСТРУКЦИЕЙ: разделы
// главной написаны вручную, а не блоками. Пункты берутся из тех же id и тех же заголовков словаря, а
// совпадение каждого `#id` с `id=` на отданной странице проверяет прибор 194-12.

export type LandingTocItem = { id: string; text: string; children?: { id: string; text: string }[] };

export function LandingToc({ heading, items, label }: { heading: string; items: LandingTocItem[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-4">
      <nav aria-label={label} className="rounded-2xl border border-border bg-muted/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {heading} · {items.reduce((n, i) => n + 1 + (i.children?.length ?? 0), 0)}
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {items.map((item, i) => (
            <li className="flex flex-col gap-2 text-[15px] leading-snug" key={item.id}>
              <span className="flex gap-3">
                <span aria-hidden className="select-none font-mono text-sm text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a className="text-muted-foreground transition-colors hover:text-primary" href={`#${item.id}`}>
                  {item.text}
                </a>
              </span>
              {/* Второй уровень: подразделы своего раздела. Номера им не даются —
                  нумерация «01.03» превращает карту в оглавление книги, а отступа
                  и точки достаточно, чтобы уровень читался. */}
              {item.children && item.children.length > 0 && (
                <ul className="ml-9 flex flex-col gap-1.5">
                  {item.children.map((sub) => (
                    <li className="flex gap-2 text-sm leading-snug" key={sub.id}>
                      <span aria-hidden className="select-none text-muted-foreground">·</span>
                      <a className="text-muted-foreground transition-colors hover:text-primary" href={`#${sub.id}`}>
                        {sub.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
