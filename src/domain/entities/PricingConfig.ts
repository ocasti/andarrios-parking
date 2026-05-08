export interface PricingConfig {
  id: number;
  carMonthlyRate: number;
  motorcycleMonthlyRate: number;
  hourlyRate: number;
  freeHours: number;
  iva: number;
  visitorCapacity: number;  // 0 = sin límite
  minHoursForCourtesy: number;
  updatedAt: string;
}

export const PRICING_DEFAULTS: Omit<PricingConfig, 'id' | 'updatedAt'> = {
  carMonthlyRate: 20000,
  motorcycleMonthlyRate: 10000,
  hourlyRate: 1000,
  freeHours: 2,
  iva: 19,
  visitorCapacity: 0,
  minHoursForCourtesy: 6,
};
