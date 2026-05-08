export type FeeStatus = 'pending' | 'paid';

export interface MonthlyFee {
  id: string;
  residentId: string;
  monthKey: string;
  status: FeeStatus;
  paymentDate: string | null;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
}
