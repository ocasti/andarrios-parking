'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useLive } from '@/lib/useLive';
import { db } from '@/lib/db';
import { guardarTarifas } from '@/lib/actions';

const ACCESS_KEY = '123456';

export default function TarifasPage() {
  const tarifas = useLive(() => db().tarifas.get(1));
  const [autorizado, setAutorizado] = useState(false);
  const [clave, setClave] = useState('');
  const [errClave, setErrClave] = useState('');
  const [carro, setCarro] = useState(20000);
  const [moto, setMoto] = useState(10000);
  const [vis, setVis] = useState(1000);
  const [horasG, setHorasG] = useState(2);
  const [iva, setIva] = useState(19);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (tarifas) { setCarro(tarifas.carro_mes); setMoto(tarifas.moto_mes); setVis(tarifas.vis_hora); setHorasG(tarifas.horas_gratis); setIva(tarifas.iva); }
  }, [tarifas]);

  async function guardar() {
    await guardarTarifas({ carro_mes: carro, moto_mes: moto, vis_hora: vis, horas_gratis: horasG, iva });
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  }

  if (!autorizado) {
    function verificar() {
      if (clave === ACCESS_KEY) { setAutorizado(true); setErrClave(''); }
      else setErrClave('Clave incorrecta.');
    }
    return (
      <AppShell>
        <div className="ph"><h2>Tarifas</h2><p>Acceso restringido</p></div>
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="mh">🔒 Acceso restringido</div>
          <p style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: '1rem' }}>Ingresa la clave para acceder al módulo de tarifas.</p>
          <div className="fld" style={{ marginBottom: 10 }}><label>Clave</label><input type="password" value={clave} onChange={(e) => setClave(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') verificar(); }} placeholder="••••••" /></div>
          {errClave && <div className="al ae">⚠️ {errClave}</div>}
          <button className="btn bp" onClick={verificar}>🔓 Entrar</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="ph"><h2>Tarifas</h2><p>Configura los valores de cobro</p></div>
      <div className="card">
        <div className="ch"><div className="ctit">🪙 Tarifas vigentes</div><button className="btn bp sm" onClick={guardar}>💾 Guardar cambios</button></div>
        <Item label="Mensualidad carro" desc="Cobro mensual por vehículo tipo carro" prefix="$" value={carro} onChange={setCarro} />
        <Item label="Mensualidad moto" desc="Cobro mensual por vehículo tipo moto" prefix="$" value={moto} onChange={setMoto} />
        <Item label="Visitante por hora" desc="Tarifa por hora adicional" prefix="$" value={vis} onChange={setVis} />
        <Item label="Horas gratis" desc="Horas iniciales sin costo" suffix="h" value={horasG} onChange={setHorasG} />
        <Item label="IVA (%)" desc="Porcentaje de IVA" suffix="%" value={iva} onChange={setIva} />
        {ok && <div className="al aok" style={{ marginTop: '.8rem' }}>✅ Tarifas actualizadas y guardadas.</div>}
      </div>
    </AppShell>
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
