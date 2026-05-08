'use client';

export interface StatusBarProps {
  status: 'online' | 'offline' | 'syncing';
  pending: number;
}

export default function StatusBar({ status, pending }: StatusBarProps) {
  let label: string;

  if (status === 'syncing') {
    label = `Syncing… (${pending})`;
  } else if (status === 'online') {
    label = pending > 0 ? `Syncing (${pending})` : 'Online';
  } else {
    // offline
    label = pending > 0 ? `No network — ${pending} pending` : 'No network';
  }

  return (
    <span className={`status-bar ${status}`} data-testid="status-bar">
      <span className="dot" />
      <span className="hide-mobile">{label}</span>
    </span>
  );
}
