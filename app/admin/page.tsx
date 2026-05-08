'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/src/presentation/components/layout/AppShell';
import Pagination from '@/src/presentation/components/ui/Pagination';
import { useAuth, logout } from '@/src/application/hooks/useAuth';
import { usePagedQuery } from '@/src/application/hooks/usePagedQuery';
import { getSupabase } from '@/lib/supabase';
import { formatCOP, formatDate, formatTime, colombiaStartOfDay, colombiaStartOfMonth } from '@/src/domain/services/FormatterService';
import { MonthKey } from '@/src/domain/value-objects/MonthKey';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const sb = getSupabase();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <AppShell><p className="empty">Cargando…</p></AppShell>;

  if (!user || !isAdmin) {
    async function login() {
      setError(''); setBusy(true);
      const { error: signInError } = await sb.auth.signInWithPassword({ email, password: pass });
      setBusy(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      const { data } = await sb.auth.getUser();
      if (data.user) {
        const { data: prof } = await sb.from('admin_profiles').select('user_id').eq('user_id', data.user.id).maybeSingle();
        if (!prof) {
          await sb.auth.signOut();
          setError('Esta cuenta no tiene privilegios de administrador.');
        }
      }
    }
    return (
      <AppShell>
        <div className="ph"><h2>Acceso administrativo</h2><p>Inicia sesión para acceder al panel</p></div>
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="mh">🛠️ Iniciar sesión</div>
          <div className="fld" style={{ marginBottom: 10 }}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@conjunto.com" />
          </div>
          <div className="fld" style={{ marginBottom: 10 }}>
            <label>Contraseña</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') login(); }} />
          </div>
          {error && <div className="al ae">⚠️ {error}</div>}
          <button className="btn bp" onClick={login} disabled={busy || !email || !pass}>{busy ? 'Verificando…' : '🔐 Entrar'}</button>
        </div>
      </AppShell>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'movimientos' | 'pagos' | 'cierres'>('overview');

  return (
    <AppShell>
      <div className="ph">
        <h2>Panel administrativo</h2>
        <p>Movimientos, pagos y cierres en tiempo real</p>
      </div>
      <Stats />
      <div className="card">
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--bd)', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {(['overview', 'movimientos', 'pagos', 'cierres'] as const).map((t) => (
            <button key={t} className={`btn ${tab === t ? 'bp' : 'bo'} sm`} onClick={() => setTab(t)}>
              {t === 'overview' ? '📡 Actividad' : t === 'movimientos' ? '🚗 Movimientos' : t === 'pagos' ? '💳 Pagos' : '🏦 Cierres'}
            </button>
          ))}
        </div>
        {tab === 'overview' && <ActivityList />}
        {tab === 'movimientos' && <MovimientosList />}
        {tab === 'pagos' && <PagosList />}
        {tab === 'cierres' && <CierresList />}
      </div>
    </AppShell>
  );
}

function Stats() {
  const sb = getSupabase();
  const [s, setS] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const todayStart = colombiaStartOfDay(new Date());
      const mesStart = colombiaStartOfMonth(new Date());
      const mk = MonthKey.current().value;
      const [resR, visAct, visHoy, pagosHoy, blq, pagosMes, mens] = await Promise.all([
        sb.from('residentes').select('tipo').is('deleted_at', null),
        sb.from('visitantes').select('id', { count: 'exact', head: true }).is('salida', null),
        sb.from('visitantes').select('total').not('salida', 'is', null).gte('salida', todayStart.toISOString()),
        sb.from('pagos_mensualidades').select('monto').gte('fecha', todayStart.toISOString()),
        sb.from('bloqueados').select('id', { count: 'exact', head: true }).is('desbloqueado_at', null),
        sb.from('pagos_mensualidades').select('monto').gte('fecha', mesStart.toISOString()),
        sb.from('mensualidades').select('estado').eq('mes_key', mk),
      ]);
      const residentes = resR.data ?? [];
      const recHoy = (visHoy.data ?? []).reduce((a: number, x: any) => a + (x.total ?? 0), 0)
        + (pagosHoy.data ?? []).reduce((a: number, x: any) => a + (x.monto ?? 0), 0);
      const recMes = (pagosMes.data ?? []).reduce((a: number, x: any) => a + (x.monto ?? 0), 0);
      const pendientes = (mens.data ?? []).filter((m: any) => m.estado === 'pendiente').length;
      const pagados = (mens.data ?? []).filter((m: any) => m.estado === 'pagado').length;
      setS({
        residentes: residentes.length,
        carros: residentes.filter((r: any) => r.tipo === 'carro').length,
        motos: residentes.filter((r: any) => r.tipo === 'moto').length,
        visAct: visAct.count ?? 0,
        recHoy, recMes,
        bloqueados: blq.count ?? 0,
        pendientes, pagados,
      });
    })();
  }, [sb]);

  if (!s) return <p className="empty">Cargando estadísticas…</p>;
  return (
    <div className="mets">
      <div className="met"><div className="met-ic">👥</div><div className="met-v">{s.residentes}</div><div className="met-l">Residentes ({s.carros} carros · {s.motos} motos)</div></div>
      <div className="met warn"><div className="met-ic">🚗</div><div className="met-v">{s.visAct}</div><div className="met-l">Visitantes activos</div></div>
      <div className="met"><div className="met-ic">💵</div><div className="met-v">{formatCOP(s.recHoy)}</div><div className="met-l">Recaudo hoy</div></div>
      <div className="met"><div className="met-ic">📅</div><div className="met-v">{formatCOP(s.recMes)}</div><div className="met-l">Recaudo del mes</div></div>
      <div className="met dng"><div className="met-ic">🚫</div><div className="met-v">{s.bloqueados}</div><div className="met-l">Aptos bloqueados</div></div>
      <div className="met warn"><div className="met-ic">⏳</div><div className="met-v">{s.pendientes}</div><div className="met-l">Mens. pendientes</div></div>
      <div className="met"><div className="met-ic">✅</div><div className="met-v">{s.pagados}</div><div className="met-l">Mens. pagadas</div></div>
    </div>
  );
}

