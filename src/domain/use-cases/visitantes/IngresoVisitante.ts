import type { Visitante, Actividad } from '../../entities';
import type { IVisitanteRepository } from '../../repositories/IVisitanteRepository';
import type { IActividadRepository } from '../../repositories/IActividadRepository';
import { evaluarCortesia } from '../../services/CortesiaService';

export interface IngresoVisitanteInput {
  cod: string;
  placa: string;
  tipo: Visitante['tipo'];
  nombre: string;
  tel: string | null;
  horasMinRecortesia: number;
  historialReciente: Array<{ salidaAt: string }>;
}

export interface IngresoVisitanteOutput {
  visitante: Visitante;
  cortesiaAplica: boolean;
}

export interface IngresoVisitanteDeps {
  visitanteRepo: IVisitanteRepository;
  actividadRepo: IActividadRepository;
  generarId(): string;
  ahora(): string;
}

export async function ingresoVisitante(
  input: IngresoVisitanteInput,
  deps: IngresoVisitanteDeps,
): Promise<IngresoVisitanteOutput> {
  const ts = deps.ahora();
  const id = deps.generarId();

  const cortesiaAplica = evaluarCortesia(input.historialReciente, input.horasMinRecortesia);

  const visitante: Visitante = {
    id,
    cod: input.cod,
    placa: input.placa,
    tipo: input.tipo,
    nombre: input.nombre,
    tel: input.tel,
    entrada: ts,
    salida: null,
    horas: null,
    base: null,
    iva: null,
    total: null,
    cortesiaAplica,
    createdAt: ts,
    updatedAt: ts,
  };

  const visitanteCreado = await deps.visitanteRepo.crear(visitante);

  const sufijo = cortesiaAplica ? '' : ' · sin cortesía (reingreso)';
  const actividad: Actividad = {
    id: deps.generarId(),
    msg: `Ingreso visitante: ${input.placa} (${input.tipo}) → ${input.cod}${sufijo}`,
    ts,
    tipo: 'visitante',
  };
  await deps.actividadRepo.registrar(actividad);

  return { visitante: visitanteCreado, cortesiaAplica };
}
