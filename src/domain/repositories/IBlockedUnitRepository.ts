import type { BlockedUnit } from '../entities/BlockedUnit';

export interface IBlockedUnitRepository {
  create(data: BlockedUnit): Promise<BlockedUnit>;
  findActive(aptCode: string): Promise<BlockedUnit | undefined>;
  unblock(aptCode: string, unblockedAt: string): Promise<void>;
  listActive(): Promise<BlockedUnit[]>;
}
