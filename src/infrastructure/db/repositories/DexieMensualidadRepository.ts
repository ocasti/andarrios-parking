import type { IMensualidadRepository } from '../../../domain/repositories/IMensualidadRepository';
import type { Mensualidad } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { mensualidadFromRow, mensualidadToRow } from '../mappers';

export class DexieMensualidadRepository implements IMensualidadRepository {
  constructor(private readonly db: AndarriosDB) {}

  async crear(m: Mensualidad): Promise<Mensualidad> {
    await this.db.mensualidades.add(mensualidadToRow(m));
    return m;
  }

  async obtenerPorResidenteYMes(
    residenteId: string,
    mesKey: string,
  ): Promise<Mensualidad | undefined> {
    const row = await this.db.mensualidades
      .where('[residente_id+mes_key]')
      .equals([residenteId, mesKey])
      .first();
    return row ? mensualidadFromRow(row) : undefined;
  }

  async actualizar(id: string, datos: Partial<Mensualidad>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (datos.estado !== undefined) updates['estado'] = datos.estado;
    if (datos.fechaPago !== undefined) updates['fecha_pago'] = datos.fechaPago;
    if (datos.monto !== undefined) updates['monto'] = datos.monto;
    updates['updated_at'] = new Date().toISOString();
    await this.db.mensualidades.update(id, updates);
  }

  async upsert(m: Mensualidad): Promise<void> {
    await this.db.mensualidades.put(mensualidadToRow(m));
  }
}
