"use client";

import { useEffect, useRef, useState } from "react";

export type Frame<T> = [delay: number, patch: Partial<T>];

export function typing<T>(
  text: string,
  speed: number,
  patch: (typed: string) => Partial<T>
): Frame<T>[] {
  return Array.from(
    text,
    (_, i): Frame<T> => [speed, patch(text.slice(0, i + 1))]
  );
}

export function useScript<T extends object>(
  initial: T,
  frames: Frame<T>[],
  loopPause = 3600
) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState(
        Object.assign({}, initial, ...frames.map(([, patch]) => patch)) as T
      );
      return;
    }

    let timers: number[] = [];

    const stop = () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers = [];
    };

    const play = () => {
      stop();
      setState(initial);

      let at = 0;
      for (const [delay, patch] of frames) {
        at += delay;
        timers.push(
          window.setTimeout(() => setState((s) => ({ ...s, ...patch })), at)
        );
      }
      timers.push(window.setTimeout(play, at + loopPause));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else stop();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [initial, frames, loopPause]);

  return [ref, state] as const;
}
