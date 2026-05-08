import type { TipoVehiculo } from './Residente';

export interface PagoMensualidad {
  id: string;
  residenteId: string;
  placa: string;
  cod: string;
  nombre: string;
  tipo: TipoVehiculo;
  fecha: string;
  monto: number;
  mesKey: string;
}
