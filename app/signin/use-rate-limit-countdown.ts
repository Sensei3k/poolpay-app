"use client";

import { useEffect, useState } from "react";

const TICK_MS = 1000;

export function useRateLimitCountdown(initialSecs: number | null): number | null {
  const [remaining, setRemaining] = useState<number | null>(initialSecs);
  const [lastInitial, setLastInitial] = useState<number | null>(initialSecs);

  if (initialSecs !== lastInitial) {
    setLastInitial(initialSecs);
    setRemaining(initialSecs);
  }

  useEffect(() => {
    if (initialSecs === null || initialSecs <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [initialSecs]);

  return remaining;
}
