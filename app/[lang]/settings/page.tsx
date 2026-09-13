import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Layers } from "lucide-react";
import { METHODS } from "@/contract.mjs";
import { publicMemoryUrl, publicSiteUrl } from "@/lib/fractera/auth-url";
import { PageCrumbs } from "@/components/nav/page-crumbs.server";
import { Eyebrow, H1, Lead } from "@/components/ui/typography";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { MemoryBench } from "./_components/memory-bench.client";
import { JournalView } from "./_components/journal-view.client";
import { GraphUpload } from "./_components/graph-upload.client";
import { GraphSearch } from "./_components/graph-search.client";
import { BenchCases } from "./_components/bench-cases.client";
import { VectorSearch, VectorUpload } from "./_components/vector-bench.client";
import { ObjectSearch, ObjectUpload } from "./_components/object-bench.client";
import { OpenAiTab } from "./_components/openai-tab";
import { AnthropicKeySection } from "./_components/anthropic-key";
import { ModelSections } from "./_components/models.client";
import { PassportBody } from "./_components/passport-body.client";
import { ApiDoc } from "./_components/api-doc";
import { SettingsCard } from "./_components/settings-card";
import { memoryUi } from "./_i18n/memory.i18n";
import {
  hrefOfMemorySection,
  MEMORY_SECTIONS,
  resolveMemorySection,
} from "./_lib/memory-sections";
import { hrefOfTestTab, isStandSection, isTestSection, resolveTestTab, tabsOf, type TestTab } from "./_lib/test-tabs";
import { skillsOf } from "./_lib/stand-skills";
import { StandSkills, type StandSkill } from "./_components/stand-skills";
import { passportOutline } from "./_lib/passport-outline";

// СТРАНИЦА ПАМЯТИ — СКОПИРОВАНА СО СЛУЖБЫ ЧАТА И УРЕЗАНА (178-2).
//
// 🎯 ЦЕЛЬ ВЛАДЕЛЬЦА, ДОСЛОВНО (2026-09-10): «чтобы мы прям память тестировали из
// памяти, а не из чата». Стенд стоит на самой службе, которую испытывает: между
// человеком и памятью не осталось ни одной чужой службы.
//
// 🔒 СПОСОБ ТОЖЕ НАЗВАН ИМ, И ПОВТОРЁН ДВАЖДЫ: «буквально скопируем всё, что
// есть, а потом уберём лишнее», «мы не программируем всё заново». Поэтому шапка,
// подвал, раскладка и элементы приехали ФАЙЛАМИ из `fractera-telegrambot-starter`,
// а не написаны здесь. Убрано шесть разделов из семи — они про бота, а не про
// память.
//
// 🛑 ЦЕНА НАЗВАНА ОТДЕЛЬНО: закон службы «ноль зависимостей» этим отменён,
// надгробие с датой стоит в `development-docs/LAWS.md`.
//
// 🔒 ШАПКА СОБРАНА `H1`/`Lead`/`Eyebrow` ИЗ ТОГО ЖЕ `typography.tsx`, А КРОШКИ —
// СВОИ, ХАРДКОДОМ. В источнике этот же приём и по той же причине: тамошние
// крошки тянут имя сайта из `APP-CONFIG` и разметку для поисковика, а служба
// обязана жить, когда приложения на 3000 нет вовсе.
//
// 🛑 `runtime` И `dynamic` НЕ ОБЪЯВЛЯЮТСЯ: `cacheComponents` их отвергает.

// 🔒 ЯЗЫКИ ПЕРЕЧИСЛЕНЫ ЗДЕСЬ ЖЕ, КАК В ИСТОЧНИКЕ. Без `generateStaticParams`
// сборка не знает, какие сегменты пререндерить, и падает на первом же — это и
// был отказ, который я сперва принял за проблему раскладки.
const LANGS = ["en", "ru"] as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/**
 * Что договор принимает у двух глаголов — ПОРОЖДЕНО, А НЕ ПЕРЕЧИСЛЕНО (183-1).
 *
 * 🔒 ОТСЮДА МЕТКИ «ДОЕЗЖАЕТ» / «ПОКА НЕ ДОЕЗЖАЕТ» У КАЖДОГО ОРГАНА СТЕНДА.
 * Рукописный список поддержанного разошёлся бы с `contract.mjs` молча — в этом
 * проекте такое оплачено пять раз за две недели, и дважды автором закона об
 * этом. Растёт договор — метки на экране меняются сами, без правки страницы.
 */
