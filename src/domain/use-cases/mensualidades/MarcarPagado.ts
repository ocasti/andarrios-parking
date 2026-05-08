import type { Residente, Mensualidad, PagoMensualidad, Actividad } from '../../entities';

export interface MarcarPagadoInput {
  residenteId: string;
  tarifa: {
    carroMes: number;
    motoMes: number;
  };
  mesKey: string;
}

export interface MarcarPagadoDeps {
  residenteRepo: {
    obtenerPorId(id: string): Promise<Residente | undefined>;
  };
  mensualidadRepo: {
    obtenerPorResidenteYMes(rid: string, mk: string): Promise<Mensualidad | undefined>;
    crear(m: Mensualidad): Promise<Mensualidad>;
    actualizar(id: string, datos: Partial<Mensualidad>): Promise<void>;
  };
  pagoRepo: {
    crear(p: PagoMensualidad): Promise<void>;
  };
  actividadRepo: {
    registrar(a: Actividad): Promise<void>;
  };
  generarId(): string;
  ahora(): string;
}

export async function marcarPagado(
  input: MarcarPagadoInput,
  deps: MarcarPagadoDeps,
): Promise<void> {
  const residente = await deps.residenteRepo.obtenerPorId(input.residenteId);
  if (!residente) {
    throw new Error('Residente no encontrado');
  }

  const monto =
    residente.tipo === 'carro' ? input.tarifa.carroMes : input.tarifa.motoMes;

  const ahora = deps.ahora();

  const mensualidadExistente = await deps.mensualidadRepo.obtenerPorResidenteYMes(
    input.residenteId,
    input.mesKey,
  );

  if (mensualidadExistente) {
    await deps.mensualidadRepo.actualizar(mensualidadExistente.id, {
      estado: 'pagado',
      fechaPago: ahora,
      monto,
      updatedAt: ahora,
    });
  } else {
    await deps.mensualidadRepo.crear({
      id: deps.generarId(),
      residenteId: input.residenteId,
      mesKey: input.mesKey,
      estado: 'pagado',
      fechaPago: ahora,
      monto,
      createdAt: ahora,
      updatedAt: ahora,
    });
  }

  await deps.pagoRepo.crear({
    id: deps.generarId(),
    residenteId: residente.id,
    placa: residente.placa,
    cod: residente.cod,
    nombre: residente.nombre,
    tipo: residente.tipo,
    fecha: ahora,
    monto,
    mesKey: input.mesKey,
  });

  await deps.actividadRepo.registrar({
    id: deps.generarId(),
    msg: `Mensualidad pagada: ${residente.nombre} (${residente.placa}) — ${input.mesKey} $${monto}`,
    ts: ahora,
    tipo: 'mensualidad',
  });
}
