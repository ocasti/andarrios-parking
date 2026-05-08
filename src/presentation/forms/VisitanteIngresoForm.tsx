'use client';
import { useState } from 'react';
import AptoSelector from '@/src/presentation/components/ui/AptoSelector';

export interface VisitanteIngresoFormData {
  cod: string;
  placa: string;
  tipo: 'carro' | 'moto';
  nombre: string;
  tel: string;
}

export interface VisitanteIngresoFormProps {
  onSubmit: (data: VisitanteIngresoFormData) => Promise<void>;
  disabled?: boolean;
  bloqueados?: Set<string>;
  error?: string;
}

export default function VisitanteIngresoForm({
  onSubmit,
  disabled = false,
  bloqueados,
  error: externalError,
}: VisitanteIngresoFormProps) {
  const [torre, setTorre] = useState('');
  const [apto, setApto] = useState('');
  const [tipo, setTipo] = useState<'carro' | 'moto'>('carro');
  const [placa, setPlaca] = useState('');
  const [nombre, setNombre] = useState('');
  const [tel, setTel] = useState('');
  const [internalError, setInternalError] = useState('');

  const displayError = internalError || externalError;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInternalError('');

    if (!apto) {
      setInternalError('Selecciona torre y apartamento.');
      return;
    }

    const placaUp = placa.toUpperCase().trim();
    if (!placaUp) {
      setInternalError('Ingresa la placa del vehículo.');
      return;
    }

    await onSubmit({
      cod: apto,
      placa: placaUp,
      tipo,
      nombre: nombre.trim() || 'Visitante',
      tel: tel.trim(),
    });

    // Reset on success (caller controls disabled state to indicate in-flight)
    setTorre('');
    setApto('');
    setPlaca('');
    setNombre('');
    setTel('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="g3" style={{ marginBottom: 10 }}>
        <AptoSelector
          torre={torre}
          apto={apto}
          onChange={(t, a) => {
            setTorre(t);
            setApto(a);
          }}
        />
      </div>

      <div className="g4" style={{ marginBottom: 10 }}>
        <div className="fld">
          <label htmlFor="vis-tipo">Tipo</label>
          <select
            id="vis-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'carro' | 'moto')}
          >
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
          </select>
        </div>

        <div className="fld">
          <label htmlFor="vis-placa">Placa</label>
          <input
            id="vis-placa"
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            placeholder="ABC-123"
            maxLength={7}
          />
        </div>

        <div className="fld">
          <label htmlFor="vis-nombre">Nombre visitante (opcional)</label>
          <input
            id="vis-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="fld">
          <label htmlFor="vis-tel">Teléfono (opcional)</label>
          <input
            id="vis-tel"
            type="text"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="300 000 0000"
          />
        </div>
      </div>

      {displayError && <div className="al ae">{displayError}</div>}

      <button type="submit" className="btn bp" disabled={disabled}>
        {disabled ? 'Sin cupos disponibles' : 'Registrar ingreso'}
      </button>
    </form>
  );
}
