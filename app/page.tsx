'use client';
import AppShell from '@/components/AppShell';
import { useLive } from '@/lib/useLive';
import { db } from '@/lib/db';
import { cop, fmtT, fmtD, mesKey } from '@/lib/actions';

export default function Dashboard() {
  const residentes = useLive(() => db().residentes.filter((r) => !r.deleted_at).toArray()) ?? [];
  const visitantes = useLive(() => db().visitantes.filter((v) => !v.salida).toArray()) ?? [];
  const actividad = useLive(() => db().actividad.orderBy('ts').reverse().limit(15).toArray()) ?? [];
  const cierres = useLive(() => db().cierres.toArray()) ?? [];

  const todayStr = new Date().toDateString();
  const historial = useLive(() => db().visitantes.filter((v) => !!v.salida && new Date(v.salida!).toDateString() === todayStr).toArray()) ?? [];
  const pagos = useLive(() => db().pagos.filter((p) => new Date(p.fecha).toDateString() === todayStr).toArray()) ?? [];

  const carros = residentes.filter((r) => r.tipo === 'carro').length;
  const motos = residentes.filter((r) => r.tipo === 'moto').length;
  const visActivos = visitantes.length;
  const recHoy = historial.reduce((s, h) => s + (h.total ?? 0), 0) + pagos.reduce((s, p) => s + p.monto, 0);

  return (
    <AppShell>
      <div className="ph">
        <h2>Dashboard</h2>
        <p>Resumen en tiempo real del parqueadero Andarríos</p>
      </div>
      <div className="mets">
        <div className="met"><div className="met-ic">🚗</div><div className="met-v">{carros}</div><div className="met-l">Carros residentes</div></div>
        <div className="met"><div className="met-ic">🏍️</div><div className="met-v">{motos}</div><div className="met-l">Motos residentes</div></div>
        <div className="met warn"><div className="met-ic">👤</div><div className="met-v">{visActivos}</div><div className="met-l">Visitantes activos</div></div>
        <div className="met"><div className="met-ic">💵</div><div className="met-v">{cop(recHoy)}</div><div className="met-l">Recaudo hoy</div></div>
      </div>
      <div className="card">
        <div className="ch">
          <div className="ctit">📡 Actividad reciente</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{cierres.length} cierres · {actividad.length} eventos</div>
        </div>
        {actividad.length === 0 ? (<p className="empty">Sin actividad aún</p>) : (
          <div>{actividad.map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 10, marginBottom: '.7rem' }}>
              <span style={{ width: 8, height: 8, marginTop: 6, borderRadius: 4, background: 'var(--leaf3)', flexShrink: 0 }} />
              <div><p style={{ fontSize: 13 }}>{a.msg}</p><small style={{ color: 'var(--ink3)', fontSize: 11 }}>{fmtT(a.ts)} · {fmtD(a.ts)}</small></div>
            </div>
          ))}</div>
        )}
      </div>
    </AppShell>
  );
}
