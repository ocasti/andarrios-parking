'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  loading?: boolean;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
  loading,
}: PaginationProps) {
  if (totalPages <= 1 && total <= pageSize) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[var(--bd)] text-xs text-[var(--ink3)]">
      <div>
        {loading
          ? 'Cargando…'
          : total === 0
          ? 'Sin resultados'
          : `${from}–${to} de ${total}`}
      </div>
      <div className="flex gap-1.5">
        <button
          className="btn bo xs"
          disabled={page <= 1 || loading}
          onClick={() => onChange(1)}
        >
          « Inicio
        </button>
        <button
          className="btn bo xs"
          disabled={page <= 1 || loading}
          onClick={() => onChange(page - 1)}
        >
          ‹ Anterior
        </button>
        <span className="px-2.5 py-1 font-semibold text-[var(--leaf)]">
          {page} / {totalPages}
        </span>
        <button
          className="btn bo xs"
          disabled={page >= totalPages || loading}
          onClick={() => onChange(page + 1)}
        >
          Siguiente ›
        </button>
        <button
          className="btn bo xs"
          disabled={page >= totalPages || loading}
          onClick={() => onChange(totalPages)}
        >
          Fin »
        </button>
      </div>
    </div>
  );
}
