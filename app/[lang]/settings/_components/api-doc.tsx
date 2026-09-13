// ВКЛАДКА «API» — ДОКУМЕНТАЦИЯ ДЛЯ ВНЕШНИХ ИНСТРУМЕНТОВ (185, переписана 185-2).
//
// 🔒 СТРАНИЦА ГОВОРИТ НА ОДНОМ ЯЗЫКЕ — ТОМ, КОТОРЫЙ ВЫБРАЛ ЧЕЛОВЕК. Требование
// владельца 2026-09-11, дословно: «на одной странице не надо делать текст и на
// русском и на английском поддерживать стандарт мультиязычности чтобы мы в
// будущем могли эти страницы масштабировать до 82 языков».
// 🪦 ОТМЕНЯЕТ ЕГО ЖЕ РЕШЕНИЕ ТОГО ЖЕ ДНЯ («английский для любой версии» плюс
// «Postman на обоих языках»): обе половины сняты одной правкой.
//
// 🔒 ДВА ИСТОЧНИКА, И ГРАНИЦА МЕЖДУ НИМИ ЖЁСТКАЯ:
//   ① ЧТО ЕСТЬ — из `contract.mjs`: методы, их параметры, типы, обязательность,
//      каталог. Порождается, руками не переписывается, разойтись не может;
//   ② КАК ЭТО ЗВУЧИТ — из `_i18n/api.i18n.ts`, ключами по именам из договора.
// 🛑 НЕТ ПЕРЕВОДА — СТРАНИЦА ПОКАЗЫВАЕТ ТЕКСТ ДОГОВОРА И ПОМЕЧАЕТ ЕГО
// НЕПЕРЕВЕДЁННЫМ, А НЕ МОЛЧИТ. Молчаливый пропуск параметра читался бы как
// «такого параметра нет», то есть врал бы о способности. Расхождение при этом
// ловится прибором `scripts/probe/api-i18n.mjs`, а не внимательностью.

import { CATALOGUE, CONTRACT_VERSION, METHODS, SERVICE } from "@/contract.mjs";
import { WORDS } from "@/lib/words.mjs";
import { ApiKeyCard, type ApiKeyWords } from "./api-key.client";
import { apiDocWords } from "../_i18n/api.i18n";

type Method = {
  about: string;
  /** Род тела (194-15): у прежних методов нет — их тело JSON. */
  body?: string;
  name: string;
  onMiss: string;
  params: Array<{ about: string; name: string; required: boolean; type: string }>;
  returns: string;
};

