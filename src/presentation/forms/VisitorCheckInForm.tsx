'use client';
import { useState } from 'react';
import AptoSelector from '@/src/presentation/components/ui/AptoSelector';

export interface VisitorCheckInFormData {
  aptCode: string;
  plate: string;
  vehicleType: 'car' | 'motorcycle';
  name: string;
  phone: string;
}

export interface VisitorCheckInFormProps {
  onSubmit: (data: VisitorCheckInFormData) => Promise<void>;
  disabled?: boolean;
  blocked?: Set<string>;
  error?: string;
}

export default function VisitorCheckInForm({
  onSubmit,
  disabled = false,
  blocked,
  error: externalError,
}: VisitorCheckInFormProps) {
  const [tower, setTower] = useState('');
  const [apt, setApt] = useState('');
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle'>('car');
  const [plate, setPlate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [internalError, setInternalError] = useState('');

  const displayError = internalError || externalError;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInternalError('');

    if (!apt) {
      setInternalError('Select tower and apartment.');
      return;
    }

    const plateUp = plate.toUpperCase().trim();
    if (!plateUp) {
      setInternalError('Enter the vehicle license plate.');
      return;
    }

    await onSubmit({
      aptCode: apt,
      plate: plateUp,
      vehicleType,
      name: name.trim() || 'Visitor',
      phone: phone.trim(),
    });

    // Reset on success (caller controls disabled state to indicate in-flight)
    setTower('');
    setApt('');
    setPlate('');
    setName('');
    setPhone('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="g3" style={{ marginBottom: 10 }}>
        <AptoSelector
          tower={tower}
          apt={apt}
          onChange={(t, a) => {
            setTower(t);
            setApt(a);
          }}
        />
      </div>

      <div className="g4" style={{ marginBottom: 10 }}>
        <div className="fld">
          <label htmlFor="vis-tipo">Type</label>
          <select
            id="vis-tipo"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as 'car' | 'motorcycle')}
          >
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
          </select>
        </div>

        <div className="fld">
          <label htmlFor="vis-placa">License plate</label>
          <input
            id="vis-placa"
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="ABC-123"
            maxLength={7}
          />
        </div>

        <div className="fld">
          <label htmlFor="vis-nombre">Visitor name (optional)</label>
          <input
            id="vis-nombre"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="fld">
          <label htmlFor="vis-tel">Phone (optional)</label>
          <input
            id="vis-tel"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="300 000 0000"
          />
        </div>
      </div>

      {displayError && <div className="al ae">{displayError}</div>}

      <button type="submit" className="btn bp" disabled={disabled}>
        {disabled ? 'No available spots' : 'Register entry'}
      </button>
    </form>
  );
}
