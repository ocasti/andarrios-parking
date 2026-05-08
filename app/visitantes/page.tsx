'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import RequireGuardPin from '@/components/RequireGuardPin';
import AptoSelector from '@/components/AptoSelector';
import { useLive } from '@/lib/useLive';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/db';
import { ingresarVisitante, salidaVisitante, calcCobroVisitante, cop, fmtT } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase';

export default function VisitantesPage() {
  const { isAdmin } = useAuth();
  const visitantes = useLive(() => db().visitantes.filter((v) => !v.salida).reverse().toArray()) ?? [];
  const bloqueados = useLive(() => db().bloqueados.filter((b) => !b.desbloqueado_at).toArray()) ?? [];
  const tarifas = useLive(() => db().tarifas.get(1)) ?? { id: 1, carro_mes: 20000, moto_mes: 10000, vis_hora: 1000, horas_gratis: 2, iva: 19, capacidad_visitantes: 0 } as any;

  const capacidad: number = tarifas.capacidad_visitantes ?? 0;
  const ocupados = visitantes.length;
  const lleno = capacidad > 0 && ocupados >= capacidad;

  const [torre, setTorre] = useState('');
  const [apto, setApto] = useState('');
  const [tipo, setTipo] = useState<'carro' | 'moto'>('carro');
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
  const aptoBloqueado = apto && blqMap.get(apto);

  async function submit() {
    setError('');
    if (!apto) return setError('Selecciona torre y apartamento.');
    if (!placa.trim()) return setError('Ingresa la placa del vehículo.');
    if (aptoBloqueado) return setError(`Apto ${apto} bloqueado: ${aptoBloqueado.motivo}.`);
    const placaUp = placa.toUpperCase().trim();
    if (visitantes.find((v) => v.placa === placaUp)) return setError(`La placa ${placaUp} ya está en el parqueadero.`);

    // Re-chequea capacidad contra Supabase para evitar carrera entre dispositivos
    if (capacidad > 0) {
      try {
        const sb = getSupabase();
        const { count } = await sb.from('visitantes').select('id', { count: 'exact', head: true }).is('salida', null);
        if ((count ?? 0) >= capacidad) {
          return setError(`🚫 Parqueadero lleno (${count}/${capacidad}). No se puede registrar más visitantes.`);
        }
      } catch {
        // Si falla (offline), confiamos en el conteo local — ya valida arriba
      }
    }

    await ingresarVisitante({ cod: apto, placa: placaUp, tipo, nombre: nombre.trim() || 'Visitante', tel: tel.trim() });
    setTorre(''); setApto(''); setPlaca(''); setNombre(''); setTel('');
  }

  const [salidaId, setSalidaId] = useState<string | null>(null);
  const visSalida = visitantes.find((v) => v.id === salidaId);
  const calc = visSalida ? (() => {
    const horas = (Date.now() - new Date(visSalida.entrada).getTime()) / 3600000;
    const c = calcCobroVisitante(horas, tarifas);
    return { horas, ...c };
  })() : null;

  return (
    <AppShell><RequireGuardPin>
      <div className="ph">
        <h2>Visitantes</h2>
        <p>{isAdmin ? 'Vista solo lectura — admin' : 'Registro de ingreso y salida con cobro automático'}</p>
      </div>
      <div className="al ai">ℹ️ Primeras <b>{tarifas.horas_gratis}</b> horas gratis. Luego <b>{cop(tarifas.vis_hora)}</b>/hora adicional completa.</div>

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
          <AptoSelector torre={torre} apto={apto} onChange={(t, a) => { setTorre(t); setApto(a); }} />
        </div>
        {aptoBloqueado && (<div className="al ae">🚫 El apto <b>{apto}</b> está bloqueado. Motivo: {aptoBloqueado.motivo}.</div>)}
        <div className="g4" style={{ marginBottom: 10 }}>
          <div className="fld"><label>Tipo</label><select value={tipo} onChange={(e) => setTipo(e.target.value as any)}><option value="carro">🚗 Carro</option><option value="moto">🏍️ Moto</option></select></div>
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
                const horas = (now - new Date(v.entrada).getTime()) / 3600000;
                const c = calcCobroVisitante(horas, tarifas);
                const hStr = horas < 1 ? `${Math.round(horas * 60)}min` : `${horas.toFixed(1)}h`;
                return (<tr key={v.id}>
                  <td><b>{v.placa}</b></td>
                  <td><span className="bge bvis">{v.tipo === 'carro' ? '🚗' : '🏍️'} {v.tipo}</span></td>
                  <td>{v.cod}</td><td>{v.nombre}</td>
                  <td style={{ color: 'var(--ink3)' }}>{v.tel || '—'}</td>
                  <td>{fmtT(v.entrada)}</td><td>{hStr}</td>
                  <td>{c.base === 0 ? <span className="bge bgratis">Gratis</span> : cop(c.total)}</td>
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
            <div className="crow"><span>Ingreso</span><span>{fmtT(visSalida.entrada)}</span></div>
            <div className="crow"><span>Tiempo total</span><span>{calc.horas.toFixed(2)} h</span></div>
            <div className="crow"><span style={{ color: 'var(--leaf3)' }}>Horas gratis</span><span style={{ color: 'var(--leaf3)' }}>{Math.min(calc.horas, tarifas.horas_gratis).toFixed(1)} h</span></div>
            <div className="crow"><span>Horas cobradas ({calc.horasCobradas}h × {cop(tarifas.vis_hora)})</span><span>{cop(calc.base)}</span></div>
            <div className="crow"><span>IVA ({tarifas.iva}%)</span><span>{cop(calc.iva)}</span></div>
            <div className="ctot"><span>TOTAL</span><span style={{ fontSize: 22 }}>{cop(calc.total)}</span></div>
            <div className="mf">
              <button className="btn bo" onClick={() => setSalidaId(null)}>Cancelar</button>
              <button className="btn bp" onClick={async () => { await salidaVisitante(visSalida.id, tarifas); setSalidaId(null); }}>✅ Confirmar cobro</button>
            </div>
          </div>
        </div>
      )}
    </RequireGuardPin></AppShell>
  );
}
