"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// КАРТОЧКА КЛЮЧА ДОСТУПА (185).
//
// 🔒 ПОЛНЫЙ КЛЮЧ ВИДЕН РОВНО ОДИН РАЗ — сразу после того, как человек сам его
// породил. При следующем открытии страницы здесь будет только маска. Ключ,
// который можно подсмотреть в любой момент, перестаёт быть секретом: его увидят
// на чужом экране, в записи демонстрации, на скриншоте в переписке.
//
// 🛑 «СГЕНЕРИРОВАТЬ» И «ОТОЗВАТЬ» — ОДНО ДЕЙСТВИЕ, И ЭТО НАПИСАНО ДО НАЖАТИЯ,
// А НЕ ПОСЛЕ. Новый ключ отменяет прежний в тот же миг, и живая интеграция
// ломается. Второй кнопки «отозвать» нет намеренно — она была бы тем же самым
// действием под другим именем, а два имени у одного действия рождают уверенность,
// что действий два.

export type ApiKeyWords = {
  title: string;
  lead: string;
  exists: string;
  missing: string;
  generate: string;
  regenerate: string;
  working: string;
  copy: string;
  copied: string;
  shownOnce: string;
  warning: string;
  failed: string;
};

export function ApiKeyCard({ words }: { words: ApiKeyWords }) {
  const [masked, setMasked] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trouble, setTrouble] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const r = await fetch("/api/fractera/memory-key", { cache: "no-store" });
        const data = (await r.json()) as { exists?: boolean; masked?: string | null };
        if (!alive) return;
        setExists(Boolean(data?.exists));
        setMasked(data?.masked ?? null);
      } catch {
        // 🛑 НЕ СПРОСИЛОСЬ — КАРТОЧКА ОСТАЁТСЯ РАБОЧЕЙ. Кнопка важнее сведений:
        // человек пришёл сюда завести ключ, а не любоваться маской.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const generate = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setTrouble(null);
    try {
      const r = await fetch("/api/fractera/memory-key", { cache: "no-store", method: "POST" });
      const data = (await r.json()) as { key?: string; masked?: string; ok?: boolean; why?: string };
      // 🛑 ЧИТАЕМ ТЕЛО, А НЕ КОД: дверь отвечает 200 с ok:false там, где отказ
      // понятен ей самой.
      if (!data?.ok || !data.key) {
        setTrouble(data?.why ? `${words.failed}: ${data.why}` : words.failed);
        return;
      }
      setFresh(data.key);
      setMasked(data.masked ?? null);
      setExists(true);
      setCopied(false);
    } catch (e) {
      setTrouble(`${words.failed}: ${String((e as Error).message)}`);
    } finally {
      setBusy(false);
    }
  }, [busy, words.failed]);

  const copy = useCallback(async () => {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh);
      setCopied(true);
    } catch {
      // 🔒 БУФЕР БЫВАЕТ ЗАКРЫТ БРАУЗЕРОМ — ключ при этом виден на экране и
      // выделяется мышью. Молча ничего не делать здесь нельзя, а падать не за что.
      setCopied(false);
    }
  }, [fresh]);

  return (
    <div className="space-y-3 rounded-md border border-muted-foreground/30 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[length:var(--fs-small)] font-semibold">{words.title}</span>
        <span className="font-mono text-[length:var(--fs-small)] text-muted-foreground">
          {exists ? `${words.exists}: ${masked ?? "—"}` : words.missing}
        </span>
      </div>

      <p className="max-w-3xl text-[length:var(--fs-small)] leading-relaxed">{words.lead}</p>

      {/* 🔒 ПРЕДУПРЕЖДЕНИЕ СТОИТ ДО КНОПКИ, А НЕ ПОСЛЕ НЕЁ. Сказанное после
          нажатия — это уже не предупреждение, а объяснение случившегося. */}
      {exists ? (
        <p className="rounded-md border border-destructive/40 px-2 py-1 text-[length:var(--fs-small)] text-destructive">
          {words.warning}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={busy} onClick={() => void generate()} size="sm" type="button">
          {busy ? words.working : exists ? words.regenerate : words.generate}
        </Button>
        {fresh ? (
          <Button onClick={() => void copy()} size="sm" type="button" variant="outline">
            {copied ? words.copied : words.copy}
          </Button>
        ) : null}
      </div>

      {fresh ? (
        <div className="space-y-1">
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-muted px-2 py-2 font-mono text-[length:var(--fs-small)]">
            {fresh}
          </pre>
          <p className="text-[length:var(--fs-small)] text-muted-foreground">{words.shownOnce}</p>
        </div>
      ) : null}

      {trouble ? (
        <p className="rounded-md border border-destructive/40 px-2 py-1 text-[length:var(--fs-small)] text-destructive">
          {trouble}
        </p>
      ) : null}
    </div>
  );
}
