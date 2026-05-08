import type { CierreCaja, Actividad } from '../../entities';

export interface RealizarCierreInput {
  cobrosVis: number;
  totalVis: number;
  cobrosMens: number;
  totalMens: number;
  totalIva: number;
}

export interface RealizarCierreDeps {
  cierreRepo: {
    crear(c: CierreCaja): Promise<void>;
  };
  actividadRepo: {
    registrar(a: Actividad): Promise<void>;
  };
  generarId(): string;
  ahora(): string;
  fechaStr(): string; // YYYY-MM-DD Colombia
}

export async function realizarCierre(
  input: RealizarCierreInput,
  deps: RealizarCierreDeps,
): Promise<CierreCaja> {
  const total = input.totalVis + input.totalMens;
  const ahora = deps.ahora();

  const cierre: CierreCaja = {
    id: deps.generarId(),
    fecha: ahora,
    fechaStr: deps.fechaStr(),
    cobrosVis: input.cobrosVis,
    totalVis: input.totalVis,
    cobrosMens: input.cobrosMens,
    totalMens: input.totalMens,
    totalIva: input.totalIva,
    total,
  };

  await deps.cierreRepo.crear(cierre);

  await deps.actividadRepo.registrar({
    id: deps.generarId(),
    msg: `Cierre de caja: ${cierre.fechaStr} — total $${total}`,
    ts: ahora,
    tipo: 'caja',
  });

  return cierre;
}
