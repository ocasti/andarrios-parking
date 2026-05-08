'use client';
import AppShell from '@/components/AppShell';
import { useLive } from '@/lib/useLive';
import { db } from '@/lib/db';
import { realizarCierre, cop, fmtT, fmtD } from '@/lib/actions';

export default function CajaPage() {
  const todayStr = new Date().toDateString();
  const visitantesHoy = useLive(() => db().visitantes.filter((v) => !!v.salida && new Date(v.salida!).toDateString() === todayStr).toArray()) ?? [];
  const pagosHoy = useLive(() => db().pagos.filter((p) => new Date(p.fecha).toDateString() === todayStr).toArray()) ?? [];
  const cierres = useLive(() => db().cierres.toArray()) ?? [];

  const totalVis = visitantesHoy.reduce((s, h) => s + (h.total ?? 0), 0);
  const totalMens = pagosHoy.reduce((s, p) => s + p.monto, 0);
  const totalIVA = visitantesHoy.reduce((s, h) => s + (h.iva ?? 0), 0);

  async function cerrar() {
    if (!confirm('¿Confirmar el cierre del día?')) return;
    await realizarCierre({ cobros_vis: visitantesHoy.length, total_vis: totalVis, cobros_mens: pagosHoy.length, total_mens: totalMens, total_iva: totalIVA, total: totalVis + totalMens });
  }

  return (
    <AppShell>
      <div className="ph"><h2>Cierre de caja</h2><p>Corte diario de ingresos del parqueadero</p></div>
      <div className="caja-hero">
        <h3 style={{ fontSize: 18, opacity: .85 }}>💰 Total recaudado hoy</h3>
        <div className="caja-monto">{cop(totalVis + totalMens)}</div>
        <div className="caja-sub">Recaudo acumulado del día</div>
        <div className="caja-chips">
          <div className="caja-chip"><div className="cv">{visitantesHoy.length}</div><div className="cl">Cobros visitantes</div></div>
          <div className="caja-chip"><div className="cv">{cop(totalVis)}</div><div className="cl">Subtotal visitantes</div></div>
          <div className="caja-chip"><div className="cv">{pagosHoy.length}</div><div className="cl">Mens. pagadas hoy</div></div>
          <div className="caja-chip"><div className="cv">{cop(totalMens)}</div><div className="cl">Subtotal mensualidades</div></div>
        </div>
      </div>
      <div className="card">
        <div className="ch"><div className="ctit">🧾 Cobros de hoy</div><button className="btn bp sm" onClick={cerrar}>🏁 Realizar cierre</button></div>
        <div className="tw">
          {visitantesHoy.length === 0 && pagosHoy.length === 0 ? (<p className="empty">Sin cobros registrados hoy.</p>) : (
            <table>
              <thead><tr><th>Horario</th><th>Placa</th><th>Tipo</th><th>Apto</th><th>Subtotal</th><th>IVA</th><th>Total</th></tr></thead>
              <tbody>
                {visitantesHoy.map((h) => (<tr key={h.id}><td>{fmtT(h.entrada)}–{h.salida ? fmtT(h.salida) : ''}</td><td><b>{h.placa}</b></td><td><span className="bge bvis">Visitante</span></td><td>{h.cod}</td><td>{cop(h.base ?? 0)}</td><td>{cop(h.iva ?? 0)}</td><td><b>{cop(h.total ?? 0)}</b></td></tr>))}
                {pagosHoy.map((p) => (<tr key={p.id}><td>{fmtT(p.fecha)}</td><td><b>{p.placa}</b></td><td><span className="bge bpagado">Mensualidad</span></td><td>{p.cod}</td><td>{cop(p.monto)}</td><td>$0</td><td><b>{cop(p.monto)}</b></td></tr>))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="card">
        <div className="ctit" style={{ marginBottom: '1rem' }}>🕘 Historial de cierres</div>
        {cierres.length === 0 ? (<p className="empty">No hay cierres anteriores.</p>) : (
          cierres.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--bd)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, background: 'var(--bg3)' }}>
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>📅 {fmtD(c.fecha)}</div><div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{c.cobros_vis} visitantes · {c.cobros_mens} mensualidades · IVA: {cop(c.total_iva)}</div></div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: 'var(--leaf)' }}>{cop(c.total)}</div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
