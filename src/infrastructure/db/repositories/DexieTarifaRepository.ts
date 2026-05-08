import type { ITarifaRepository } from '../../../domain/repositories/ITarifaRepository';
import type { Tarifa } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { tarifaFromRow, tarifaToRow } from '../mappers';
import { TARIFAS_ID } from '../../../domain/constants';

export class DexieTarifaRepository implements ITarifaRepository {
  constructor(private readonly db: AndarriosDB) {}

  async obtener(): Promise<Tarifa | undefined> {
    const row = await this.db.tarifas.get(TARIFAS_ID);
    return row ? tarifaFromRow(row) : undefined;
  }

  async guardar(t: Tarifa): Promise<void> {
    await this.db.tarifas.put(tarifaToRow(t));
  }
}
