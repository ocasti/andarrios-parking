'use client';
import AppShell from '@/src/presentation/components/layout/AppShell';
import RequireGuardPin from '@/src/presentation/components/guards/RequireGuardPin';
import { useLive } from '@/lib/useLive';
import { getDB } from '@/src/infrastructure/db/AndarriosDB';
import { useAuth } from '@/src/application/hooks/useAuth';
import { doPerformDailyClose } from '@/src/application/actions';
import { formatCOP, formatTime, formatDate, colombiaDateStr } from '@/src/domain/services/FormatterService';

export default function CajaPage() {
  const { isAdmin } = useAuth();
  const todayStr = colombiaDateStr(new Date());
  const visitantesHoy = useLive(() => getDB().visitantes.filter((v) => !!v.salida && colombiaDateStr(v.salida!) === todayStr).toArray()) ?? [];
  const pagosHoy = useLive(() => getDB().pagos.filter((p) => colombiaDateStr(p.fecha) === todayStr).toArray()) ?? [];
  const cierres = useLive(() => getDB().cierres.toArray()) ?? [];

  const totalVis = visitantesHoy.reduce((s, h) => s + (h.total ?? 0), 0);
  const totalMens = pagosHoy.reduce((s, p) => s + p.monto, 0);
  const totalIVA = visitantesHoy.reduce((s, h) => s + (h.iva ?? 0), 0);

  async function cerrar() {
    if (!confirm('¿Confirmar el cierre del día?')) return;
    await doPerformDailyClose({
      visitorCharges: visitantesHoy.length,
      visitorTotal: totalVis,
      monthlyCharges: pagosHoy.length,
      monthlyTotal: totalMens,
      totalTax: totalIVA,
    });
  }

  return (
    <AppShell><RequireGuardPin>
      <div className="ph">
        <h2>Cierre de caja</h2>
        <p>{isAdmin ? 'Vista solo lectura — admin' : 'Corte diario de ingresos del parqueadero'}</p>
      </div>
      <div className="caja-hero">
        <h3 style={{ fontSize: 18, opacity: .85 }}>💰 Total recaudado hoy</h3>
        <div className="caja-monto">{formatCOP(totalVis + totalMens)}</div>
        <div className="caja-sub">Recaudo acumulado del día</div>
        <div className="caja-chips">
          <div className="caja-chip"><div className="cv">{visitantesHoy.length}</div><div className="cl">Cobros visitantes</div></div>
          <div className="caja-chip"><div className="cv">{formatCOP(totalVis)}</div><div className="cl">Subtotal visitantes</div></div>
          <div className="caja-chip"><div className="cv">{pagosHoy.length}</div><div className="cl">Mens. pagadas hoy</div></div>
          <div className="caja-chip"><div className="cv">{formatCOP(totalMens)}</div><div className="cl">Subtotal mensualidades</div></div>
        </div>
      </div>
      <div className="card">
        <div className="ch"><div className="ctit">🧾 Cobros de hoy</div>{!isAdmin && <button className="btn bp sm" onClick={cerrar}>🏁 Realizar cierre</button>}</div>
        <div className="tw">
          {visitantesHoy.length === 0 && pagosHoy.length === 0 ? (<p className="empty">Sin cobros registrados hoy.</p>) : (
            <table>
              <thead><tr><th>Horario</th><th>Placa</th><th>Tipo</th><th>Apto</th><th>Subtotal</th><th>IVA</th><th>Total</th></tr></thead>
              <tbody>
                {visitantesHoy.map((h) => (<tr key={h.id}><td>{formatTime(h.entrada)}–{h.salida ? formatTime(h.salida) : ''}</td><td><b>{h.placa}</b></td><td><span className="bge bvis">Visitante</span></td><td>{h.cod}</td><td>{formatCOP(h.base ?? 0)}</td><td>{formatCOP(h.iva ?? 0)}</td><td><b>{formatCOP(h.total ?? 0)}</b></td></tr>))}
                {pagosHoy.map((p) => (<tr key={p.id}><td>{formatTime(p.fecha)}</td><td><b>{p.placa}</b></td><td><span className="bge bpagado">Mensualidad</span></td><td>{p.cod}</td><td>{formatCOP(p.monto)}</td><td>$0</td><td><b>{formatCOP(p.monto)}</b></td></tr>))}
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
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>📅 {formatDate(c.fecha)}</div><div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{c.cobros_vis} visitantes · {c.cobros_mens} mensualidades · IVA: {formatCOP(c.total_iva)}</div></div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: 'var(--leaf)' }}>{formatCOP(c.total)}</div>
            </div>
          ))
        )}
      </div>
    </RequireGuardPin></AppShell>
  );
}
