import type { Tarifa, Actividad } from '../../entities';

export interface ActualizarTarifasDeps {
  tarifaRepo: {
    guardar(t: Tarifa): Promise<void>;
  };
  actividadRepo: {
    registrar(a: Actividad): Promise<void>;
  };
  ahora(): string;
}

export async function actualizarTarifas(
  datos: Partial<Omit<Tarifa, 'id' | 'updatedAt'>>,
  tarifaActual: Tarifa,
  deps: ActualizarTarifasDeps,
): Promise<Tarifa> {
  const updatedAt = deps.ahora();

  const tarifaActualizada: Tarifa = {
    ...tarifaActual,
    ...datos,
    updatedAt,
  };

  await deps.tarifaRepo.guardar(tarifaActualizada);

  await deps.actividadRepo.registrar({
    id: updatedAt + '-act',
    msg: `Tarifas actualizadas`,
    ts: updatedAt,
    tipo: 'tarifas',
  });

  return tarifaActualizada;
}
