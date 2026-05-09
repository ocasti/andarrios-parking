'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import AppShell from '@/src/presentation/components/layout/AppShell';
import RequireAdmin from '@/src/presentation/components/guards/RequireAdmin';
import Pagination from '@/src/presentation/components/ui/Pagination';
import { usePagedQuery } from '@/src/application/hooks/usePagedQuery';
import { doMarkAsPaid } from '@/src/application/actions';
import { usePricing } from '@/src/application/hooks/usePricing';
import { formatCOP } from '@/src/domain/services/FormatterService';
import { MonthKey } from '@/src/domain/value-objects/MonthKey';
import { getSupabase } from '@/lib/supabase';

interface ResidenteRow {
  id: string; cod: string; placa: string; tipo: 'carro' | 'moto'; nombre: string;
}

export default function MensualidadesPage() {
  const pricing = usePricing();
  const [filt, setFilt] = useState('');
  const mk = MonthKey.current().value;
  const mesLbl = MonthKey.current().label();

  const q = usePagedQuery<ResidenteRow>({
    table: 'residentes',
    select: 'id, cod, placa, tipo, nombre',
    isNull: ['deleted_at'],
    search: filt ? { columns: ['placa', 'nombre', 'cod'], value: filt } : undefined,
    order: { column: 'cod', ascending: true },
    pageSize: 25,
  }, [filt]);

  const [estados, setEstados] = useState<Record<string, 'pagado' | 'pendiente'>>({});
  useEffect(() => {
    const ids = q.rows.map((r) => r.id);
    if (ids.length === 0) { setEstados({}); return; }
    const sb = getSupabase();
    sb.from('mensualidades').select('residente_id, estado').eq('mes_key', mk).in('residente_id', ids).then(({ data }) => {
      const map: Record<string, 'pagado' | 'pendiente'> = {};
      (data ?? []).forEach((m: any) => { map[m.residente_id] = m.estado; });
      setEstados(map);
    });
  }, [q.rows, mk]);

  const [totales, setTotales] = useState<{ total: number; pagado: number; pendiente: number; cantPag: number; cantPend: number }>({ total: 0, pagado: 0, pendiente: 0, cantPag: 0, cantPend: 0 });
  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      let qRes: any = sb.from('residentes').select('id, tipo').is('deleted_at', null);
      if (filt) qRes = qRes.or(`placa.ilike.%${filt}%,nombre.ilike.%${filt}%,cod.ilike.%${filt}%`);
      const { data: residentesAll } = await qRes;
      if (!residentesAll) return;
      const ids = residentesAll.map((r: any) => r.id);
      const total = residentesAll.reduce((s: number, r: any) => s + (r.tipo === 'carro' ? pricing.carMonthlyRate : pricing.motorcycleMonthlyRate), 0);
      let pagado = 0, cantPag = 0, cantPend = 0;
      if (ids.length > 0) {
        const { data: mens } = await sb.from('mensualidades').select('residente_id, estado').eq('mes_key', mk).in('residente_id', ids);
        const tipoMap = new Map(residentesAll.map((r: any) => [r.id, r.tipo]));
        (mens ?? []).forEach((m: any) => {
          const t = tipoMap.get(m.residente_id);
          const v = t === 'carro' ? pricing.carMonthlyRate : pricing.motorcycleMonthlyRate;
          if (m.estado === 'pagado') { pagado += v; cantPag++; }
        });
        cantPend = residentesAll.length - cantPag;
      } else {
        cantPend = 0;
      }
      setTotales({ total, pagado, pendiente: total - pagado, cantPag, cantPend });
    })();
  }, [filt, mk, pricing, q.total]);

  return (
    <AppShell><RequireAdmin>
      <div className="ph"><h2>Mensualidades</h2><p>Estado de pagos — {mesLbl}</p></div>
      <div className="card">
        <div className="ch"><div className="ctit">📅 Estado del mes</div></div>
        <div className="sw"><input type="text" placeholder="Buscar placa, nombre o código…" value={filt} onChange={(e) => setFilt(e.target.value)} /></div>
        <div className="tw">
          {q.rows.length === 0 ? (<p className="empty">{q.loading ? 'Cargando…' : 'Sin residentes.'}</p>) : (
            <table>
              <thead><tr><th>Código</th><th>Placa</th><th>Propietario</th><th>Tipo</th><th>Valor</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {q.rows.map((r) => {
                  const est = estados[r.id] ?? 'pendiente';
                  const val = r.tipo === 'carro' ? pricing.carMonthlyRate : pricing.motorcycleMonthlyRate;
                  return (
                    <tr key={r.id}>
                      <td><b>{r.cod}</b></td><td><b>{r.placa}</b></td><td>{r.nombre}</td>
                      <td><span className={`bge b${r.tipo}`}>{r.tipo}</span></td><td>{formatCOP(val)}</td>
                      <td><span className={`bge ${est === 'pagado' ? 'bpagado' : 'bpendiente'}`}>{est === 'pagado' ? '✓ Pagado' : 'Pendiente'}</span></td>
                      <td>{est === 'pendiente' ? (<button className="btn bs xs" onClick={async () => {
                        await doMarkAsPaid({
                          residentId: r.id,
                          monthKey: mk,
                          rates: { carAmount: pricing.carMonthlyRate, motorcycleAmount: pricing.motorcycleMonthlyRate },
                        });
                        q.refresh();
                      }}>✓ Pagar</button>) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={q.page} totalPages={q.totalPages} total={q.total} pageSize={q.pageSize} loading={q.loading} onChange={q.setPage} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: '.9rem' }}>
          <div style={{ background: 'var(--leaf5)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5 }}>
            <b style={{ color: 'var(--leaf)' }}>{formatCOP(totales.pagado)}</b>{' '}
            <span style={{ color: 'var(--ink3)' }}>recaudado ({totales.cantPag})</span>
          </div>
          <div style={{ background: 'var(--gold3)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5 }}>
            <b style={{ color: '#7a4a00' }}>{formatCOP(totales.pendiente)}</b>{' '}
            <span style={{ color: 'var(--ink3)' }}>pendiente ({totales.cantPend})</span>
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5 }}>
            <b>{formatCOP(totales.total)}</b>{' '}
            <span style={{ color: 'var(--ink3)' }}>total mes</span>
          </div>
        </div>
      </div>
    </RequireAdmin></AppShell>
  );
}
