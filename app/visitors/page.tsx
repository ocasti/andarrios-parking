'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import AppShell from '@/src/presentation/components/layout/AppShell';
import RequireGuardPin from '@/src/presentation/components/guards/RequireGuardPin';
import AptoSelector from '@/src/presentation/components/ui/AptoSelector';
import { useLive } from '@/lib/useLive';
import { useAuth } from '@/src/application/hooks/useAuth';
import { getDB } from '@/src/infrastructure/db/AndarriosDB';
import { usePricing } from '@/src/application/hooks/usePricing';
import { doCheckInVisitor, doCheckOutVisitor } from '@/src/application/actions';
import { calculateCharge } from '@/src/domain/services/CobroService';
import { formatCOP, formatTime } from '@/src/domain/services/FormatterService';
import { getSupabase } from '@/lib/supabase';
import type { VehicleType } from '@/src/domain/entities';

export default function VisitantesPage() {
  const { isAdmin } = useAuth();
  const pricing = usePricing();

  const visitantes = useLive(() => getDB().visitantes.filter((v) => !v.salida).reverse().toArray()) ?? [];
  const bloqueados = useLive(() => getDB().bloqueados.filter((b) => !b.desbloqueado_at).toArray()) ?? [];

  const capacidad = pricing.visitorCapacity;
  const ocupados = visitantes.length;
  const lleno = capacidad > 0 && ocupados >= capacidad;

  const [tower, setTower] = useState('');
  const [apt, setApt] = useState('');
  const [tipo, setTipo] = useState<VehicleType>('car');
  const [placa, setPlaca] = useState('');
  const [nombre, setNombre] = useState('');
  const [tel, setTel] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(i);
  }, []);

  const blqMap = new Map(bloqueados.map((b) => [b.cod, b]));
  const aptoBloqueado = apt && blqMap.get(apt);

  async function submit() {
    setError('');
    if (!apt) return setError('Selecciona torre y apartamento.');
    if (!placa.trim()) return setError('Ingresa la placa del vehículo.');
    if (aptoBloqueado) return setError(`Apto ${apt} bloqueado: ${(aptoBloqueado as any).motivo}.`);
    const placaUp = placa.toUpperCase().trim();
    if (visitantes.find((v) => v.placa === placaUp)) return setError(`La placa ${placaUp} ya está en el parqueadero.`);

    if (capacidad > 0) {
      try {
        const sb = getSupabase();
        const { count } = await sb.from('visitantes').select('id', { count: 'exact', head: true }).is('salida', null);
        if ((count ?? 0) >= capacidad) {
          return setError(`🚫 Parqueadero lleno (${count}/${capacidad}). No se puede registrar más visitantes.`);
        }
      } catch {
        // offline — trust local count
      }
    }

    const since = new Date(Date.now() - pricing.minHoursForCourtesy * 3600000).toISOString();
    const recentRows = await getDB().visitantes
      .where('placa')
      .equals(placaUp)
      .filter((v) => v.salida != null && v.salida >= since)
      .toArray();
    const recentHistory = recentRows.map((v) => ({ checkedOutAt: v.salida! }));

    await doCheckInVisitor({
      aptCode: apt,
      plate: placaUp,
      vehicleType: tipo,
      name: nombre.trim() || 'Visitante',
      phone: tel.trim() || null,
      minHoursForCourtesy: pricing.minHoursForCourtesy,
      recentHistory,
    });
    setTower(''); setApt(''); setPlaca(''); setNombre(''); setTel('');
  }

  const [salidaId, setSalidaId] = useState<string | null>(null);
  const visSalida = visitantes.find((v) => v.id === salidaId);
  const calc = visSalida ? (() => {
    const hours = (Date.now() - new Date(visSalida.entrada).getTime()) / 3600000;
    const courtesyApplies = visSalida.cortesia_aplica ?? true;
    const c = calculateCharge({
      hours,
      hourlyRate: pricing.hourlyRate,
      freeHours: pricing.freeHours,
      taxRate: pricing.iva,
      courtesyApplies,
    });
    return { hours, courtesyApplies, ...c };
  })() : null;

  return (
    <AppShell><RequireGuardPin>
      <div className="ph">
        <h2>Visitantes</h2>
        <p>{isAdmin ? 'Vista solo lectura — admin' : 'Registro de ingreso y salida con cobro automático'}</p>
      </div>
      <div className="al ai">ℹ️ Primeras <b>{pricing.freeHours}</b> horas gratis. Luego <b>{formatCOP(pricing.hourlyRate)}</b>/hora adicional completa.</div>

      {capacidad > 0 && (
        <div className={`al ${lleno ? 'ae' : ocupados / capacidad >= 0.8 ? 'aw' : 'aok'}`} style={{ alignItems: 'center' }}>
          {lleno ? '🚫' : ocupados / capacidad >= 0.8 ? '⚠️' : '🅿️'}
          <div style={{ flex: 1 }}>
            <b>{ocupados}/{capacidad}</b> cupos ocupados
            {lleno && ' — Parqueadero lleno. No se pueden registrar más visitantes hasta que alguien salga.'}
            {!lleno && ocupados / capacidad >= 0.8 && ` — Quedan ${capacidad - ocupados} cupos.`}
          </div>
        </div>
      )}

      {!isAdmin && (
      <div className="card">
        <div className="ctit" style={{ marginBottom: '1rem' }}>🛬 Registrar ingreso{lleno && ' (deshabilitado)'}</div>
        <div className="g3" style={{ marginBottom: 10 }}>
          <AptoSelector tower={tower} apt={apt} onChange={(t, a) => { setTower(t); setApt(a); }} />
        </div>
        {aptoBloqueado && (<div className="al ae">🚫 El apto <b>{apt}</b> está bloqueado. Motivo: {(aptoBloqueado as any).motivo}.</div>)}
        <div className="g4" style={{ marginBottom: 10 }}>
          <div className="fld"><label>Tipo</label><select value={tipo} onChange={(e) => setTipo(e.target.value as VehicleType)}><option value="car">🚗 Carro</option><option value="motorcycle">🏍️ Moto</option></select></div>
          <div className="fld"><label>Placa</label><input type="text" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="ABC-123" maxLength={7} /></div>
          <div className="fld"><label>Nombre visitante (opcional)</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
          <div className="fld"><label>Teléfono (opcional)</label><input type="text" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="300 000 0000" /></div>
        </div>
        {error && <div className="al ae">⚠️ {error}</div>}
        <button className="btn bp" onClick={submit} disabled={lleno}>
          {lleno ? '🚫 Sin cupos disponibles' : '🛬 Registrar ingreso'}
        </button>
      </div>
      )}
      <div className="card">
        <div className="ch"><div className="ctit">🅿️ En parqueadero ahora ({visitantes.length})</div></div>
        <div className="tw">
          {visitantes.length === 0 ? (<p className="empty">No hay visitantes activos.</p>) : (
            <table>
              <thead><tr><th>Placa</th><th>Tipo</th><th>Apto</th><th>Nombre</th><th>Tel.</th><th>Ingreso</th><th>Tiempo</th><th>Cobro est.</th><th></th></tr></thead>
              <tbody>{visitantes.map((v) => {
                const hours = (now - new Date(v.entrada).getTime()) / 3600000;
                const courtesyApplies = v.cortesia_aplica ?? true;
                const c = calculateCharge({ hours, hourlyRate: pricing.hourlyRate, freeHours: pricing.freeHours, taxRate: pricing.iva, courtesyApplies });
                const hStr = hours < 1 ? `${Math.round(hours * 60)}min` : `${hours.toFixed(1)}h`;
                return (<tr key={v.id}>
                  <td><b>{v.placa}</b>{!courtesyApplies && <span className="bge bpendiente" title="Reingreso reciente — sin horas gratis" style={{ marginLeft: 6 }}>⚠️ Sin cortesía</span>}</td>
                  <td><span className="bge bvis">{v.tipo === 'carro' ? '🚗' : '🏍️'} {v.tipo}</span></td>
                  <td>{v.cod}</td><td>{v.nombre}</td>
                  <td style={{ color: 'var(--ink3)' }}>{v.tel || '—'}</td>
                  <td>{formatTime(v.entrada)}</td><td>{hStr}</td>
                  <td>{c.base === 0 ? <span className="bge bgratis">Gratis</span> : formatCOP(c.total)}</td>
                  <td>{isAdmin ? '—' : <button className="btn bs sm" onClick={() => setSalidaId(v.id)}>🛫 Salida</button>}</td>
                </tr>); })}</tbody>
            </table>
          )}
        </div>
      </div>
      {visSalida && calc && (
        <div className="ov open" onClick={(e) => { if (e.target === e.currentTarget) setSalidaId(null); }}>
          <div className="modal">
            <div className="mh">🧾 Registrar salida y cobro</div>
            <div className="crow"><span>Placa</span><b>{visSalida.placa}</b></div>
            <div className="crow"><span>Tipo</span><span>{visSalida.tipo}</span></div>
            <div className="crow"><span>Apto visitado</span><span>{visSalida.cod}</span></div>
            <div className="crow"><span>Ingreso</span><span>{formatTime(visSalida.entrada)}</span></div>
            <div className="crow"><span>Tiempo total</span><span>{calc.hours.toFixed(2)} h</span></div>
            {calc.courtesyApplies ? (
              <div className="crow"><span style={{ color: 'var(--leaf3)' }}>Horas gratis (cortesía)</span><span style={{ color: 'var(--leaf3)' }}>{Math.min(calc.hours, pricing.freeHours).toFixed(1)} h</span></div>
            ) : (
              <div className="crow"><span style={{ color: 'var(--red)' }}>Sin cortesía (reingreso &lt;{pricing.minHoursForCourtesy}h)</span><span style={{ color: 'var(--red)' }}>0 h</span></div>
            )}
            <div className="crow"><span>Horas cobradas ({calc.chargedHours}h × {formatCOP(pricing.hourlyRate)})</span><span>{formatCOP(calc.base)}</span></div>
            <div className="crow"><span>IVA ({pricing.iva}%)</span><span>{formatCOP(calc.iva)}</span></div>
            <div className="ctot"><span>TOTAL</span><span style={{ fontSize: 22 }}>{formatCOP(calc.total)}</span></div>
            <div className="mf">
              <button className="btn bo" onClick={() => setSalidaId(null)}>Cancelar</button>
              <button className="btn bp" onClick={async () => {
                await doCheckOutVisitor({
                  visitorId: visSalida.id,
                  hourlyRate: pricing.hourlyRate,
                  freeHours: pricing.freeHours,
                  taxRate: pricing.iva,
                });
                setSalidaId(null);
              }}>✅ Confirmar cobro</button>
            </div>
          </div>
        </div>
      )}
    </RequireGuardPin></AppShell>
  );
}
