import type { ICierreCajaRepository } from '../../../domain/repositories/ICierreCajaRepository';
import type { CierreCaja } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { cierreCajaFromRow, cierreCajaToRow } from '../mappers';

export class DexieCierreCajaRepository implements ICierreCajaRepository {
  constructor(private readonly db: AndarriosDB) {}

  async crear(cierre: CierreCaja): Promise<void> {
    await this.db.cierres.add(cierreCajaToRow(cierre));
  }

  async listar(): Promise<CierreCaja[]> {
    const rows = await this.db.cierres.toArray();
    return rows.map(cierreCajaFromRow);
  }
}
