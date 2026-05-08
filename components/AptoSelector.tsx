'use client';
import { useEffect } from 'react';
import { genCod } from '@/lib/actions';

interface Props {
  torre: string;
  apto: string; // código completo seleccionado, e.g. "T08-304"
  onChange: (torre: string, cod: string) => void;
}

export default function AptoSelector({ torre, apto, onChange }: Props) {
  // Lista de apartamentos posibles para la torre seleccionada
  const opciones: Array<{ value: string; label: string }> = [];
  if (torre) {
    const t = parseInt(torre, 10);
    for (let piso = 1; piso <= 6; piso++) {
      for (let a = 1; a <= 4; a++) {
        const cod = genCod(t, piso, a);
        opciones.push({ value: cod, label: `${piso}0${a}  (${cod})` });
      }
    }
  }
  // Si cambia la torre y la opción ya no es válida, limpia el apto
  useEffect(() => {
    if (apto && torre && !apto.startsWith(`T${String(torre).padStart(2, '0')}-`)) {
      onChange(torre, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torre]);

  return (
    <>
      <div className="fld">
        <label>Torre</label>
        <select value={torre} onChange={(e) => onChange(e.target.value, '')}>
          <option value="">Selecciona</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label>Apartamento</label>
        <select value={apto} onChange={(e) => onChange(torre, e.target.value)} disabled={!torre}>
          <option value="">— Selecciona apartamento —</option>
          {opciones.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label>Código apto</label>
        <input type="text" readOnly value={apto || ''} placeholder="T00-000" />
      </div>
    </>
  );
}
