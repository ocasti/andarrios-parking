import type { IPagoMensualidadRepository } from '../../../domain/repositories/IPagoMensualidadRepository';
import type { PagoMensualidad } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { pagoMensualidadToRow } from '../mappers';

export class DexiePagoMensualidadRepository implements IPagoMensualidadRepository {
  constructor(private readonly db: AndarriosDB) {}

  async crear(pago: PagoMensualidad): Promise<void> {
    await this.db.pagos.add(pagoMensualidadToRow(pago));
  }
}
