'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import RequireAdmin from '@/components/RequireAdmin';
import AptoSelector from '@/components/AptoSelector';
import Pagination from '@/components/Pagination';
import { usePagedQuery } from '@/lib/usePagedQuery';
import { bloquearApto, desbloquearApto, aprobarPlaca, revocarPlaca, fmtD } from '@/lib/actions';

interface Bloqueado { id: string; cod: string; motivo: string; fecha_bloqueo: string }
interface PlacaAp { id: string; cod: string; placa: string; tipo: 'carro' | 'moto'; fecha_aprobacion: string }

export default function ControlPage() {
  const [bTorre, setBTorre] = useState('');
  const [bApto, setBApto] = useState('');
  const [bMotivo, setBMotivo] = useState('');
  const [pTorre, setPTorre] = useState('');
  const [pApto, setPApto] = useState('');
  const [pPlaca, setPPlaca] = useState('');
  const [pTipo, setPTipo] = useState<'carro' | 'moto'>('carro');
  const [filtPlacas, setFiltPlacas] = useState('');

  const blqQ = usePagedQuery<Bloqueado>({
    table: 'bloqueados',
    isNull: ['desbloqueado_at'],
    order: { column: 'fecha_bloqueo', ascending: false },
    pageSize: 10,
  });

  const placasQ = usePagedQuery<PlacaAp>({
    table: 'placas_aprobadas',
    isNull: ['deleted_at'],
    search: filtPlacas ? { columns: ['cod', 'placa'], value: filtPlacas } : undefined,
    order: { column: 'fecha_aprobacion', ascending: false },
    pageSize: 15,
  }, [filtPlacas]);

  return (
    <AppShell><RequireAdmin>
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
              <button className="btn bdx" disabled={!bApto} onClick={async () => { await bloquearApto(bApto, bMotivo); setBApto(''); setBMotivo(''); blqQ.refresh(); }}>🔒 Bloquear</button>
              <button className="btn bs" disabled={!bApto} onClick={async () => { await desbloquearApto(bApto); setBApto(''); setBMotivo(''); blqQ.refresh(); }}>🔓 Desbloquear</button>
            </div>
          </div>
          <div className="card">
            <div className="ch"><div className="ctit">🛡️ Aptos bloqueados ({blqQ.total})</div></div>
            {blqQ.rows.length === 0 ? (<p className="empty">No hay aptos bloqueados.</p>) : (
              <div>{blqQ.rows.map((b) => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 13px', border: '1px solid #f0c4c4', borderRadius: 10, marginBottom: 7, background: 'var(--red2)' }}>
                  <div><h4 style={{ fontSize: 13, fontWeight: 600 }}>🔒 {b.cod}</h4><p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 1 }}>{b.motivo} · {fmtD(b.fecha_bloqueo)}</p></div>
                  <button className="btn bs xs" onClick={async () => { await desbloquearApto(b.cod); blqQ.refresh(); }}>🔓 Desbloquear</button>
                </div>
              ))}</div>
            )}
            <Pagination page={blqQ.page} totalPages={blqQ.totalPages} total={blqQ.total} pageSize={blqQ.pageSize} loading={blqQ.loading} onChange={blqQ.setPage} />
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
            <button className="btn bp" disabled={!pApto || !pPlaca.trim()} onClick={async () => { await aprobarPlaca(pApto, pPlaca.trim(), pTipo); setPPlaca(''); placasQ.refresh(); }}>➕ Aprobar placa</button>
          </div>
          <div className="card">
            <div className="ctit" style={{ marginBottom: '.9rem' }}>📋 Placas aprobadas ({placasQ.total})</div>
            <div className="sw"><input type="text" placeholder="Buscar apto o placa…" value={filtPlacas} onChange={(e) => setFiltPlacas(e.target.value.toUpperCase())} /></div>
            {placasQ.rows.length === 0 ? (<p className="empty">{placasQ.loading ? 'Cargando…' : 'No hay placas aprobadas.'}</p>) : (
              <div className="tw">
                <table>
                  <thead><tr><th>Apto</th><th>Placa</th><th>Tipo</th><th>Aprobada</th><th></th></tr></thead>
                  <tbody>
                    {placasQ.rows.map((p) => (
                      <tr key={p.id}>
                        <td><b>{p.cod}</b></td>
                        <td><b>{p.placa}</b></td>
                        <td>{p.tipo === 'carro' ? '🚗' : '🏍️'} {p.tipo}</td>
                        <td style={{ color: 'var(--ink3)', fontSize: 11 }}>{fmtD(p.fecha_aprobacion)}</td>
                        <td><button className="btn bdx xs" onClick={async () => { await revocarPlaca(p.id); placasQ.refresh(); }}>Revocar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={placasQ.page} totalPages={placasQ.totalPages} total={placasQ.total} pageSize={placasQ.pageSize} loading={placasQ.loading} onChange={placasQ.setPage} />
          </div>
        </div>
      </div>
    </RequireAdmin></AppShell>
  );
}
