'use client';
import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

export function useLive<T>(query: () => Promise<T>, deps: any[] = []): T | undefined {
  const [val, setVal] = useState<T | undefined>(undefined);
  useEffect(() => {
    const sub = liveQuery(() => query()).subscribe({
      next: (v) => setVal(v as T),
      error: (e) => console.warn('liveQuery error', e),
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return val;
}
