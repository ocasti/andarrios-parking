'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import RequireAdmin from '@/components/RequireAdmin';
import Pagination from '@/components/Pagination';
import { usePagedQuery } from '@/lib/usePagedQuery';
import { marcarPagado, mesKey, cop } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase';
import { useLive } from '@/lib/useLive';
import { db } from '@/lib/db';

interface ResidenteRow {
  id: string; cod: string; placa: string; tipo: 'carro' | 'moto'; nombre: string;
}

export default function MensualidadesPage() {
  const tarifas = useLive(() => db().tarifas.get(1)) ?? { id: 1, carro_mes: 20000, moto_mes: 10000, vis_hora: 1000, horas_gratis: 2, iva: 19 } as any;
  const [filt, setFilt] = useState('');
  const mk = mesKey();
  const mesLbl = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  const q = usePagedQuery<ResidenteRow>({
    table: 'residentes',
    select: 'id, cod, placa, tipo, nombre',
    isNull: ['deleted_at'],
    search: filt ? { columns: ['placa', 'nombre', 'cod'], value: filt } : undefined,
    order: { column: 'cod', ascending: true },
    pageSize: 25,
  }, [filt]);

  // Para los IDs de la página actual, traemos el estado de mensualidad del mes
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

  // Totales del mes (solo del filtro actual, server side)
  const [totales, setTotales] = useState<{ total: number; pagado: number; pendiente: number; cantPag: number; cantPend: number }>({ total: 0, pagado: 0, pendiente: 0, cantPag: 0, cantPend: 0 });
  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      let qRes: any = sb.from('residentes').select('id, tipo').is('deleted_at', null);
      if (filt) qRes = qRes.or(`placa.ilike.%${filt}%,nombre.ilike.%${filt}%,cod.ilike.%${filt}%`);
      const { data: residentesAll } = await qRes;
      if (!residentesAll) return;
      const ids = residentesAll.map((r: any) => r.id);
      const total = residentesAll.reduce((s: number, r: any) => s + (r.tipo === 'carro' ? tarifas.carro_mes : tarifas.moto_mes), 0);
      let pagado = 0, cantPag = 0, cantPend = 0;
      if (ids.length > 0) {
        const { data: mens } = await sb.from('mensualidades').select('residente_id, estado').eq('mes_key', mk).in('residente_id', ids);
        const tipoMap = new Map(residentesAll.map((r: any) => [r.id, r.tipo]));
        (mens ?? []).forEach((m: any) => {
          const t = tipoMap.get(m.residente_id);
          const v = t === 'carro' ? tarifas.carro_mes : tarifas.moto_mes;
          if (m.estado === 'pagado') { pagado += v; cantPag++; }
        });
        cantPend = residentesAll.length - cantPag;
      } else {
        cantPend = 0;
      }
      setTotales({ total, pagado, pendiente: total - pagado, cantPag, cantPend });
    })();
  }, [filt, mk, tarifas, q.total]);

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
                  const val = r.tipo === 'carro' ? tarifas.carro_mes : tarifas.moto_mes;
                  return (
                    <tr key={r.id}>
                      <td><b>{r.cod}</b></td><td><b>{r.placa}</b></td><td>{r.nombre}</td>
                      <td><span className={`bge b${r.tipo}`}>{r.tipo}</span></td><td>{cop(val)}</td>
                      <td><span className={`bge ${est === 'pagado' ? 'bpagado' : 'bpendiente'}`}>{est === 'pagado' ? '✓ Pagado' : 'Pendiente'}</span></td>
                      <td>{est === 'pendiente' ? (<button className="btn bs xs" onClick={async () => { await marcarPagado(r.id, tarifas); q.refresh(); }}>✓ Pagar</button>) : '—'}</td>
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
            <b style={{ color: 'var(--leaf)' }}>{cop(totales.pagado)}</b>{' '}
            <span style={{ color: 'var(--ink3)' }}>recaudado ({totales.cantPag})</span>
          </div>
          <div style={{ background: 'var(--gold3)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5 }}>
            <b style={{ color: '#7a4a00' }}>{cop(totales.pendiente)}</b>{' '}
            <span style={{ color: 'var(--ink3)' }}>pendiente ({totales.cantPend})</span>
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5 }}>
            <b>{cop(totales.total)}</b>{' '}
            <span style={{ color: 'var(--ink3)' }}>total mes</span>
          </div>
        </div>
      </div>
    </RequireAdmin></AppShell>
  );
}
