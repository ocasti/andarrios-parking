export type EstadoMensualidad = 'pendiente' | 'pagado';

export interface Mensualidad {
  id: string;
  residenteId: string;
  mesKey: string;
  estado: EstadoMensualidad;
  fechaPago: string | null;
  monto: number | null;
  createdAt: string;
  updatedAt: string;
}