// 🪦 ЗДЕСЬ СТОЯЛ ВЫВОД АДРЕСА ИЗ ПЕРЕМЕННОЙ `MEMORY_PUBLIC_URL` — СНЯТО 185-2
// ТРЕБОВАНИЕМ ВЛАДЕЛЬЦА: «хочу быть уверен в том, что домен здесь не является
// хардкор, а подставляется строго в соответствии с реальным доменом».
// Переменная и была скрытым хардкодом: значение писал человек, и на другом
// сервере оно осталось бы нашим. Адрес теперь берётся из ЗАПРОСА —
// `publicMemoryUrl(host, proto)`, тем же приёмом, что и ссылка входа.

function supportedParams(): { recall: string[]; remember: string[] } {
  const of = (name: string) =>
    (METHODS.find((m) => m.name === name)?.params ?? []).map((p) => p.name);
  return { recall: of("recall"), remember: of("remember") };
}

// ✗ СТРАНИЦА ЖИВЁТ ПОД `<Suspense>`, И ЭТО ОПЛАЧЕНО СБОРКОЙ, А НЕ ВЫВЕДЕНО.
// Первая сборка здесь упала: «Uncached data was accessed outside of <Suspense>»
// — под `cacheComponents` этого требует уже сама раскладка (подвал печатает год
// копирайта, то есть зависит от запроса).
// 🔒 ПРИЁМ ПОВТОРЁН ЗА ИСТОЧНИКОМ, А НЕ ИЗОБРЕТЁН: ровно так же обёрнута
// страница `settings` службы чата и страница терминала. Копируя экран, копируй
// и то, чем он держится.
export default function MemoryPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MemoryPageBody {...props} />
    </Suspense>
  );
}

