"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

// СТЕНД «ТЕСТ ЧТЕНИЯ» (196-3).
//
// 🔒 ЧЕЛОВЕК ВИДИТ ТО ЖЕ, ЧТО ПОЛУЧАЕТ ПРОГРАММА: ответ договора `/v1/read`, а не пересказ. Числа — сколько чего нашлось на
// странице, раскрывающиеся списки — сами элементы с атрибутами, как их отдаёт служба.
// 🔒 ОТКАЗ НАЗЫВАЕТСЯ ПОИМЁННО И С ПРИЧИНОЙ: `url-forbidden` рядом с «127.0.0.1:3300» — это работа защиты, а не поломка, и
// экран обязан это различать.
// 🔒 «ОТВЕРГНУТО» ПОКАЗЫВАЕТСЯ ВСЕГДА, ДАЖЕ НУЛЁМ: то, что страница хотела достать внутри машины и не достала, — половина
// ответа на вопрос «безопасно ли дать браузеру этот адрес».

export type ReadTestWords = {
  lead: string;
  placeholder: string;
  run: string;
  running: string;
  limitNote: string;
  failed: string;
  error: string;
  status: string;
  finalUrl: string;
  ms: string;
  counts: Record<
    "headings" | "links" | "buttons" | "forms" | "fields" | "images" | "videos" | "audios" | "iframes" | "blocked",
    string
  >;
  text: string;
  html: string;
  meta: string;
  truncatedNote: string;
  total: string;
};

type Listed = { items: unknown[]; total: number };
type Result = {
  url: string;
  error?: string;
  why?: string;
  status?: number | null;
  final_url?: string;
  title?: string;
  ms?: number;
  html?: string;
  html_length?: number;
  text?: string;
  text_length?: number;
  meta?: Record<string, string | null>;
  blocked?: Listed;
} & Partial<Record<"headings" | "links" | "buttons" | "forms" | "fields" | "images" | "videos" | "audios" | "iframes", Listed>>;
type Answer = { ok?: boolean; error?: string; why?: string; limit?: number; failed?: number; results?: Result[] };

const LISTS = ["headings", "links", "buttons", "forms", "fields", "images", "videos", "audios", "iframes", "blocked"] as const;

function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-md border border-border">
      <summary className="cursor-pointer px-3 py-2 text-[length:var(--fs-small)] font-medium">{title}</summary>
      <div className="border-border border-t p-3">{children}</div>
    </details>
  );
}

function Pre({ value }: { value: string }) {
  return (
    <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/40 p-3 font-mono text-[length:var(--fs-small)]">
      {value}
    </pre>
  );
}

function ResultCard({ r, words }: { r: Result; words: ReadTestWords }) {
  return (
    <section className="space-y-3 rounded-md border border-border p-4">
      <p className="break-all font-mono text-[length:var(--fs-small)] text-muted-foreground">{r.url}</p>
      {r.error ? (
        <p className="rounded-md border border-destructive/40 px-2 py-1 text-[length:var(--fs-small)] text-destructive">
          {words.error}: {r.error}
          {r.why ? ` — ${r.why}` : ""}
        </p>
      ) : (
        <>
          <h3 className="font-medium text-[length:var(--fs-body)]">{r.title || "—"}</h3>
          <p className="text-[length:var(--fs-small)] text-muted-foreground">
            {words.status} {r.status ?? "—"} · {words.ms} {r.ms} · {words.finalUrl}{" "}
            <span className="break-all font-mono">{r.final_url}</span>
          </p>
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {LISTS.map((k) =>
          r[k] ? (
            <span className="rounded-md bg-muted/40 px-2 py-1 text-[length:var(--fs-small)]" key={k}>
              {words.counts[k]}: <b>{r[k]?.total ?? 0}</b>
            </span>
          ) : null,
        )}
      </div>

      {typeof r.text === "string" && (
        <Fold title={`${words.text} · ${r.text_length ?? r.text.length}`}>
          <Pre value={r.text} />
          {(r.text_length ?? 0) > r.text.length && (
            <p className="mt-2 text-[length:var(--fs-small)] text-muted-foreground">{words.truncatedNote}</p>
          )}
        </Fold>
      )}
      {typeof r.html === "string" && (
        <Fold title={`${words.html} · ${r.html_length ?? r.html.length}`}>
          <Pre value={r.html} />
          {(r.html_length ?? 0) > r.html.length && (
            <p className="mt-2 text-[length:var(--fs-small)] text-muted-foreground">{words.truncatedNote}</p>
          )}
        </Fold>
      )}
      {r.meta && Object.keys(r.meta).length > 0 && (
        <Fold title={`${words.meta} · ${Object.keys(r.meta).length}`}>
          <Pre value={JSON.stringify(r.meta, null, 2)} />
        </Fold>
      )}
      {LISTS.map((k) =>
        r[k] && (r[k]?.total ?? 0) > 0 ? (
          <Fold key={k} title={`${words.counts[k]} · ${r[k]?.total}`}>
            <Pre value={JSON.stringify(r[k]?.items, null, 2)} />
            {(r[k]?.total ?? 0) > (r[k]?.items.length ?? 0) && (
              <p className="mt-2 text-[length:var(--fs-small)] text-muted-foreground">
                {words.total}: {r[k]?.total}
              </p>
            )}
          </Fold>
        ) : null,
      )}
    </section>
  );
}

export function ReadTestBench({ words }: { words: ReadTestWords }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);

  const run = useCallback(async () => {
    const urls = value
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!urls.length || busy) return;
    setBusy(true);
    setAnswer(null);
    try {
      const r = await fetch("/api/fractera/read-test", {
        body: JSON.stringify({ urls }),
        cache: "no-store",
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      setAnswer((await r.json()) as Answer);
    } catch (e) {
      setAnswer({ error: "request-failed", ok: false, why: String((e as Error).message) });
    } finally {
      setBusy(false);
    }
  }, [busy, value]);

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-[length:var(--fs-small)] leading-relaxed">{words.lead}</p>
      <textarea
        className="min-h-32 w-full rounded-md border border-border bg-background p-3 font-mono text-[length:var(--fs-small)]"
        onChange={(e) => setValue(e.target.value)}
        placeholder={words.placeholder}
        value={value}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={busy || !value.trim()} onClick={() => void run()} size="sm" type="button">
          {busy ? words.running : words.run}
        </Button>
        <span className="text-[length:var(--fs-small)] text-muted-foreground">{words.limitNote}</span>
      </div>

      {answer?.error && (
        <p className="rounded-md border border-destructive/40 px-2 py-1 text-[length:var(--fs-small)] text-destructive">
          {words.error}: {answer.error}
          {answer.limit ? ` (${answer.limit})` : ""}
          {answer.why ? ` — ${answer.why}` : ""}
        </p>
      )}
      {answer?.results && (
        <>
          <p className="text-[length:var(--fs-small)] text-muted-foreground">
            {words.failed}: {answer.failed ?? 0} / {answer.results.length}
          </p>
          {answer.results.map((r, i) => (
            <ResultCard key={`${i}-${r.url}`} r={r} words={words} />
          ))}
        </>
      )}
    </div>
  );
}
