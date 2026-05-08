'use client';
import { useEffect } from 'react';
import { ApartmentCode } from '@/src/domain/value-objects/ApartmentCode';
import { TOWERS, FLOORS_PER_TOWER, UNITS_PER_FLOOR } from '@/src/domain/constants';

interface Props {
  tower: string;
  apt: string; // full selected code, e.g. "T08-304"
  onChange: (tower: string, aptCode: string) => void;
}

export default function AptoSelector({ tower, apt, onChange }: Props) {
  const options: Array<{ value: string; label: string }> = [];
  if (tower) {
    const t = parseInt(tower, 10);
    for (let floor = 1; floor <= FLOORS_PER_TOWER; floor++) {
      for (let unit = 1; unit <= UNITS_PER_FLOOR; unit++) {
        const aptCode = ApartmentCode.fromParts(t, floor, unit).toString();
        options.push({ value: aptCode, label: `${floor}0${unit}  (${aptCode})` });
      }
    }
  }

  // If tower changes and the current apt code is no longer valid, clear the apt
  useEffect(() => {
    if (apt && tower && !apt.startsWith(`T${String(tower).padStart(2, '0')}-`)) {
      onChange(tower, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tower]);

  return (
    <>
      <div className="fld">
        <label htmlFor="apto-torre">Tower</label>
        <select id="apto-torre" value={tower} onChange={(e) => onChange(e.target.value, '')}>
          <option value="">Select</option>
          {Array.from({ length: TOWERS }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label htmlFor="apto-sel">Apartment</label>
        <select
          id="apto-sel"
          value={apt}
          onChange={(e) => onChange(tower, e.target.value)}
          disabled={!tower}
        >
          <option value="">— Select apartment —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label htmlFor="apto-cod">Apt code</label>
        <input id="apto-cod" type="text" readOnly value={apt || ''} placeholder="T00-000" />
      </div>
    </>
  );
}
