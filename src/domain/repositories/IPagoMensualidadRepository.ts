import type { PagoMensualidad } from '../entities';

export interface IPagoMensualidadRepository {
  crear(pago: PagoMensualidad): Promise<void>;
}
