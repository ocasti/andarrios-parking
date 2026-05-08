import type { Residente, Actividad } from '../../entities';

export interface EliminarResidenteDeps {
  residenteRepo: {
    obtenerPorId(id: string): Promise<Residente | undefined>;
    eliminar(id: string, stamp: string): Promise<void>;
  };
  actividadRepo: {
    registrar(a: Actividad): Promise<void>;
  };
  ahora(): string;
}

export async function eliminarResidente(
  id: string,
  deps: EliminarResidenteDeps,
): Promise<void> {
  const residente = await deps.residenteRepo.obtenerPorId(id);
  if (!residente) {
    return;
  }

  const stamp = deps.ahora();
  await deps.residenteRepo.eliminar(id, stamp);

  await deps.actividadRepo.registrar({
    id: stamp + '-act',
    msg: `Residente eliminado: ${residente.nombre} (${residente.placa})`,
    ts: stamp,
    tipo: 'residente',
  });
}
