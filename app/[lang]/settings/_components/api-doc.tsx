// ВКЛАДКА «API» — ДОКУМЕНТАЦИЯ ДЛЯ ВНЕШНИХ ИНСТРУМЕНТОВ (185 памяти, переписана под браузер в 196-5).
//
// 🔒 СТРАНИЦА ГОВОРИТ НА ОДНОМ ЯЗЫКЕ — ТОМ, КОТОРЫЙ ВЫБРАЛ ЧЕЛОВЕК (требование владельца 2026-09-11, унаследовано копией).
// 🔒 ДВА ИСТОЧНИКА, И ГРАНИЦА МЕЖДУ НИМИ ЖЁСТКАЯ: ① ЧТО ЕСТЬ — из `contract.mjs` (методы, параметры, типы, обязательность),
// порождается; ② КАК ЭТО ЗВУЧИТ — из `_i18n/api.i18n.ts`. Нет перевода — текст договора с пометкой, а не молчание.
// 🔒 АДРЕС ПРИХОДИТ ИЗ ЗАПРОСА, А НЕ ИЗ КОНСТАНТЫ: на другом сервере страница покажет его домен.

import { CONTRACT_VERSION, METHODS, SERVICE } from "@/contract.mjs";
import { ApiKeyCard, type ApiKeyWords } from "./api-key.client";
import { apiDocWords } from "../_i18n/api.i18n";

type Method = {
  about: string;
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

export function ApiDoc({ base, keyWords, lang }: { base: string; keyWords: ApiKeyWords; lang: string }) {
  const w = apiDocWords(lang);
  const methods = METHODS as Method[];

  /** Перевод описания параметра; нет перевода — текст договора с пометкой. */
  const paramText = (method: string, name: string, fromContract: string) =>
    w.param[`${method}.${name}`] ?? `${fromContract} ${w.methods.untranslated}`;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <H id="overview">{w.h.overview}</H>
        <P>{w.overview.lead}</P>
        <P>
          {w.overview.audience} <code>{SERVICE}</code> · <code>{CONTRACT_VERSION}</code>
        </P>
        <div className="rounded-md border border-muted-foreground/30 p-3">
          <P>{w.overview.twoMethods}</P>
        </div>
      </section>

      <section className="space-y-3">
        <H id="base-url">{w.h.baseUrl}</H>
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
        <Code>{`x-ai-browser-key: fab_…

Authorization: Bearer fab_…`}</Code>
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
              <span className="font-mono text-[length:var(--fs-small)] font-semibold">POST /v1/{m.name}</span>
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
                        <td className="py-1">{paramText(m.name, p.name, p.about)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <P>
                <strong>{w.methods.returns}</strong> {mw ? mw.returns : `${m.returns} ${w.methods.untranslated}`}
              </P>
              <P>
                <strong>{w.methods.onMiss}</strong> {mw ? mw.onMiss : `${m.onMiss} ${w.methods.untranslated}`}
              </P>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <H id="service">{w.h.service}</H>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[length:var(--fs-small)]">
            <tbody>
              <tr className="border-t border-muted-foreground/15 align-top">
                <td className="py-1 pr-3 font-mono">GET /v1/health</td>
                <td className="py-1">{w.service.health}</td>
              </tr>
              <tr className="border-t border-muted-foreground/15 align-top">
                <td className="py-1 pr-3 font-mono">GET /v1/contract</td>
                <td className="py-1">{w.service.contract}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <H id="refusals">{w.h.refusals}</H>
        <P>{w.refusals.lead}</P>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[length:var(--fs-small)]">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 pr-3 font-medium">{w.refusals.code}</th>
                <th className="py-1 pr-3 font-medium">{w.refusals.status}</th>
                <th className="py-1 font-medium">{w.refusals.meaning}</th>
              </tr>
            </thead>
            <tbody>
              {w.refusals.rows.map((r) => (
                <tr className="border-t border-muted-foreground/15 align-top" key={r.code}>
                  <td className="py-1 pr-3 font-mono">{r.code}</td>
                  <td className="py-1 pr-3 font-mono text-muted-foreground whitespace-nowrap">{r.status}</td>
                  <td className="py-1">{r.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <H id="examples">{w.h.examples}</H>
        <P>{w.examples.read}</P>
        <Code>{`curl -s ${base}/v1/read \\
  -H "Content-Type: application/json" \\
  -H "x-ai-browser-key: $AI_BROWSER_KEY" \\
  -d '{ "urls": ["https://todomvc.com/examples/react/dist/"] }'`}</Code>
        <P>{w.examples.many}</P>
        <Code>{`curl -s ${base}/v1/read \\
  -H "Content-Type: application/json" \\
  -H "x-ai-browser-key: $AI_BROWSER_KEY" \\
  -d '{ "urls": ["https://developer.mozilla.org/en-US/docs/Web/HTML", "https://en.wikipedia.org/wiki/Web_browser"] }'`}</Code>
        <P>{w.examples.youtube}</P>
        <Code>{`curl -s ${base}/v1/youtube \\
  -H "Content-Type: application/json" \\
  -H "x-ai-browser-key: $AI_BROWSER_KEY" \\
  -d '{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "lang": "${lang}" }'`}</Code>
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
      </section>
    </div>
  );
}