async function MemoryPageBody({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const raw = typeof sp.section === "string" ? sp.section : undefined;
  const active = resolveMemorySection(raw);
  const ui = memoryUi(lang);

  // 🔒 АДРЕС СЛУЖБЫ ДЛЯ ПРИМЕРОВ ВКЛАДКИ API БЕРЁТСЯ ИЗ ЗАПРОСА (185-2): хост
  // знает правду всегда, а переменная, записанная при рождении сервера,
  // застывает и ломается молча — это уже оплачено ссылкой входа у соседа.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";

  // 🔒 ДОКУМЕНТ ЧИТАЕТСЯ С ДИСКА НА КАЖДЫЙ ЗАПРОС, И ЭТО ГЛАВНОЕ ЕГО СВОЙСТВО:
  // владелец правит `development-docs/PASSPORT.md` — и видит правку на следующей
  // загрузке, без сборки и без перезапуска. Тот же приём, что у паспорта чата.
  // 🛑 ЧИТАЕМ ТОЛЬКО КОГДА РАЗДЕЛ ОТКРЫТ: страница со стендом не должна платить
  // чтением файла, который на ней не показывают.
  let passport = "";
  if (active === "passport") {
    try {
      passport = await readFile(join(process.cwd(), "development-docs", "PASSPORT.md"), "utf8");
    } catch {
      // Файла нет — раздел скажет это словами ниже, а не покажет пустоту.
      passport = "";
    }
  }
  // 🔒 ЗАГОЛОВКИ ПЕРВОГО УРОВНЯ СТАНОВЯТСЯ ЛИПКИМ МЕНЮ — той же полосой раздела,
  // что у соседей. Второе меню своей конструкции рядом с ней разошлось бы с ним.
  const passportTabs = passportOutline(passport).map((i) => ({
    active: false,
    href: `#${i.id}`,
    label: i.title,
  }));

  // 🔒 ТРИ СТРАНИЦЫ СТЕНДА — ТА ЖЕ ПОЛОСА ВКЛАДОК, ЧТО У ПАСПОРТА (189-1).
  // Второе меню своей конструкции рядом с ней разошлось бы с ним на первой
  // правке; здесь различается только то, откуда берутся пункты.
  // 🔒 ОТКРЫТАЯ СТРАНИЦА ЖИВЁТ В АДРЕСЕ (`?tab=`), А НЕ В СОСТОЯНИИ ОСТРОВКА:
  // владелец обязан уметь прислать ссылку на то, что он видит.
  const openTab = resolveTestTab(
    typeof sp.tab === "string" ? sp.tab : undefined,
    isStandSection(active) ? active : undefined,
  );
  const testTabs = isStandSection(active)
    ? tabsOf(active).map((t) => ({
        active: t === openTab,
        href: hrefOfTestTab(lang, active, t),
        label: ui.testBench.tabs[t],
      }))
    : undefined;

  // 🔒 НАВЫК ЧИТАЕТСЯ С ДИСКА НА КАЖДЫЙ ЗАПРОС, КАК ПАСПОРТ (194-6): правка файла навыка видна на
  // следующей загрузке, без сборки. Это тот самый файл, который читает агент, — второй копии нет.
  // 🛑 ЧИТАЕМ ТОЛЬКО КОГДА ВКЛАДКА ОТКРЫТА.
// 🔒 С 194-19 НАВЫКИ ЕСТЬ У КАЖДОГО СТЕНДА, И ИХ МОЖЕТ БЫТЬ НЕСКОЛЬКО: имена — из `stand-skills.ts`.
  const skills: StandSkill[] =
    isStandSection(active) && openTab === "skill"
      ? await Promise.all(
          skillsOf(active).map(async (name) => {
            const path = join(".claude", "skills", name, "SKILL.md");
            try {
              return { name, path, text: await readFile(join(process.cwd(), path), "utf8") };
            } catch {
              return { name, path, text: "" };
            }
          }),
        )
      : [];
  const skillWords = { missing: ui.testBench.skillMissing };
  /** Страница трёх стендов хранилищ: «Тест» бывает только у теста памяти, сюда он не доходит. */
  const pageTab = openTab as TestTab;

  return (
    <main className="min-h-screen bg-background">
      <div className="px-6 py-[var(--page-py-work)]" data-app-column>
        <div className="flex flex-col gap-4">
          {/* 🔒 ТРИ КРОШКИ, И У КАЖДОЙ СВОЙ АДРЕС (2026-09-11, слово владельца).
              «Fractera» — корень БЕЗ субдомена, выведенный из хоста запроса;
              «Служба памяти» — корень ЭТОГО субдомена на языке страницы;
              последняя — где мы сейчас, и она не ссылка по устройству крошек.
              🪦 Прежде первая вела на корень своей же службы, а вторая не была
              ссылкой вовсе — владелец нашёл это живьём. */}
          <PageCrumbs
            trail={[
              { href: `/${lang}`, label: ui.layer },
              { href: hrefOfMemorySection(lang, "memory-test"), label: ui.title },
              { label: ui.pages[active].title },
            ]}
          />

          <header className="flex flex-col gap-4 border-border border-b pb-8">
            <Eyebrow>{ui.layer}</Eyebrow>
            <H1>{ui.title}</H1>
            <Lead className="max-w-3xl">{ui.subtitle}</Lead>
          </header>
        </div>

        <WorkspaceShell
          id="memory"
          lead={ui.pages[active].hint}
          // 🔒 МЕНЮ ПОРОЖДАЕТСЯ ИЗ `MEMORY_SECTIONS`, А НЕ ПЕРЕЧИСЛЯЕТСЯ ЗДЕСЬ.
          // Тот массив — единственный источник И меню, И маршрутизации; второй
          // список разошёлся бы с ним молча, как это уже случалось у соседа.
          // 🔒 «ПОДПИСКА» СТОИТ В МЕНЮ, НО РАЗДЕЛОМ НЕ ЯВЛЯЕТСЯ (180-2) — тот же
          // приём, что «Терминал» у чата. Пункт уводит на отдельную страницу
          // `/terminal` в соседней вкладке, поэтому его нет в `MEMORY_SECTIONS`:
          // тот массив — единственный источник разделов, и запись в нём означала
          // бы раздел, которого нет.
          // 🔒 «ПОДПИСКА CLAUDE» СТОИТ ПРЯМО НАД «ПОДПИСКОЙ OpenAI» (181-1, слово
          // владельца: «под кнопкой подписка Claude должна быть кнопка подписка
          // OpenAI»). Claude — отдельная страница входа в соседней вкладке, OpenAI —
          // раздел этой страницы; поэтому первое вставляется ссылкой перед вторым, а в
          // `MEMORY_SECTIONS` живёт только второе.
          // 🔒 «ПОСТРОЙТЕ ЭТОТ ПРОДУКТ» СТОИТ ПОСЛЕДНИМ, И ЭТО НЕ ВКУС (189-8,
          // слово владельца: «внизу нужна вкладка»). Порядок меню — порядок
          // осторожности: сверху то, что читают и настраивают, внизу то, что
          // меняет сам продукт. Пункт уводит на отдельную страницу и потому не
          // значится в MEMORY_SECTIONS: тот массив — единственный источник
          // разделов, и запись в нём означала бы раздел, которого нет.
          menu={MEMORY_SECTIONS.flatMap((id) => {
            const item = {
              active: id === active,
              href: hrefOfMemorySection(lang, id),
              label: ui.pages[id].title,
            };
            return id === "openai"
              ? [{ href: `/${lang}/terminal`, label: ui.terminalLabel, newTab: true }, item]
              : [item];
          })// 🔒 `active: false` — ЧЕСТНО: страница строителя живёт за пределами этого
          // меню, и подсветить её как открытый раздел значило бы соврать о том,
          // где человек находится.
          .concat([{ active: false, href: `/${lang}/build`, label: ui.buildLabel }])}
          menuTitle={ui.menuTitle}
          menuWord={ui.menuWord}
          tabs={active === "passport" ? passportTabs : testTabs}
          title={ui.pages[active].title}
        >
          <div className="space-y-6">
            {/* 🔒 СЛОВА УЕЗЖАЮТ ОСТРОВКАМ ПЕРЕЧИСЛЕННЫМИ ПОИМЁННО, а не словарём
                целиком: тип не сужает рантайм — по проводу уедет всё переданное,
                даже неотрисованное. Закон оплачен в панели дважды за один шаг. */}
            {active === "passport" &&
              (passport ? (
                <PassportBody text={passport} />
              ) : (
                <p className="text-[length:var(--fs-small)] text-muted-foreground">
                  {ui.passportMissing}
                </p>
              ))}

            {active === "memory-test" && openTab !== "skill" && (
              <MemoryBench
                lang={lang}
                supported={supportedParams()}
                tablesWords={ui.memoryTables}
                testWords={ui.memoryTest}
              />
            )}

            {active === "memory-test" && openTab === "skill" && (
              <StandSkills items={skills} words={skillWords} />
            )}

            {/* 🔒 ВКЛАДКА API — ДОКУМЕНТАЦИЯ ДЛЯ ВНЕШНИХ ИНСТРУМЕНТОВ (185).
                Адрес службы считается ОДИН раз здесь и уезжает пропсом: в
                примерах и в инструкции Postman должен стоять тот адрес, по
                которому человек реально придёт, а не выдуманный образец. */}
            {active === "api" && <ApiDoc base={publicMemoryUrl(host, proto)} keyWords={ui.apiKey} lang={lang} />}

            {/* 🔒 ДВА СТЕНДА ХРАНИЛИЩ — ПОКА ТОЛЬКО ВИД (189-1). Владелец смотрит
                раскладку до того, как под ней появится логика: «вы смотрите вид и
                говорите так или не так, до логики».
                🛑 ПУСТАЯ СТРАНИЦА ГОВОРИТ, ПОЧЕМУ ОНА ПУСТА. Молчащий экран
                читается как поломка — в этом проекте оплачено не раз. */}
            {isTestSection(active) && (
              <section className="space-y-4">
                <h2 className="font-medium text-[length:var(--fs-h3)]">
                  {ui.testBench.tabs[openTab]}
                </h2>
                <p className="max-w-3xl text-[length:var(--fs-body)] text-muted-foreground">
                  {openTab === "skill"
                    ? ui.testBench.skillLead
                    : active === "object-test"
                      ? ui.testBench.object[pageTab]
                      : active === "graph-test"
                        ? ui.testBench.graph[pageTab]
                        : ui.testBench.vector[pageTab]}
                </p>
                {/* 🔒 ВВОДНЫЙ ТЕКСТ СТЕНДА ОБЪЕКТОВ — СВЁРНУТОЙ КАРТОЧКОЙ ПОД ОПИСАНИЕМ (слово владельца
                    2026-09-13: «занимает слишком много места… разместить вверху сразу под описанием…
                    скрыт как вкладка аккордеона которая закрыта»). Раскрытие делает details браузера через
                    SettingsCard — та же реализация, что у карточек настроек, без островка. Текст о службе
                    целиком, поэтому стоит на каждой вкладке стенда объектов. */}
                {active === "object-test" && (
                  <SettingsCard
                    bodyClassName="space-y-3 p-4"
                    icon={<Layers className="size-4 text-muted-foreground" />}
                    mark={{ "data-object-intro": "" }}
                    title={ui.objectBench.intro.cardTitle}
                  >
                    {ui.objectBench.intro.paragraphs.map((p) => (
                      <p className="max-w-3xl text-[length:var(--fs-body)]" key={p.slice(0, 32)}>
                        {p}
                      </p>
                    ))}
                    <h3 className="pt-2 font-medium text-[length:var(--fs-body)]">{ui.objectBench.intro.kindsTitle}</h3>
                    <ul className="max-w-3xl space-y-2">
                      {ui.objectBench.intro.kinds.map((k) => (
                        <li className="text-[length:var(--fs-small)]" key={k.title}>
                          <span className="font-medium text-[length:var(--fs-body)]">{k.title}</span>
                          <span className="text-muted-foreground"> — {k.body}</span>
                        </li>
                      ))}
                    </ul>
                  </SettingsCard>
                )}
                {/* 🔒 ПОСТРОЕННОЕ ПОКАЗЫВАЕМ, НЕПОСТРОЕННОЕ НАЗЫВАЕМ (189-2).
                    Загрузка в граф построена — она стоит здесь; остальные пять
                    страниц по-прежнему говорят словами, что орган строится
                    следующим подшагом. Молчащая страница читается как поломка,
                    а обещанная и пустая — как ложь. */}
                {active === "graph-test" && openTab === "upload" ? (
                  <GraphUpload words={ui.graphUpload} />
                ) : active === "graph-test" && openTab === "search" ? (
                  <GraphSearch words={ui.graphSearch} />
                ) : openTab === "verdict" ? (
                  // 🔒 ОЦЕНКА ОДНА НА ОБА ХРАНИЛИЩА (189-6). Корпус случаев общий —
                  // иначе числа графа и вектора не с чем сравнивать, а сравнение
                  // и есть смысл двух стендов рядом.
                  <BenchCases words={ui.benchCases} />
                ) : active === "vector-test" && openTab === "upload" ? (
                  <VectorUpload words={ui.vectorBench} />
                ) : active === "vector-test" && openTab === "search" ? (
                  <VectorSearch words={ui.vectorBench} />
                ) : active === "object-test" && openTab === "upload" ? (
                  <ObjectUpload words={ui.objectBench} />
                ) : active === "object-test" && openTab === "search" ? (
                  <ObjectSearch words={ui.objectBench} />
                ) : openTab === "skill" ? (
                  <StandSkills items={skills} words={skillWords} />
                ) : (
                  <p className="rounded-md border border-border border-dashed p-4 text-[length:var(--fs-small)] text-muted-foreground">
                    {ui.testBench.soon}
                  </p>
                )}
              </section>
            )}

            {active === "journal" && <JournalView words={ui.journal} />}

            {active === "openai" && <OpenAiTab ui={ui} />}

            {/* 🔒 «НАСТРОЙКИ» ПАМЯТИ — ПОКА ОДНА КАРТОЧКА, И ЭТО ЧЕСТНО (181-9).
                Слово владельца: «в кнопку настройки скопируй то же самое решение
                которое у нас существует для подключения Anthropic ключа».
                Карточка, форма и дверь — те же файлы, что у чата, байт в байт. */}
            {/* 🔒 РАЗДЕЛ «НАСТРОЙКИ» — ТРИ КАРТОЧКИ С 189-7 (заказ владельца:
                «в настройки пробрасывай настройки модели»). Ключ доступа стоит
                первым: без него не работает ничего; модели ниже — ими работа
                делается. */}
            {active === "settings" && (
              <>
                <AnthropicKeySection />
                <ModelSections />
              </>
            )}
          </div>
        </WorkspaceShell>
      </div>
    </main>
  );
}
