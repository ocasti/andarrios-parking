export interface DailyClose {
  id: string;
  closedAt: string;
  dateStr: string;        // YYYY-MM-DD
  visitorCharges: number;
  visitorTotal: number;
  monthlyCharges: number;
  monthlyTotal: number;
  totalTax: number;
  total: number;
}
