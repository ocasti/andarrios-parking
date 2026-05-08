import type { IActividadRepository } from '../../../domain/repositories/IActividadRepository';
import type { Actividad } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { actividadToRow } from '../mappers';

export class DexieActividadRepository implements IActividadRepository {
  constructor(private readonly db: AndarriosDB) {}

  async registrar(a: Actividad): Promise<void> {
    await this.db.actividad.add(actividadToRow(a));
  }
}
