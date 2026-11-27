import { useEffect, useState } from 'react';

// Re-renders the page every few seconds, so texts like "2 min ago" stay correct
export function useTick(intervalMs: number): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}