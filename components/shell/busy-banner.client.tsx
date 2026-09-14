"use client";

import { useEffect, useState } from "react";

// КРАСНАЯ ПОЛОСА «ИИ-БРАУЗЕР РАБОТАЕТ» ПОД ШАПКОЙ (196-8, 2026-09-14).
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА, ДОСЛОВНО: «Создай в интерфейсе индикатор загрузки инструмента. Что в данный момент идёт работа пусть это
// выглядит как красный Tic aion на всю ширину страницы которая опускается ниже хедер ai-browser.aifa.dev» · «as red notification».
//
// 🔒 ИСТОЧНИК — ОТКРЫТЫЙ `/v1/health` ТОЙ ЖЕ СЛУЖБЫ: длина одной очереди на процесс (`engine.queue.length`) и состояние движка.
// Ключ не нужен, секрет в браузер человека не уезжает. Полоса говорит о СЛУЖБЕ целиком — работу любого зовущего (память, API,
// стенд), а не только того, кто смотрит страницу: браузер у сервера один.
// 🔒 ПОЛОСЫ НЕТ, КОГДА ОЧЕРЕДЬ ПУСТА И ДВИЖОК ПОДНЯТ: красное, стоящее всегда, к третьему разу не значит ничего.
// 🔒 В СКРЫТОЙ ВКЛАДКЕ ОПРОС РЕЖЕ (10 с): фоновая вкладка, которая дёргает сервер каждые две секунды, — лишняя нагрузка на
// ограниченный сервер, о котором и сказал владелец.
// 🛑 ОТКАЗ ОПРОСА — ТОЖЕ КРАСНАЯ ПОЛОСА «движок не запущен»: служба, до которой не достучаться, для человека не работает.

export type BusyWords = { busy: string; down: string };

type State = { down: boolean; queue: number };

export function BusyBanner({ words }: { words: BusyWords }) {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const r = await fetch("/v1/health", { cache: "no-store" });
        const j = (await r.json()) as { engine?: { queue?: { length?: number }; status?: string } };
        if (alive) setState({ down: j?.engine?.status !== "up", queue: Number(j?.engine?.queue?.length ?? 0) });
      } catch {
        if (alive) setState({ down: true, queue: 0 });
      }
      if (alive) timer = setTimeout(tick, document.hidden ? 10_000 : 2_000);
    };
    void tick();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  if (!state || (!state.down && state.queue === 0)) return null;

  const text = state.down ? words.down : words.busy.replace("{n}", String(state.queue));

  return (
    <div
      aria-live="polite"
      className="sticky top-14 z-30 flex w-full items-center justify-center gap-2 bg-red-600 px-6 py-2 text-center text-[length:var(--fs-small)] font-medium text-white md:px-8"
      data-ai-browser-busy={state.down ? "down" : "busy"}
      role="status"
    >
      <span aria-hidden="true" className="inline-block size-2 animate-pulse rounded-full bg-white" />
      {text}
    </div>
  );
}
