import type { Residente, NuevoResidente, Mensualidad, Actividad } from '../../entities';

export interface RegistrarResidenteInput {
  cod: string;
  torre: number;
  piso: number;
  apto: number;
  placa: string;
  tipo: Residente['tipo'];
  nombre: string;
  cel: string | null;
}

export interface RegistrarResidenteDeps {
  residenteRepo: {
    crear(r: NuevoResidente & { id: string }): Promise<Residente>;
    existePlaca(p: string): Promise<boolean>;
  };
  mensualidadRepo: {
    crear(m: Mensualidad): Promise<Mensualidad>;
  };
  actividadRepo: {
    registrar(a: Actividad): Promise<void>;
  };
  generarId(): string;
  ahora(): string;
  mesKeyActual(): string;
}

export async function registrarResidente(
  input: RegistrarResidenteInput,
  deps: RegistrarResidenteDeps,
): Promise<Residente> {
  const placaExiste = await deps.residenteRepo.existePlaca(input.placa);
  if (placaExiste) {
    throw new Error('La placa ya está registrada');
  }

  const ahora = deps.ahora();
  const id = deps.generarId();

  const residente = await deps.residenteRepo.crear({
    id,
    cod: input.cod,
    torre: input.torre,
    piso: input.piso,
    apto: input.apto,
    placa: input.placa,
    tipo: input.tipo,
    nombre: input.nombre,
    cel: input.cel,
    fechaRegistro: ahora,
  });

  const mesKey = deps.mesKeyActual();
  await deps.mensualidadRepo.crear({
    id: deps.generarId(),
    residenteId: id,
    mesKey,
    estado: 'pendiente',
    fechaPago: null,
    monto: null,
    createdAt: ahora,
    updatedAt: ahora,
  });

  await deps.actividadRepo.registrar({
    id: deps.generarId(),
    msg: `Residente registrado: ${input.nombre} (${input.placa})`,
    ts: ahora,
    tipo: 'residente',
  });

  return residente;
}
