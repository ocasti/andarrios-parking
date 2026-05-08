'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { getSupabase } from '@/lib/supabase';
import { cop, fmtD, fmtT, mesKey } from '@/lib/actions';

interface Stats { residentes: number; carros: number; motos: number; visitantesActivos: number; recaudoHoy: number; bloqueados: number; recaudoMes: number; pendientesMes: number; pagosMes: number; }

export default function AdminPage() {
  const sb = getSupabase();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [signupMode, setSignupMode] = useState(false);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false); });
    const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  async function login() {
    setError('');
    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) setError(error.message);
  }
  async function signup() {
    setError('');
    const { data, error } = await sb.auth.signUp({ email, password: pass });
    if (error) return setError(error.message);
    if (data.user) {
      await sb.from('admin_profiles').insert({ user_id: data.user.id, nombre: email.split('@')[0], rol: 'admin' });
    }
  }
  async function logout() { await sb.auth.signOut(); }

  if (loading) return <AppShell><p className="empty">Cargando…</p></AppShell>;

  if (!user) {
    return (
      <AppShell>
        <div className="ph"><h2>Panel admin</h2><p>Acceso remoto al sistema</p></div>
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="mh">🛠️ {signupMode ? 'Crear cuenta admin' : 'Iniciar sesión'}</div>
          <div className="fld" style={{ marginBottom: 10 }}><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@conjunto.com" /></div>
          <div className="fld" style={{ marginBottom: 10 }}><label>Contraseña</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (signupMode ? signup : login)(); }} /></div>
          {error && <div className="al ae">⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn bp" onClick={signupMode ? signup : login}>{signupMode ? '➕ Crear cuenta' : '🔐 Entrar'}</button>
            <button className="btn bo" onClick={() => { setSignupMode(!signupMode); setError(''); }}>{signupMode ? 'Tengo cuenta' : 'Crear cuenta admin'}</button>
          </div>
        </div>
      </AppShell>
    );
  }

  return <AdminDashboard user={user} onLogout={logout} />;
}

function AdminDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const sb = getSupabase();
  const [stats, setStats] = useState<Stats | null>(null);
  const [actividad, setActividad] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'movimientos' | 'pagos' | 'cierres'>('overview');
  const [cierres, setCierres] = useState<any[]>([]);

  async function loadAll() {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const mesStart = new Date(); mesStart.setDate(1); mesStart.setHours(0, 0, 0, 0);
    const mk = mesKey();
    const [resR, visActR, visHoyR, pagosHoyR, blqR, pagosMesR, mensR, actR, histR, ciR] = await Promise.all([
      sb.from('residentes').select('id, tipo').is('deleted_at', null),
      sb.from('visitantes').select('id').is('salida', null),
      sb.from('visitantes').select('total').not('salida', 'is', null).gte('salida', todayStart.toISOString()),
      sb.from('pagos_mensualidades').select('monto').gte('fecha', todayStart.toISOString()),
      sb.from('bloqueados').select('id').is('desbloqueado_at', null),
      sb.from('pagos_mensualidades').select('monto').gte('fecha', mesStart.toISOString()),
      sb.from('mensualidades').select('estado').eq('mes_key', mk),
      sb.from('actividad').select('*').order('ts', { ascending: false }).limit(40),
      sb.from('visitantes').select('*').not('salida', 'is', null).order('salida', { ascending: false }).limit(60),
      sb.from('cierres_caja').select('*').order('fecha', { ascending: false }).limit(30),
    ]);
    const residentes = resR.data ?? [];
    const recHoyVis = (visHoyR.data ?? []).reduce((s: number, x: any) => s + (x.total ?? 0), 0);
    const recHoyMens = (pagosHoyR.data ?? []).reduce((s: number, x: any) => s + (x.monto ?? 0), 0);
    const recMes = (pagosMesR.data ?? []).reduce((s: number, x: any) => s + (x.monto ?? 0), 0);
    const pendientesMes = (mensR.data ?? []).filter((m: any) => m.estado === 'pendiente').length;
    const pagosMes = (mensR.data ?? []).filter((m: any) => m.estado === 'pagado').length;
    setStats({ residentes: residentes.length, carros: residentes.filter((r: any) => r.tipo === 'carro').length, motos: residentes.filter((r: any) => r.tipo === 'moto').length, visitantesActivos: (visActR.data ?? []).length, recaudoHoy: recHoyVis + recHoyMens, bloqueados: (blqR.data ?? []).length, recaudoMes: recMes, pendientesMes, pagosMes });
    setActividad(actR.data ?? []);
    setHistorial(histR.data ?? []);
    setCierres(ciR.data ?? []);
    const { data: pData } = await sb.from('pagos_mensualidades').select('*').order('fecha', { ascending: false }).limit(60);
    setPagos(pData ?? []);
  }

  useEffect(() => {
    void loadAll();
    const channels = ['residentes', 'visitantes', 'pagos_mensualidades', 'actividad', 'cierres_caja', 'bloqueados']
      .map((t) => sb.channel(`adm-${t}`).on('postgres_changes', { event: '*', schema: 'public', table: t }, () => { void loadAll(); }).subscribe());
    const i = setInterval(loadAll, 60000);
    return () => { channels.forEach((c) => c.unsubscribe()); clearInterval(i); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>Panel administrativo</h2><p>Sesión: <b>{user.email}</b> · acceso remoto a todos los movimientos</p></div>
        <button className="btn bo" onClick={onLogout}>🔓 Cerrar sesión</button>
      </div>
      {!stats ? <p className="empty">Cargando datos…</p> : (<>
        <div className="mets">
          <div className="met"><div className="met-ic">👥</div><div className="met-v">{stats.residentes}</div><div className="met-l">Residentes ({stats.carros} carros · {stats.motos} motos)</div></div>
          <div className="met warn"><div className="met-ic">🚗</div><div className="met-v">{stats.visitantesActivos}</div><div className="met-l">Visitantes activos</div></div>
          <div className="met"><div className="met-ic">💵</div><div className="met-v">{cop(stats.recaudoHoy)}</div><div className="met-l">Recaudo hoy</div></div>
          <div className="met"><div className="met-ic">📅</div><div className="met-v">{cop(stats.recaudoMes)}</div><div className="met-l">Recaudo del mes</div></div>
          <div className="met dng"><div className="met-ic">🚫</div><div className="met-v">{stats.bloqueados}</div><div className="met-l">Aptos bloqueados</div></div>
          <div className="met warn"><div className="met-ic">⏳</div><div className="met-v">{stats.pendientesMes}</div><div className="met-l">Mensualidades pendientes</div></div>
          <div className="met"><div className="met-ic">✅</div><div className="met-v">{stats.pagosMes}</div><div className="met-l">Mensualidades pagadas</div></div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--bd)', marginBottom: '1rem' }}>
            {(['overview', 'movimientos', 'pagos', 'cierres'] as const).map((t) => (<button key={t} className={`btn ${tab === t ? 'bp' : 'bo'} sm`} onClick={() => setTab(t)}>{t === 'overview' ? '📡 Actividad' : t === 'movimientos' ? '🚗 Movimientos' : t === 'pagos' ? '💳 Pagos' : '🏦 Cierres'}</button>))}
          </div>
          {tab === 'overview' && (actividad.length === 0 ? <p className="empty">Sin actividad.</p> : <div>{actividad.map((a) => (<div key={a.id} style={{ display: 'flex', gap: 10, marginBottom: '.7rem' }}><span style={{ width: 8, height: 8, marginTop: 6, borderRadius: 4, background: 'var(--leaf3)', flexShrink: 0 }} /><div><p style={{ fontSize: 13 }}>{a.msg}</p><small style={{ color: 'var(--ink3)' }}>{fmtT(a.ts)} · {fmtD(a.ts)}</small></div></div>))}</div>)}
          {tab === 'movimientos' && (historial.length === 0 ? <p className="empty">Sin cobros.</p> : <div className="tw"><table><thead><tr><th>Fecha</th><th>Placa</th><th>Tipo</th><th>Apto</th><th>Entrada</th><th>Salida</th><th>Total</th></tr></thead><tbody>{historial.map((h) => (<tr key={h.id}><td>{fmtD(h.salida)}</td><td><b>{h.placa}</b></td><td>{h.tipo}</td><td>{h.cod}</td><td>{fmtT(h.entrada)}</td><td>{fmtT(h.salida)}</td><td><b>{cop(h.total ?? 0)}</b></td></tr>))}</tbody></table></div>)}
          {tab === 'pagos' && (pagos.length === 0 ? <p className="empty">Sin pagos.</p> : <div className="tw"><table><thead><tr><th>Fecha</th><th>Placa</th><th>Apto</th><th>Propietario</th><th>Mes</th><th>Monto</th></tr></thead><tbody>{pagos.map((p) => (<tr key={p.id}><td>{fmtD(p.fecha)} {fmtT(p.fecha)}</td><td><b>{p.placa}</b></td><td>{p.cod}</td><td>{p.nombre}</td><td>{p.mes_key}</td><td><b>{cop(p.monto)}</b></td></tr>))}</tbody></table></div>)}
          {tab === 'cierres' && (cierres.length === 0 ? <p className="empty">Sin cierres.</p> : <div className="tw"><table><thead><tr><th>Fecha</th><th>Cobros vis.</th><th>Total vis.</th><th>Mens.</th><th>Total mens.</th><th>IVA</th><th>Total caja</th></tr></thead><tbody>{cierres.map((c) => (<tr key={c.id}><td>{fmtD(c.fecha)}</td><td>{c.cobros_vis}</td><td>{cop(c.total_vis)}</td><td>{c.cobros_mens}</td><td>{cop(c.total_mens)}</td><td>{cop(c.total_iva)}</td><td><b>{cop(c.total)}</b></td></tr>))}</tbody></table></div>)}
        </div>
      </>)}
    </AppShell>
  );
}
