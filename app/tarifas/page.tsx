'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import RequireAdmin from '@/components/RequireAdmin';
import { useLive } from '@/lib/useLive';
import { db } from '@/lib/db';
import { guardarTarifas } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase';

export default function TarifasPage() {
  const tarifas = useLive(() => db().tarifas.get(1));
  const [carro, setCarro] = useState(20000);
  const [moto, setMoto] = useState(10000);
  const [vis, setVis] = useState(1000);
  const [horasG, setHorasG] = useState(2);
  const [iva, setIva] = useState(19);
  const [capacidad, setCapacidad] = useState(0);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (tarifas) {
      setCarro(tarifas.carro_mes); setMoto(tarifas.moto_mes); setVis(tarifas.vis_hora);
      setHorasG(tarifas.horas_gratis); setIva(tarifas.iva);
      setCapacidad(tarifas.capacidad_visitantes ?? 0);
    }
  }, [tarifas]);

  async function guardar() {
    await guardarTarifas({ carro_mes: carro, moto_mes: moto, vis_hora: vis, horas_gratis: horasG, iva, capacidad_visitantes: capacidad });
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  }

  return (
    <AppShell><RequireAdmin>
      <div className="ph"><h2>Tarifas</h2><p>Configura los valores de cobro</p></div>
      <div className="card">
        <div className="ch"><div className="ctit">🪙 Tarifas vigentes</div><button className="btn bp sm" onClick={guardar}>💾 Guardar cambios</button></div>
        <Item label="Mensualidad carro" desc="Cobro mensual por vehículo tipo carro" prefix="$" value={carro} onChange={setCarro} />
        <Item label="Mensualidad moto" desc="Cobro mensual por vehículo tipo moto" prefix="$" value={moto} onChange={setMoto} />
        <Item label="Visitante por hora" desc="Tarifa por hora adicional" prefix="$" value={vis} onChange={setVis} />
        <Item label="Horas gratis" desc="Horas iniciales sin costo" suffix="h" value={horasG} onChange={setHorasG} />
        <Item label="IVA (%)" desc="Porcentaje de IVA" suffix="%" value={iva} onChange={setIva} />
        <Item
          label="Capacidad de visitantes"
          desc="Cupo máximo de visitantes simultáneos. 0 = sin límite."
          suffix="cupos"
          value={capacidad}
          onChange={setCapacidad}
        />
        {ok && <div className="al aok" style={{ marginTop: '.8rem' }}>✅ Tarifas actualizadas y guardadas.</div>}
      </div>

      <PinSection />
    </RequireAdmin></AppShell>
  );
}

function PinSection() {
  const sb = getSupabase();
  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    sb.rpc('is_porteria_pin_set').then(({ data }) => setPinSet(!!data));
  }, [sb]);

  async function guardarPin() {
    setMsg(null);
    if (newPin.length < 4) return setMsg({ kind: 'err', text: 'El PIN debe tener al menos 4 caracteres.' });
    if (newPin !== confirmPin) return setMsg({ kind: 'err', text: 'El PIN y la confirmación no coinciden.' });
    setBusy(true);
    try {
      const { error } = await sb.rpc('set_porteria_pin', { p_pin: newPin });
      if (error) throw error;
      setMsg({ kind: 'ok', text: '✅ PIN actualizado. Comparte el nuevo PIN con la portería.' });
      setNewPin(''); setConfirmPin('');
      setPinSet(true);
    } catch (e: any) {
      setMsg({ kind: 'err', text: e?.message ?? 'Error al cambiar el PIN.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="ch">
        <div className="ctit">🔐 PIN de portería</div>
        {pinSet === true && <span className="bge bpagado">Configurado</span>}
        {pinSet === false && <span className="bge bpendiente">Sin configurar</span>}
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--ink3)', marginBottom: '1rem' }}>
        El vigilante necesita este PIN para desbloquear las páginas operativas (Dashboard, Visitantes, Caja).
        La sesión queda activa durante todo el turno (12 horas) o hasta que el guardia cierre turno manualmente.
        Cambia el PIN cada vez que rote el personal.
        {pinSet === false && ' Mientras no haya PIN configurado, la portería se abre sin bloqueo.'}
      </p>
      <div className="g2" style={{ maxWidth: 500, marginBottom: 10 }}>
        <div className="fld">
          <label>Nuevo PIN</label>
          <input type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="Mín. 4 caracteres" maxLength={12} />
        </div>
        <div className="fld">
          <label>Confirmar PIN</label>
          <input type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} maxLength={12} />
        </div>
      </div>
      {msg && <div className={`al ${msg.kind === 'ok' ? 'aok' : 'ae'}`}>{msg.text}</div>}
      <button className="btn bp" disabled={busy || !newPin || !confirmPin} onClick={guardarPin}>
        {busy ? 'Guardando…' : pinSet ? '🔄 Cambiar PIN' : '💾 Establecer PIN'}
      </button>
    </div>
  );
}

function Item({ label, desc, prefix, suffix, value, onChange }: { label: string; desc: string; prefix?: string; suffix?: string; value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid var(--bd)', borderRadius: 10, marginBottom: 8, background: 'var(--bg)', gap: 12 }}>
      <div><h4 style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</h4><p style={{ fontSize: 11.5, color: 'var(--ink3)' }}>{desc}</p></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {prefix && <span style={{ fontWeight: 700, color: 'var(--leaf)' }}>{prefix}</span>}
        <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} min={0} style={{ width: 130, height: 38, textAlign: 'right', fontFamily: '"Playfair Display", serif', fontSize: 17, color: 'var(--leaf)', padding: '0 11px', border: '1.5px solid var(--bdk)', borderRadius: 10 }} />
        {suffix && <span style={{ fontWeight: 700, color: 'var(--leaf)' }}>{suffix}</span>}
      </div>
    </div>
  );
}
