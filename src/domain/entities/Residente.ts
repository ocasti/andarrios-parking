export type TipoVehiculo = 'carro' | 'moto';

export interface Residente {
  id: string;
  cod: string;           // AptoCod string: T01-101
  torre: number;
  piso: number;
  apto: number;
  placa: string;         // normalizada a mayúsculas
  tipo: TipoVehiculo;
  nombre: string;
  cel: string | null;
  fechaRegistro: string; // ISO string
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type NuevoResidente = Omit<Residente, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
