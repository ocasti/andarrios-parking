'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { initSync, subscribeStatus } from '@/lib/sync';

interface NavItem { href: string; label: string; icon: string; section?: string }
const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: '📊', section: 'Principal' },
  { href: '/visitantes', label: 'Visitantes', icon: '🚗' },
  { href: '/residentes', label: 'Residentes', icon: '👥' },
  { href: '/mensualidades', label: 'Mensualidades', icon: '📅', section: 'Gestión' },
  { href: '/control', label: 'Control acceso', icon: '🔒' },
  { href: '/caja', label: 'Cierre de caja', icon: '💰' },
  { href: '/tarifas', label: 'Tarifas', icon: '🪙', section: 'Configuración' },
  { href: '/reportes', label: 'Reportes', icon: '📑' },
  { href: '/admin', label: 'Panel admin', icon: '🛠️', section: 'Admin' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [status, setStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [pending, setPending] = useState(0);
  const [clock, setClock] = useState('');

  useEffect(() => { void initSync(); }, []);
  useEffect(() => {
    const unsub = subscribeStatus((s, p) => { setStatus(s); setPending(p); });
    return () => { unsub(); };
  }, []);
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(n.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + n.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const lastSection = { value: '' };

  return (
    <>
      <header className="hdr">
        <div className="logo">
          <div style={{ width: 42, height: 42, background: '#2d7a5c', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 64 64">
              <ellipse cx="30" cy="36" rx="16" ry="9" fill="#fff" opacity="0.92"/>
              <ellipse cx="30" cy="34" rx="15" ry="7" fill="#c8d8b0" opacity="0.85"/>
              <circle cx="44" cy="29" r="6.5" fill="#fff" opacity="0.92"/>
              <path d="M50 29 L60 27.5 L50 30.5Z" fill="#c8922a"/>
            </svg>
          </div>
          <div>
            <div className="logo-name">Andarríos</div>
            <div className="logo-sub">Sistema de parqueadero</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className={`status-bar ${status}`}>
            <span className="dot" />
            {status === 'online' && (pending > 0 ? `Sincronizando (${pending})` : 'En línea · sincronizado')}
            {status === 'offline' && (pending > 0 ? `Sin red — ${pending} pendientes` : 'Sin red')}
            {status === 'syncing' && `Sincronizando…${pending ? ` (${pending})` : ''}`}
          </span>
          <span style={{ fontSize: 12, color: 'var(--leaf4)' }}>{clock}</span>
        </div>
      </header>
      <div className="layout">
        <nav className="sb">
          {NAV.map((n) => {
            const showSection = n.section && n.section !== lastSection.value;
            if (showSection) lastSection.value = n.section!;
            return (<div key={n.href}>{showSection && <div className="ns">{n.section}</div>}<Link href={n.href} className={`nb ${path === n.href ? 'on' : ''}`}><span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}</Link></div>);
          })}
        </nav>
        <main className="ct">{children}</main>
      </div>
    </>
  );
}
