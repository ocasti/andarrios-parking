'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import AptoSelector from '@/components/AptoSelector';
import { useLive } from '@/lib/useLive';
import { db } from '@/lib/db';
import { crearResidente, eliminarResidente, fmtD } from '@/lib/actions';

export default function ResidentesPage() {
  const residentes = useLive(() => db().residentes.filter((r) => !r.deleted_at).toArray()) ?? [];
  const placas_aprobadas = useLive(() => db().placas_aprobadas.filter((p) => !p.deleted_at).toArray()) ?? [];
  const [torre, setTorre] = useState('');
  const [apto, setApto] = useState('');
  const [tipo, setTipo] = useState<'carro' | 'moto'>('carro');
  const [placa, setPlaca] = useState('');
  const [nombre, setNombre] = useState('');
  const [cel, setCel] = useState('');
  const [filt, setFilt] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  async function submit() {
    setError(''); setOk('');
    if (!torre || !apto) return setError('Selecciona torre y apartamento.');
    if (!placa.trim() || !nombre.trim()) return setError('Completa placa y propietario.');
    const placaUp = placa.toUpperCase().trim();
    if (residentes.find((r) => r.placa === placaUp)) return setError(`La placa ${placaUp} ya está registrada.`);
    const ap = placas_aprobadas.filter((p) => p.cod === apto);
    if (ap.length > 0 && !ap.find((p) => p.placa === placaUp)) return setError(`La placa ${placaUp} no está aprobada para ${apto}.`);
    const piso = parseInt(apto.charAt(4), 10);
    const aptoNum = parseInt(apto.slice(5), 10);
    await crearResidente({ cod: apto, torre: parseInt(torre, 10), piso, apto: aptoNum, placa: placaUp, tipo, nombre: nombre.trim(), cel: cel.trim() });
    setTorre(''); setApto(''); setPlaca(''); setNombre(''); setCel('');
    setOk(`Vehículo ${placaUp} registrado.`);
    setTimeout(() => setOk(''), 3500);
  }
  const filtrados = filt ? residentes.filter((r) => r.placa.toLowerCase().includes(filt.toLowerCase()) || r.nombre.toLowerCase().includes(filt.toLowerCase()) || r.cod.toLowerCase().includes(filt.toLowerCase())) : residentes;
  return (
    <AppShell>
      <div className="ph"><h2>Residentes</h2><p>12 torres · 6 pisos · 4 apartamentos por piso</p></div>
      <div className="card">
        <div className="ctit" style={{ marginBottom: '1rem' }}>➕ Registrar vehículo</div>
        <div className="g3" style={{ marginBottom: 10 }}><AptoSelector torre={torre} apto={apto} onChange={(t, a) => { setTorre(t); setApto(a); }} /></div>
        <div className="g3" style={{ marginBottom: 10 }}>
          <div className="fld"><label>Tipo</label><select value={tipo} onChange={(e) => setTipo(e.target.value as any)}><option value="carro">🚗 Carro</option><option value="moto">🏍️ Moto</option></select></div>
          <div className="fld"><label>Placa</label><input type="text" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="ABC-123" maxLength={7} /></div>
          <div className="fld"><label>Propietario</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" /></div>
        </div>
        <div className="fld" style={{ marginBottom: 10, maxWidth: 300 }}><label>Celular (opcional)</label><input type="text" value={cel} onChange={(e) => setCel(e.target.value)} placeholder="300 000 0000" /></div>
        {error && <div className="al ae">⚠️ {error}</div>}
        {ok && <div className="al aok">✅ {ok}</div>}
        <button className="btn bp" onClick={submit}>➕ Registrar vehículo</button>
      </div>
      <div className="card">
        <div className="ch"><div className="ctit">📋 Vehículos registrados ({residentes.length})</div></div>
        <div className="sw"><input type="text" placeholder="Buscar placa, nombre, torre, apartamento…" value={filt} onChange={(e) => setFilt(e.target.value)} /></div>
        <div className="tw">
          {filtrados.length === 0 ? (<p className="empty">No hay vehículos que coincidan.</p>) : (
            <table><thead><tr><th>Código</th><th>Torre</th><th>Piso</th><th>Placa</th><th>Tipo</th><th>Propietario</th><th>Celular</th><th>Registro</th><th></th></tr></thead><tbody>
              {filtrados.map((r) => (<tr key={r.id}>
                <td><b>{r.cod}</b></td><td>T{String(r.torre).padStart(2, '0')}</td><td>{r.piso}</td><td><b>{r.placa}</b></td>
                <td><span className={`bge b${r.tipo}`}>{r.tipo === 'carro' ? '🚗' : '🏍️'} {r.tipo}</span></td>
                <td>{r.nombre}</td><td style={{ color: 'var(--ink3)' }}>{r.cel || '—'}</td>
                <td style={{ color: 'var(--ink3)', fontSize: 11 }}>{fmtD(r.fecha_registro || r.created_at!)}</td>
                <td><button className="btn bdx xs" onClick={() => { if (confirm(`¿Eliminar ${r.placa}?`)) void eliminarResidente(r.id); }}>🗑️</button></td>
              </tr>))}
            </tbody></table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
