'use client';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({ page, totalPages, total, pageSize, onChange, loading }: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 8,
      marginTop: '.9rem', paddingTop: '.7rem', borderTop: '1px solid var(--bd)',
      fontSize: 12, color: 'var(--ink3)',
    }}>
      <div>
        {loading ? 'Cargando…' : total === 0 ? 'Sin resultados' : `${from}–${to} de ${total}`}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn bo xs" disabled={page <= 1 || loading} onClick={() => onChange(1)}>« Inicio</button>
        <button className="btn bo xs" disabled={page <= 1 || loading} onClick={() => onChange(page - 1)}>‹ Anterior</button>
        <span style={{ padding: '4px 10px', fontWeight: 600, color: 'var(--leaf)' }}>{page} / {totalPages}</span>
        <button className="btn bo xs" disabled={page >= totalPages || loading} onClick={() => onChange(page + 1)}>Siguiente ›</button>
        <button className="btn bo xs" disabled={page >= totalPages || loading} onClick={() => onChange(totalPages)}>Fin »</button>
      </div>
    </div>
  );
}
