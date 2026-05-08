import type { IVisitanteRepository } from '../../../domain/repositories/IVisitanteRepository';
import type { Visitante } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { visitanteFromRow, visitanteToRow } from '../mappers';

export class DexieVisitanteRepository implements IVisitanteRepository {
  constructor(private readonly db: AndarriosDB) {}

  async crear(visitante: Visitante): Promise<Visitante> {
    await this.db.visitantes.add(visitanteToRow(visitante));
    return visitante;
  }

  async obtenerPorId(id: string): Promise<Visitante | undefined> {
    const row = await this.db.visitantes.get(id);
    return row ? visitanteFromRow(row) : undefined;
  }

  async listarActivos(): Promise<Visitante[]> {
    const rows = await this.db.visitantes
      .filter((v) => v.salida == null)
      .toArray();
    return rows.map(visitanteFromRow);
  }

  async registrarSalida(id: string, datos: Partial<Visitante>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (datos.salida !== undefined) updates['salida'] = datos.salida;
    if (datos.horas !== undefined) updates['horas'] = datos.horas;
    if (datos.base !== undefined) updates['base'] = datos.base;
    if (datos.iva !== undefined) updates['iva'] = datos.iva;
    if (datos.total !== undefined) updates['total'] = datos.total;
    updates['updated_at'] = new Date().toISOString();
    await this.db.visitantes.update(id, updates);
  }

  async contarActivos(): Promise<number> {
    return this.db.visitantes
      .filter((v) => v.salida == null)
      .count();
  }

  async existePlacaActiva(placa: string): Promise<boolean> {
    const count = await this.db.visitantes
      .where('placa')
      .equals(placa)
      .filter((v) => v.salida == null)
      .count();
    return count > 0;
  }

  async obtenerUltimaSalidaPorPlaca(placa: string, desde: string): Promise<Visitante | undefined> {
    const rows = await this.db.visitantes
      .where('placa')
      .equals(placa)
      .filter((v) => v.salida != null && v.salida >= desde)
      .toArray();
    if (rows.length === 0) return undefined;
    rows.sort((a, b) => (b.salida ?? '').localeCompare(a.salida ?? ''));
    return visitanteFromRow(rows[0]);
  }
}
