import type { CierreCaja } from '../entities';

export interface ICierreCajaRepository {
  crear(cierre: CierreCaja): Promise<void>;
  listar(): Promise<CierreCaja[]>;
}
