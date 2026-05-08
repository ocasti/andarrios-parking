export interface BlockedUnit {
  id: string;
  aptCode: string;
  reason: string;
  blockedAt: string;
  unblockedAt: string | null;
}
