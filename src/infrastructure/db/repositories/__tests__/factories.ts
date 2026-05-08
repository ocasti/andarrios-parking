import type { Resident, Visitor, MonthlyFee, PricingConfig, ActivityLog, DailyClose, MonthlyPayment } from '../../../../domain/entities';

let counter = 0;
const next = () => String(++counter);

export const makeResident = (overrides: Partial<Resident> = {}): Resident => ({
  id: `res-${next()}`,
  aptCode: 'T01-101',
  tower: 1,
  floor: 1,
  unit: 1,
  plate: `ABC${next()}`,
  vehicleType: 'car',
  name: 'Resident Test',
  phone: null,
  registrationDate: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  ...overrides,
});

export const makeVisitor = (overrides: Partial<Visitor> = {}): Visitor => ({
  id: `vis-${next()}`,
  aptCode: 'T01-101',
  plate: `XYZ${next()}`,
  vehicleType: 'car',
  name: 'Visitor Test',
  phone: null,
  checkIn: '2024-06-01T10:00:00.000Z',
  checkOut: null,
  hours: null,
  baseAmount: null,
  tax: null,
  total: null,
  courtesyApplies: false,
  createdAt: '2024-06-01T10:00:00.000Z',
  updatedAt: '2024-06-01T10:00:00.000Z',
  ...overrides,
});

export const makeMonthlyFee = (overrides: Partial<MonthlyFee> = {}): MonthlyFee => ({
  id: `mens-${next()}`,
  residentId: `res-${next()}`,
  monthKey: '2024-06',
  status: 'pending',
  paymentDate: null,
  amount: null,
  createdAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
  ...overrides,
});

export const makePricingConfig = (overrides: Partial<PricingConfig> = {}): PricingConfig => ({
  id: 1,
  carMonthlyRate: 20000,
  motorcycleMonthlyRate: 10000,
  hourlyRate: 1000,
  freeHours: 2,
  iva: 19,
  visitorCapacity: 0,
  minHoursForCourtesy: 6,
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const makeActivityLog = (overrides: Partial<ActivityLog> = {}): ActivityLog => ({
  id: `act-${next()}`,
  msg: 'Activity test',
  ts: new Date().toISOString(),
  category: 'visitor',
  ...overrides,
});

export const makeDailyClose = (overrides: Partial<DailyClose> = {}): DailyClose => ({
  id: `cierre-${next()}`,
  closedAt: '2024-06-01T23:59:00.000Z',
  dateStr: '2024-06-01',
  visitorCharges: 3,
  visitorTotal: 9000,
  monthlyCharges: 10,
  monthlyTotal: 200000,
  totalTax: 1710,
  total: 210710,
  ...overrides,
});

export const makeMonthlyPayment = (overrides: Partial<MonthlyPayment> = {}): MonthlyPayment => ({
  id: `pago-${next()}`,
  residentId: `res-${next()}`,
  plate: `DEF${next()}`,
  aptCode: 'T01-101',
  name: 'Resident Test',
  vehicleType: 'car',
  date: '2024-06-15T10:00:00.000Z',
  amount: 20000,
  monthKey: '2024-06',
  ...overrides,
});
