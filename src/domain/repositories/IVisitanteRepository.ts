import type { Visitante } from '../entities';

export interface IVisitanteRepository {
  crear(visitante: Visitante): Promise<Visitante>;
  obtenerPorId(id: string): Promise<Visitante | undefined>;
  listarActivos(): Promise<Visitante[]>;  // sin salida
  registrarSalida(id: string, datos: Partial<Visitante>): Promise<void>;
  contarActivos(): Promise<number>;
  existePlacaActiva(placa: string): Promise<boolean>;
  obtenerUltimaSalidaPorPlaca(placa: string, desde: string): Promise<Visitante | undefined>;
}
