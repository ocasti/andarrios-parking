export interface Bloqueado {
  id: string;
  cod: string;
  motivo: string;
  fechaBloqueo: string;
  desbloqueadoAt: string | null;
}
