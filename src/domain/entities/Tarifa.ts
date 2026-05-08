export interface Tarifa {
  id: number;
  carroMes: number;
  motoMes: number;
  visHora: number;
  horasGratis: number;
  iva: number;
  capacidadVisitantes: number;  // 0 = sin límite
  horasMinRecortesia: number;
  updatedAt: string;
}

export const TARIFA_DEFAULTS: Omit<Tarifa, 'id' | 'updatedAt'> = {
  carroMes: 20000,
  motoMes: 10000,
  visHora: 1000,
  horasGratis: 2,
  iva: 19,
  capacidadVisitantes: 0,
  horasMinRecortesia: 6,
};
