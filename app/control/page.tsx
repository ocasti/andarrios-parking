'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import AptoSelector from '@/components/AptoSelector';
import { useLive } from '@/lib/useLive';
import { db } from '@/lib/db';
import { bloquearApto, desbloquearApto, aprobarPlaca, revocarPlaca, fmtD } from '@/lib/actions';

export default function ControlPage() {
  const bloqueados = useLive(() => db().bloqueados.filter((b) => !b.desbloqueado_at).toArray()) ?? [];
  const placas = useLive(() => db().placas_aprobadas.filter((p) => !p.deleted_at).toArray()) ?? [];

  const [bTorre, setBTorre] = useState('');
  const [bApto, setBApto] = useState('');
  const [bMotivo, setBMotivo] = useState('');
  const [pTorre, setPTorre] = useState('');
  const [pApto, setPApto] = useState('');
  const [pPlaca, setPPlaca] = useState('');
  const [pTipo, setPTipo] = useState<'carro' | 'moto'>('carro');
  const [filtPlacas, setFiltPlacas] = useState('');

  const placasFiltradas = filtPlacas
    ? placas.filter((p) => p.placa.toLowerCase().includes(filtPlacas.toLowerCase()) || p.cod.toLowerCase().includes(filtPlacas.toLowerCase()))
    : placas;
  const grupos: Record<string, typeof placasFiltradas> = {};
  placasFiltradas.forEach((p) => { (grupos[p.cod] ||= []).push(p); });

  return (
    <AppShell>
      <div className="ph">
        <h2>Control de acceso</h2>
        <p>Bloquea aptos en mora · Gestiona placas aprobadas</p>
      </div>
      <div className="al aw">⚠️ Aptos <b>bloqueados</b> no pueden registrar visitantes. Si un apto tiene placas aprobadas, solo esas placas pueden ingresar como residentes.</div>
      <div className="g2" style={{ alignItems: 'start', gap: '1rem' }}>
        <div>
          <div className="card">
            <div className="ctit" style={{ marginBottom: '1rem' }}>🚫 Bloquear / desbloquear apto</div>
            <div className="g3" style={{ marginBottom: 10 }}>
              <AptoSelector torre={bTorre} apto={bApto} onChange={(t, a) => { setBTorre(t); setBApto(a); }} />
            </div>
            <div className="fld" style={{ marginBottom: 10 }}>
              <label>Motivo</label>
              <input type="text" value={bMotivo} onChange={(e) => setBMotivo(e.target.value)} placeholder="Mora mes de…" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn bdx" disabled={!bApto} onClick={async () => { await bloquearApto(bApto, bMotivo); setBApto(''); setBMotivo(''); }}>🔒 Bloquear</button>
              <button className="btn bs" disabled={!bApto} onClick={async () => { await desbloquearApto(bApto); setBApto(''); setBMotivo(''); }}>🔓 Desbloquear</button>
            </div>
          </div>
          <div className="card">
            <div className="ch"><div className="ctit">🛡️ Aptos bloqueados ({bloqueados.length})</div></div>
            {bloqueados.length === 0 ? (<p className="empty">No hay aptos bloqueados.</p>) : (
              <div>{bloqueados.map((b) => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 13px', border: '1px solid #f0c4c4', borderRadius: 10, marginBottom: 7, background: 'var(--red2)' }}>
                  <div><h4 style={{ fontSize: 13, fontWeight: 600 }}>🔒 {b.cod}</h4><p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 1 }}>{b.motivo} · {fmtD(b.fecha_bloqueo)}</p></div>
                  <button className="btn bs xs" onClick={() => void desbloquearApto(b.cod)}>🔓 Desbloquear</button>
                </div>
              ))}</div>
            )}
          </div>
        </div>
        <div>
          <div className="card">
            <div className="ctit" style={{ marginBottom: '1rem' }}>✅ Aprobar placa para apto</div>
            <div className="g3" style={{ marginBottom: 10 }}><AptoSelector torre={pTorre} apto={pApto} onChange={(t, a) => { setPTorre(t); setPApto(a); }} /></div>
            <div className="g2" style={{ marginBottom: 10 }}>
              <div className="fld"><label>Placa</label><input type="text" value={pPlaca} onChange={(e) => setPPlaca(e.target.value.toUpperCase())} placeholder="ABC-123" maxLength={7} /></div>
              <div className="fld"><label>Tipo</label><select value={pTipo} onChange={(e) => setPTipo(e.target.value as any)}><option value="carro">🚗 Carro</option><option value="moto">🏍️ Moto</option></select></div>
            </div>
            <button className="btn bp" disabled={!pApto || !pPlaca.trim()} onClick={async () => { await aprobarPlaca(pApto, pPlaca.trim(), pTipo); setPPlaca(''); }}>➕ Aprobar placa</button>
          </div>
          <div className="card">
            <div className="ctit" style={{ marginBottom: '.9rem' }}>📋 Placas aprobadas ({placas.length})</div>
            <div className="sw"><input type="text" placeholder="Buscar apto o placa…" value={filtPlacas} onChange={(e) => setFiltPlacas(e.target.value)} /></div>
            {Object.keys(grupos).length === 0 ? (<p className="empty">No hay placas aprobadas.</p>) : (
              Object.keys(grupos).sort().map((cod) => (
                <div key={cod} style={{ padding: '10px 13px', border: '1px solid var(--bd)', borderRadius: 10, marginBottom: 7, background: 'var(--bg3)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{cod}</h4>
                  <div>{grupos[cod].map((p) => (
                    <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--leaf5)', color: 'var(--leaf)', border: '1px solid var(--leaf4)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, margin: 3 }}>
                      {p.tipo === 'carro' ? '🚗' : '🏍️'} {p.placa}
                      <button onClick={() => void revocarPlaca(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 12, padding: '0 0 0 3px' }}>×</button>
                    </span>
                  ))}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
