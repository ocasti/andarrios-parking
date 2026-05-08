'use client';

export interface StatusBarProps {
  status: 'online' | 'offline' | 'syncing';
  pending: number;
}

export default function StatusBar({ status, pending }: StatusBarProps) {
  let label: string;

  if (status === 'syncing') {
    label = `Sincronizando… (${pending})`;
  } else if (status === 'online') {
    label = pending > 0 ? `Sincronizando (${pending})` : 'En línea';
  } else {
    // offline
    label = pending > 0 ? `Sin red — ${pending} pendientes` : 'Sin red';
  }

  return (
    <span className={`status-bar ${status}`} data-testid="status-bar">
      <span className="dot" />
      <span className="hide-mobile">{label}</span>
    </span>
  );
}
