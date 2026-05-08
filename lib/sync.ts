'use client';
// =============================================================================
// SYNC ENGINE — offline-first
// 1. Toda escritura se guarda en IndexedDB y se encola en `queue`.
// 2. El runner procesa la cola en orden cuando hay red.
// 3. Polling de pull cada 30s + realtime para mantener IndexedDB sincronizada.
// =============================================================================

import { getSupabase } from './supabase';
import { getDB } from '@/src/infrastructure/db/AndarriosDB';
import type { QueueRow } from '@/src/infrastructure/db/AndarriosDB';

type SyncOp = {
  table: string;
  op: 'insert' | 'update' | 'upsert' | 'delete';
  payload: Record<string, unknown>;
  where?: Record<string, unknown>;
};

type Status = 'online' | 'offline' | 'syncing';
type Listener = (s: Status, pending: number) => void;
const listeners = new Set<Listener>();
let currentStatus: Status = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
let pendingCount = 0;

export function subscribeStatus(fn: Listener) {
  listeners.add(fn);
  fn(currentStatus, pendingCount);
  return () => listeners.delete(fn);
}
function emit() { listeners.forEach((l) => l(currentStatus, pendingCount)); }
function setStatus(s: Status) { currentStatus = s; emit(); }
async function refreshPending() {
  pendingCount = await getDB().queue.count();
  emit();
}

// ============== ENQUEUE ==============
export async function enqueue(op: SyncOp) {
  const row: QueueRow = { ts: Date.now(), op, attempts: 0 };
  await getDB().queue.add(row);
  await refreshPending();
  // intento inmediato
  void runQueue();
}

// ============== RUNNER ==============
let isRunning = false;
export async function runQueue() {
  if (isRunning) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    setStatus('offline');
    return;
  }
  isRunning = true;
  setStatus('syncing');
  try {
    const sb = getSupabase();
    while (true) {
      const item = await getDB().queue.orderBy('id').first();
      if (!item) break;
      try {
        await applyOp(sb, item.op);
        if (item.id !== undefined) await getDB().queue.delete(item.id);
      } catch (err: any) {
        const msg = String(err?.message ?? err);
        if (item.id !== undefined) {
          await getDB().queue.update(item.id, {
            attempts: item.attempts + 1,
            lastError: msg.slice(0, 500),
          });
        }
        if (/network|fetch|failed|offline/i.test(msg) || (typeof navigator !== 'undefined' && !navigator.onLine)) {
          setStatus('offline');
          break;
        }
        if (item.attempts >= 5) {
          if (item.id !== undefined) await getDB().queue.delete(item.id);
          console.warn('[sync] Op descartada tras 5 intentos:', item.op, msg);
          continue;
        }
        break;
      }
    }
  } finally {
    isRunning = false;
    await refreshPending();
    if (typeof navigator !== 'undefined' && navigator.onLine) setStatus('online');
  }
}

async function applyOp(sb: ReturnType<typeof getSupabase>, op: SyncOp) {
  const t = sb.from(op.table);
  if (op.op === 'insert') {
    const { error } = await t.insert(op.payload);
    if (error) throw error;
  } else if (op.op === 'upsert') {
    const { error } = await t.upsert(op.payload, { onConflict: 'id' });
    if (error) throw error;
  } else if (op.op === 'update') {
    let q: any = t.update(op.payload);
    for (const [k, v] of Object.entries(op.where ?? {})) q = q.eq(k, v);
    const { error } = await q;
    if (error) throw error;
  } else if (op.op === 'delete') {
    let q: any = t.delete();
    for (const [k, v] of Object.entries(op.where ?? {})) q = q.eq(k, v);
    const { error } = await q;
    if (error) throw error;
  }
}

export async function pullAll() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  const sb = getSupabase();
  try {
    setStatus('syncing');
    await Promise.all([
      pullTable('residentes', 'residentes', 'updated_at'),
      pullTable('visitantes', 'visitantes', 'updated_at'),
      pullTable('mensualidades', 'mensualidades', 'updated_at'),
      pullTable('pagos_mensualidades', 'pagos', 'fecha'),
      pullTable('bloqueados', 'bloqueados', 'updated_at'),
      pullTable('placas_aprobadas', 'placas_aprobadas', 'fecha_aprobacion'),
      pullTable('cierres_caja', 'cierres', 'fecha'),
      pullTable('actividad', 'actividad', 'ts', 200),
      pullTarifas(),
    ]);
  } catch (err) {
    console.warn('[sync] pull error', err);
  } finally {
    if (typeof navigator !== 'undefined' && navigator.onLine) setStatus('online');
  }

  async function pullTable(remote: string, local: string, order = 'updated_at', limit = 1000) {
    try {
      const { data, error } = await sb.from(remote).select('*').order(order, { ascending: false }).limit(limit);
      if (error) throw error;
      const tbl = (getDB() as any)[local];
      if (Array.isArray(data) && tbl) {
        await tbl.bulkPut(data);
      }
    } catch (e) {
      console.warn('[sync] pullTable', remote, e);
    }
  }

  async function pullTarifas() {
    try {
      const { data } = await sb.from('tarifas').select('*').eq('id', 1).maybeSingle();
      if (data) await getDB().tarifas.put(data);
    } catch (e) {}
  }
}

let initialized = false;
export async function initSync() {
  if (initialized) return;
  initialized = true;

  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => { setStatus('online'); void runQueue(); void pullAll(); });
  window.addEventListener('offline', () => setStatus('offline'));

  await refreshPending();
  await pullAll();
  void runQueue();

  setInterval(() => { void pullAll(); void runQueue(); }, 30000);

  try {
    const sb = getSupabase();
    const tables: Array<[string, string]> = [
      ['residentes', 'residentes'],
      ['visitantes', 'visitantes'],
      ['mensualidades', 'mensualidades'],
      ['pagos_mensualidades', 'pagos'],
      ['bloqueados', 'bloqueados'],
      ['placas_aprobadas', 'placas_aprobadas'],
      ['cierres_caja', 'cierres'],
      ['actividad', 'actividad'],
    ];
    for (const [remote, local] of tables) {
      sb.channel(`rt-${remote}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: remote }, async (payload: any) => {
          const row = payload.new ?? payload.old;
          const tbl = (getDB() as any)[local];
          if (!tbl) return;
          if (payload.eventType === 'DELETE') {
            if (row?.id) await tbl.delete(row.id);
          } else if (row) {
            await tbl.put(row);
          }
        })
        .subscribe();
    }
  } catch (e) {
    console.warn('[sync] realtime init failed', e);
  }
}
