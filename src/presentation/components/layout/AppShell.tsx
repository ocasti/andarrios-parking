'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { initSync, subscribeStatus } from '@/lib/sync';
import { useAuth, logout } from '@/src/application/hooks/useAuth';
import { PinLockGateway } from '@/src/infrastructure/auth/PinLockGateway';

const pinLock = new PinLockGateway();

interface NavItem { href: string; label: string; icon: string; }

const NAV_VIGILANTE: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/visitantes', label: 'Visitantes', icon: '🚗' },
  { href: '/caja', label: 'Caja', icon: '💰' },
];

const NAV_ADMIN: NavItem[] = [
  { href: '/admin', label: 'Panel', icon: '🛠️' },
  { href: '/visitantes', label: 'Visitantes', icon: '🚗' },
  { href: '/caja', label: 'Caja', icon: '💰' },
  { href: '/residentes', label: 'Residentes', icon: '👥' },
  { href: '/mensualidades', label: 'Mensualidades', icon: '📅' },
  { href: '/control', label: 'Control', icon: '🔒' },
  { href: '/tarifas', label: 'Tarifas', icon: '🪙' },
  { href: '/reportes', label: 'Reportes', icon: '📑' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { isAdmin, user } = useAuth();
  const [status, setStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [pending, setPending] = useState(0);
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    const upd = () => setLocked(!pinLock.isUnlocked());
    upd();
    window.addEventListener('pinlock-changed', upd);
    window.addEventListener('storage', upd);
    return () => {
      window.removeEventListener('pinlock-changed', upd);
      window.removeEventListener('storage', upd);
    };
  }, []);

  useEffect(() => { void initSync(); }, []);
  useEffect(() => {
    const unsub = subscribeStatus((s, p) => { setStatus(s); setPending(p); });
    return () => { unsub(); };
  }, []);
  useEffect(() => { setOpen(false); }, [path]);

  const visible = isAdmin ? NAV_ADMIN : NAV_VIGILANTE;
  const homeHref = isAdmin ? '/admin' : '/';

  return (
    <>
      <header className="hdr">
        <div className="hdr-left">
          <button className="menu-btn" aria-label="Menú" onClick={() => setOpen((v) => !v)}>
            {open ? '✕' : '☰'}
          </button>
          <Link href={homeHref} className="logo">
            <div className="logo-ic">
              <svg width="24" height="24" viewBox="0 0 64 64">
                <ellipse cx="30" cy="36" rx="16" ry="9" fill="#fff" opacity="0.92"/>
                <ellipse cx="30" cy="34" rx="15" ry="7" fill="#c8d8b0" opacity="0.85"/>
                <circle cx="44" cy="29" r="6.5" fill="#fff" opacity="0.92"/>
                <path d="M50 29 L60 27.5 L50 30.5Z" fill="#c8922a"/>
              </svg>
            </div>
            <div className="logo-text">
              <div className="logo-name">Andarríos</div>
              <div className="logo-sub">Parqueadero</div>
            </div>
          </Link>

          <nav className={`topnav ${open ? 'open' : ''}`}>
            {visible.map((n) => (
              <Link key={n.href} href={n.href} className={`tn ${path === n.href ? 'on' : ''}`}>
                <span className="tn-ic">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            ))}
            {isAdmin && (
              <button className="tn tn-logout" onClick={() => { void logout(); }} title={user?.email ?? ''}>
                <span className="tn-ic">🔓</span>
                <span>Salir</span>
              </button>
            )}
            {!isAdmin && !locked && (
              <button
                className="tn tn-logout"
                onClick={() => { pinLock.lock(); window.location.reload(); }}
                title="Bloquea la portería y pide PIN otra vez"
              >
                <span className="tn-ic">🔒</span>
                <span>Cerrar turno</span>
              </button>
            )}
          </nav>
        </div>

        <div className="hdr-right">
          <span className={`status-bar ${status}`}>
            <span className="dot" />
            <span className="hide-mobile">
              {status === 'online' && (pending > 0 ? `Sincronizando (${pending})` : 'En línea')}
              {status === 'offline' && (pending > 0 ? `Sin red — ${pending}` : 'Sin red')}
              {status === 'syncing' && `Sincronizando…${pending ? ` (${pending})` : ''}`}
            </span>
          </span>
        </div>
      </header>

      {open && <div className="overlay-mobile" onClick={() => setOpen(false)} />}

      <main className="ct">{children}</main>

      <style jsx global>{`
        .hdr {
          background: var(--leaf); color: #fff;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1rem; height: 60px;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 16px rgba(0,0,0,.25);
        }
        .hdr-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .hdr-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .menu-btn {
          display: none; background: transparent; border: none;
          color: #fff; font-size: 22px; cursor: pointer; padding: 4px 8px;
          line-height: 1;
        }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff; flex-shrink: 0; }
        .logo-ic {
          width: 38px; height: 38px; background: var(--leaf2);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-name { font-family: 'Playfair Display', serif; font-size: 18px; letter-spacing: .5px; line-height: 1.1; }
        .logo-sub { font-size: 9px; color: var(--leaf4); letter-spacing: 2px; text-transform: uppercase; font-weight: 300; }

        .topnav { display: flex; align-items: center; gap: 4px; margin-left: 8px; flex-wrap: wrap; }
        .tn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px;
          color: rgba(255,255,255,.7); text-decoration: none;
          font-size: 13px; font-weight: 500;
          border: none; background: transparent; cursor: pointer;
          transition: all .15s; white-space: nowrap;
        }
        .tn:hover { color: #fff; background: rgba(255,255,255,.08); }
        .tn.on { color: #fff; background: rgba(255,255,255,.13); }
        .tn-ic { font-size: 14px; }
        .tn-logout { margin-left: 4px; opacity: .8; }

        .ct { padding: 1.6rem; max-width: 1400px; margin: 0 auto; }
        .overlay-mobile { display: none; }

        @media (max-width: 980px) {
          .topnav { display: none; }
          .menu-btn { display: inline-flex; align-items: center; justify-content: center; }
          .topnav.open {
            display: flex; flex-direction: column; align-items: stretch; gap: 4px;
            position: fixed; left: 0; right: 0; top: 60px;
            background: var(--leaf); padding: 1rem;
            box-shadow: 0 8px 24px rgba(0,0,0,.3);
            z-index: 95; max-height: calc(100vh - 60px); overflow-y: auto;
            margin: 0;
          }
          .topnav.open .tn { padding: 12px 14px; font-size: 14px; }
          .overlay-mobile {
            display: block; position: fixed; inset: 60px 0 0 0;
            background: rgba(0,0,0,.4); backdrop-filter: blur(2px);
            z-index: 90;
          }
          .logo-text { display: none; }
          .ct { padding: 1rem; }
        }
        @media (max-width: 600px) {
          .hide-mobile { display: none !important; }
          .status-bar { padding: 4px 8px; }
        }
      `}</style>
    </>
  );
}
