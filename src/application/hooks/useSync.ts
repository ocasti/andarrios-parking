'use client';
import { useEffect, useState } from 'react';
import { subscribeStatus, initSync } from '@/lib/sync';

export type SyncStatus = 'online' | 'offline' | 'syncing';

export interface SyncState {
  status: SyncStatus;
  pending: number;
}

export function useSync(): SyncState {
  const [state, setState] = useState<SyncState>({ status: 'online', pending: 0 });

  useEffect(() => {
    void initSync();
    const unsub = subscribeStatus((s, p) => setState({ status: s, pending: p }));
    return () => { unsub(); };
  }, []);

  return state;
}