function ActivityList() {
  const q = usePagedQuery<any>({ table: 'actividad', order: { column: 'ts', ascending: false }, pageSize: 25 });
  return (
    <div>
      {q.rows.length === 0 ? <p className="empty">Sin actividad.</p> :
        q.rows.map((a) => (
          <div key={a.id} style={{ display: 'flex', gap: 10, marginBottom: '.7rem' }}>
            <span style={{ width: 8, height: 8, marginTop: 6, borderRadius: 4, background: 'var(--leaf3)', flexShrink: 0 }} />
            <div><p style={{ fontSize: 13 }}>{a.msg}</p><small style={{ color: 'var(--ink3)' }}>{formatTime(a.ts)} · {formatDate(a.ts)}</small></div>
          </div>
        ))
      }
      <Pagination page={q.page} totalPages={q.totalPages} total={q.total} pageSize={q.pageSize} loading={q.loading} onChange={q.setPage} />
    </div>
  );
}

function MovimientosList() {
  const q = usePagedQuery<any>({ table: 'visitantes', notNull: ['salida'], order: { column: 'salida', ascending: false }, pageSize: 25 });
  return (
    <div>
      <div className="tw">
        <table>
          <thead><tr><th>Fecha</th><th>Placa</th><th>Tipo</th><th>Apto</th><th>Entrada</th><th>Salida</th><th>Total</th></tr></thead>
          <tbody>
            {q.rows.map((h) => (
              <tr key={h.id}>
                <td>{formatDate(h.salida)}</td><td><b>{h.placa}</b></td><td>{h.tipo}</td>
                <td>{h.cod}</td><td>{formatTime(h.entrada)}</td><td>{formatTime(h.salida)}</td>
                <td><b>{formatCOP(h.total ?? 0)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={q.page} totalPages={q.totalPages} total={q.total} pageSize={q.pageSize} loading={q.loading} onChange={q.setPage} />
    </div>
  );
}

function PagosList() {
  const q = usePagedQuery<any>({ table: 'pagos_mensualidades', order: { column: 'fecha', ascending: false }, pageSize: 25 });
  return (
    <div>
      <div className="tw">
        <table>
          <thead><tr><th>Fecha</th><th>Placa</th><th>Apto</th><th>Propietario</th><th>Mes</th><th>Monto</th></tr></thead>
          <tbody>
            {q.rows.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.fecha)} {formatTime(p.fecha)}</td>
                <td><b>{p.placa}</b></td><td>{p.cod}</td>
                <td>{p.nombre}</td><td>{p.mes_key}</td><td><b>{formatCOP(p.monto)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={q.page} totalPages={q.totalPages} total={q.total} pageSize={q.pageSize} loading={q.loading} onChange={q.setPage} />
    </div>
  );
}

function CierresList() {
  const q = usePagedQuery<any>({ table: 'cierres_caja', order: { column: 'fecha', ascending: false }, pageSize: 25 });
  return (
    <div>
      <div className="tw">
        <table>
          <thead><tr><th>Fecha</th><th>Cobros vis.</th><th>Total vis.</th><th>Mens.</th><th>Total mens.</th><th>IVA</th><th>Total caja</th></tr></thead>
          <tbody>
            {q.rows.map((c) => (
              <tr key={c.id}>
                <td>{formatDate(c.fecha)}</td>
                <td>{c.cobros_vis}</td><td>{formatCOP(c.total_vis)}</td>
                <td>{c.cobros_mens}</td><td>{formatCOP(c.total_mens)}</td>
                <td>{formatCOP(c.total_iva)}</td><td><b>{formatCOP(c.total)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={q.page} totalPages={q.totalPages} total={q.total} pageSize={q.pageSize} loading={q.loading} onChange={q.setPage} />
    </div>
  );
}

