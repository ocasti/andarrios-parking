import type { IVisitorRepository } from '../../../domain/repositories/IVisitorRepository';
import type { Visitor } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { visitorFromRow, visitorToRow } from '../mappers';

export class DexieVisitorRepository implements IVisitorRepository {
  constructor(private readonly db: AndarriosDB) {}

  async create(visitor: Visitor): Promise<Visitor> {
    await this.db.visitantes.add(visitorToRow(visitor));
    return visitor;
  }

  async findById(id: string): Promise<Visitor | undefined> {
    const row = await this.db.visitantes.get(id);
    return row ? visitorFromRow(row) : undefined;
  }

  async listActive(): Promise<Visitor[]> {
    const rows = await this.db.visitantes
      .filter((v) => v.salida == null)
      .toArray();
    return rows.map(visitorFromRow);
  }

  async recordCheckOut(id: string, data: Partial<Visitor>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.checkOut !== undefined) updates['salida'] = data.checkOut;
    if (data.hours !== undefined) updates['horas'] = data.hours;
    if (data.baseAmount !== undefined) updates['base'] = data.baseAmount;
    if (data.tax !== undefined) updates['iva'] = data.tax;
    if (data.total !== undefined) updates['total'] = data.total;
    updates['updated_at'] = new Date().toISOString();
    await this.db.visitantes.update(id, updates);
  }

  async countActive(): Promise<number> {
    return this.db.visitantes
      .filter((v) => v.salida == null)
      .count();
  }

  async activePlateExists(plate: string): Promise<boolean> {
    const count = await this.db.visitantes
      .where('placa')
      .equals(plate)
      .filter((v) => v.salida == null)
      .count();
    return count > 0;
  }

  async findLastCheckOutByPlate(plate: string, since: string): Promise<Visitor | undefined> {
    const rows = await this.db.visitantes
      .where('placa')
      .equals(plate)
      .filter((v) => v.salida != null && v.salida >= since)
      .toArray();
    if (rows.length === 0) return undefined;
    rows.sort((a, b) => (b.salida ?? '').localeCompare(a.salida ?? ''));
    return visitorFromRow(rows[0]);
  }
}
