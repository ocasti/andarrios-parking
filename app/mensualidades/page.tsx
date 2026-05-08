'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useLive } from '@/lib/useLive';
import { db } from '@/lib/db';
import { marcarPagado, mesKey, cop } from '@/lib/actions';

export default function MensualidadesPage() {
  const residentes = useLive(() => db().residentes.filter((r) => !r.deleted_at).toArray()) ?? [];
  const mensualidades = useLive(() => db().mensualidades.toArray()) ?? [];
  const tarifas = useLive(() => db().tarifas.get(1)) ?? { id: 1, carro_mes: 20000, moto_mes: 10000, vis_hora: 1000, horas_gratis: 2, iva: 19 } as any;
  const [filt, setFilt] = useState('');
  const mk = mesKey();
  const mesLbl = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const estadoDe = (resId: string) => mensualidades.find((m) => m.residente_id === resId && m.mes_key === mk)?.estado ?? 'pendiente';
  const lista = filt ? residentes.filter((r) => r.placa.toLowerCase().includes(filt.toLowerCase()) || r.nombre.toLowerCase().includes(filt.toLowerCase()) || r.cod.toLowerCase().includes(filt.toLowerCase())) : residentes;
  const total = lista.reduce((s, r) => s + (r.tipo === 'carro' ? tarifas.carro_mes : tarifas.moto_mes), 0);
  const pagado = lista.filter((r) => estadoDe(r.id) === 'pagado').reduce((s, r) => s + (r.tipo === 'carro' ? tarifas.carro_mes : tarifas.moto_mes), 0);
  return (
    <AppShell>
      <div className="ph"><h2>Mensualidades</h2><p>Estado de pagos — {mesLbl}</p></div>
      <div className="card">
        <div className="ch"><div className="ctit">📅 Estado del mes</div></div>
        <div className="sw"><input type="text" placeholder="Buscar placa, nombre, apto…" value={filt} onChange={(e) => setFilt(e.target.value)} /></div>
        <div className="tw">
          {lista.length === 0 ? (<p className="empty">Sin residentes.</p>) : (
            <table><thead><tr><th>Código</th><th>Placa</th><th>Propietario</th><th>Tipo</th><th>Valor</th><th>Estado</th><th></th></tr></thead><tbody>
              {lista.map((r) => { const est = estadoDe(r.id); const val = r.tipo === 'carro' ? tarifas.carro_mes : tarifas.moto_mes; return (<tr key={r.id}>
                <td><b>{r.cod}</b></td><td><b>{r.placa}</b></td><td>{r.nombre}</td>
                <td><span className={`bge b${r.tipo}`}>{r.tipo}</span></td><td>{cop(val)}</td>
                <td><span className={`bge ${est === 'pagado' ? 'bpagado' : 'bpendiente'}`}>{est === 'pagado' ? '✓ Pagado' : 'Pendiente'}</span></td>
                <td>{est === 'pendiente' ? (<button className="btn bs xs" onClick={() => void marcarPagado(r.id, tarifas)}>✓ Pagar</button>) : '—'}</td>
              </tr>); })}
            </tbody></table>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: '.9rem' }}>
          <div style={{ background: 'var(--leaf5)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5 }}><b style={{ color: 'var(--leaf)' }}>{cop(pagado)}</b> <span style={{ color: 'var(--ink3)' }}>recaudado</span></div>
          <div style={{ background: 'var(--gold3)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5 }}><b style={{ color: '#7a4a00' }}>{cop(total - pagado)}</b> <span style={{ color: 'var(--ink3)' }}>pendiente</span></div>
          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5 }}><b>{cop(total)}</b> <span style={{ color: 'var(--ink3)' }}>total mes</span></div>
        </div>
      </div>
    </AppShell>
  );
}