function H({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 className="scroll-mt-24 text-[length:var(--fs-h3)] font-semibold" id={id}>
      {children}
    </h2>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre rounded-md bg-muted px-3 py-2 font-mono text-[length:var(--fs-small)]">
      {children}
    </pre>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-3xl text-[length:var(--fs-small)] leading-relaxed">{children}</p>;
}

/** Коды отказов — из словаря службы, а не из списка в тексте. */
function refusalRows(lang: string): Array<[string, string]> {
  const branch = ((WORDS as Record<string, Record<string, string>>)[lang] ??
    (WORDS as Record<string, Record<string, string>>).en) as Record<string, string>;
  const en = (WORDS as Record<string, Record<string, string>>).en;
  const door = [
    "need-who",
    "need-who-and-text",
    "store-unreachable",
    "columns-unreadable",
    "bad-json",
    "missing-params",
    "no-access",
    "not-built",
    "unsafe-name",
    "inside-memory",
  ];
  return Object.keys(en)
    .filter((k) => k.startsWith("think-") || door.includes(k))
    .sort()
    // 🔒 СЛОВА ОТКАЗА БЕРУТСЯ НА ЯЗЫКЕ СТРАНИЦЫ — это те же слова, которые
    // увидит человек в поле `what_happened`. Показать их на другом языке
    // значило бы описывать не то, что он получит.
    .map((k) => [k, branch[k] ?? en[k]] as [string, string]);
}

export function ApiDoc({ base, keyWords, lang }: { base: string; keyWords: ApiKeyWords; lang: string }) {
  const w = apiDocWords(lang);
  const methods = METHODS as Method[];

  /** Перевод описания параметра; нет перевода — текст договора с пометкой. */
  const paramText = (name: string, fromContract: string) =>
    w.param[name] ?? `${fromContract} ${w.methods.untranslated}`;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <H id="overview">{w.h.overview}</H>
        <P>{w.overview.lead}</P>
        <P>
          {w.overview.audience} <code>{SERVICE}</code> · <code>{CONTRACT_VERSION}</code>
        </P>
        <div className="rounded-md border border-muted-foreground/30 p-3">
          <P>{w.overview.twoVerbs}</P>
        </div>
      </section>

      <section className="space-y-3">
        <H id="base-url">{w.h.baseUrl}</H>
        {/* 🔒 АДРЕС ПРИХОДИТ ИЗ ЗАПРОСА, А НЕ ИЗ КОНСТАНТЫ И НЕ ИЗ ПЕРЕМЕННОЙ
            (185-2, требование владельца). На другом сервере эта же страница
            покажет его домен, и человеку не придётся ничего править руками. */}
        <Code>{`${base}/v1`}</Code>
        <P>{w.baseUrl.lead}</P>
        <P>
          <strong>{w.baseUrl.readBody}</strong>
        </P>
      </section>

      <section className="space-y-3">
        <H id="auth">{w.h.auth}</H>
        <P>{w.auth.lead}</P>
        <P>{w.auth.headers}</P>
        <Code>{`x-memory-key: fmk_…

Authorization: Bearer fmk_…`}</Code>
        <P>{w.auth.denied}</P>
        <ApiKeyCard words={keyWords} />
      </section>

      <section className="space-y-4">
        <H id="methods">{w.h.methods}</H>
        <P>{w.methods.lead}</P>

        {methods.map((m) => {
          const mw = w.method[m.name];
          return (
            <div className="space-y-2 rounded-md border border-muted-foreground/30 p-3" key={m.name}>
              <span className="font-mono text-[length:var(--fs-small)] font-semibold">
                POST /v1/{m.name}
              </span>
              {m.body && (
                <span className="ml-2 font-mono text-[length:var(--fs-small)] text-muted-foreground">
                  {w.methods.body}: {m.body}
                </span>
              )}
              <P>{mw ? mw.about : `${m.about} ${w.methods.untranslated}`}</P>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[length:var(--fs-small)]">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="py-1 pr-3 font-medium">{w.methods.parameter}</th>
                      <th className="py-1 pr-3 font-medium">{w.methods.type}</th>
                      <th className="py-1 pr-3 font-medium">{w.methods.required}</th>
                      <th className="py-1 font-medium">{w.methods.meaning}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.params.map((p) => (
                      <tr className="border-t border-muted-foreground/15 align-top" key={p.name}>
                        <td className="py-1 pr-3 font-mono">{p.name}</td>
                        <td className="py-1 pr-3 font-mono text-muted-foreground">{p.type}</td>
                        <td className="py-1 pr-3">{p.required ? w.methods.yes : w.methods.no}</td>
                        <td className="py-1">{paramText(p.name, p.about)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <P>
                <strong>{w.methods.returns}</strong>{" "}
                {mw ? mw.returns : `${m.returns} ${w.methods.untranslated}`}
              </P>
              <P>
                <strong>{w.methods.onMiss}</strong>{" "}
                {mw ? mw.onMiss : `${m.onMiss} ${w.methods.untranslated}`}
              </P>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <H id="catalogue">{w.h.catalogue}</H>
        <P>{w.catalogue.lead}</P>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[length:var(--fs-small)]">
            <tbody>
              {(CATALOGUE as Array<{ about: string; path: string }>).map((c) => (
                <tr className="border-t border-muted-foreground/15 align-top" key={c.path}>
                  <td className="py-1 pr-3 font-mono">{c.path}</td>
                  <td className="py-1">
                    {w.catalogueItem[c.path] ?? `${c.about} ${w.methods.untranslated}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          <strong>{w.catalogue.law}</strong>
        </P>

        <H id="service">{w.h.service}</H>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[length:var(--fs-small)]">
            <tbody>
              <tr className="border-t border-muted-foreground/15 align-top">
                <td className="py-1 pr-3 font-mono">GET /v1/health</td>
                <td className="py-1">{w.catalogue.health}</td>
              </tr>
              <tr className="border-t border-muted-foreground/15 align-top">
                <td className="py-1 pr-3 font-mono">GET /v1/contract</td>
                <td className="py-1">{w.catalogue.contract}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <H id="threads">{w.h.threads}</H>
        <P>{w.threads.lead}</P>
        <P>
          <strong>{w.threads.measured}</strong>
        </P>
        <P>{w.threads.deny}</P>
        <P>{w.threads.unknown}</P>
      </section>

      <section className="space-y-3">
        <H id="params-report">{w.h.paramsReport}</H>
        <P>{w.paramsReport.lead}</P>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[length:var(--fs-small)]">
            <tbody>
              {[
                ["accepted", w.paramsReport.accepted],
                ["not_supported", w.paramsReport.notSupported],
                ["bad_form", w.paramsReport.badForm],
              ].map(([code, text]) => (
                <tr className="border-t border-muted-foreground/15 align-top" key={code}>
                  <td className="py-1 pr-3 font-mono">{code}</td>
                  <td className="py-1">{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>{w.paramsReport.never}</P>
      </section>

      <section className="space-y-3">
        <H id="refusals">{w.h.refusals}</H>
        <P>{w.refusals.lead}</P>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[length:var(--fs-small)]">
            <tbody>
              {refusalRows(lang).map(([code, text]) => (
                <tr className="border-t border-muted-foreground/15 align-top" key={code}>
                  <td className="py-1 pr-3 font-mono">{code}</td>
                  <td className="py-1">{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>{w.refusals.moneyVsKey}</P>
      </section>

      <section className="space-y-3">
        <H id="examples">{w.h.examples}</H>
        <P>{w.examples.tell}</P>
        <Code>{`curl -s ${base}/v1/remember \\
  -H "Content-Type: application/json" \\
  -H "x-memory-key: $MEMORY_KEY" \\
  -d '{ "who": "roman", "text": "my name is Roman and I live in Madrid", "lang": "${lang}" }'`}</Code>
        <P>{w.examples.ask}</P>
        <Code>{`curl -s ${base}/v1/recall \\
  -H "Content-Type: application/json" \\
  -H "x-memory-key: $MEMORY_KEY" \\
  -d '{ "who": "roman", "lang": "${lang}" }'`}</Code>
        <P>{w.examples.deny}</P>
        <Code>{`curl -s ${base}/v1/remember \\
  -H "Content-Type: application/json" \\
  -H "x-memory-key: $MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "about the city",
    "thread": "f0310016-29fd-4dc2-a97e-0c22292a4de2",
    "deny": "that is wrong — I moved to Lisbon last month"
  }'`}</Code>
        <P>{w.examples.scope}</P>
        <Code>{`curl -s ${base}/v1/remember \\
  -H "Content-Type: application/json" \\
  -H "x-memory-key: $MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "the taxi ride cost 40 euro",
    "scope": [
      { "at": "2026-09-11", "place": "Madrid" },
      { "place": "London" }
    ]
  }'`}</Code>
        {/* 🔒 ПРИМЕРЫ ОБЪЕКТОВ (194-18): те же четыре пути, что проходит прибор `scripts/probe/v1-objects.mjs`. */}
        <P>{w.examples.keepFile}</P>
        <Code>{`curl -s ${base}/v1/keep_object \\
  -H "x-memory-key: $MEMORY_KEY" \\
  -F "file=@lease.pdf" \\
  -F "source=api" \\
  -F "author=Roman"`}</Code>
        <P>{w.examples.keepUrl}</P>
        <Code>{`curl -s ${base}/v1/keep_object \\
  -H "Content-Type: application/json" \\
  -H "x-memory-key: $MEMORY_KEY" \\
  -d '{ "url": "https://example.com/note.oga", "source": "telegram", "author": "Roman", "who": "roman" }'`}</Code>
        <P>{w.examples.find}</P>
        <Code>{`curl -s ${base}/v1/find_objects \\
  -H "Content-Type: application/json" \\
  -H "x-memory-key: $MEMORY_KEY" \\
  -d '{ "question": "the lease agreement for the flat" }'`}</Code>
        <P>{w.examples.file}</P>
        <Code>{`curl -s ${base}/v1/objects/OBJECT_ID/file \\
  -H "x-memory-key: $MEMORY_KEY" \\
  -o object.bin`}</Code>
      </section>

      <section className="space-y-3">
        <H id="limits">{w.h.limits}</H>
        <P>{w.limits.lead}</P>
        <ul className="ml-5 list-disc space-y-1 text-[length:var(--fs-small)]">
          {w.limits.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <H id="postman">{w.h.postman}</H>
        <P>{w.postman.lead}</P>
        <ol className="ml-5 list-decimal space-y-2 text-[length:var(--fs-small)]">
          {w.postman.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <P>{w.postman.quota}</P>
      </section>
    </div>
  );
}
