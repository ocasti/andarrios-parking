'use client';
import { useEffect, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface PagedQueryOptions {
  table: string;
  select?: string;
  search?: { columns: string[]; value: string };
  filters?: Record<string, unknown>;
  isNull?: string[];
  notNull?: string[];
  order?: { column: string; ascending?: boolean };
  pageSize?: number;
}

export interface PagedQueryResult<T> {
  rows: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  setPage: (p: number) => void;
  refresh: () => void;
}

export function usePagedQuery<T = unknown>(opts: PagedQueryOptions, deps: unknown[] = []): PagedQueryResult<T> {
  const pageSize = opts.pageSize ?? 25;
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); }, deps);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const sb = getSupabase();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = sb.from(opts.table).select(opts.select ?? '*', { count: 'exact' });
        if (opts.filters) {
          for (const [k, v] of Object.entries(opts.filters)) {
            if (v !== undefined && v !== null && v !== '') q = q.eq(k, v);
          }
        }
        if (opts.isNull) for (const c of opts.isNull) q = q.is(c, null);
        if (opts.notNull) for (const c of opts.notNull) q = q.not(c, 'is', null);
        if (opts.search?.value) {
          const v = opts.search.value;
          const orStr = opts.search.columns.map((c) => `${c}.ilike.%${v}%`).join(',');
          q = q.or(orStr);
        }
        if (opts.order) q = q.order(opts.order.column, { ascending: opts.order.ascending ?? false });
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        q = q.range(from, to);
        const { data, count, error: err } = await q;
        if (cancelled) return;
        if (err) throw err;
        setRows((data ?? []) as T[]);
        setTotal(count ?? 0);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tick, ...deps]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { rows, page, pageSize, total, totalPages, loading, error, setPage, refresh };
}
