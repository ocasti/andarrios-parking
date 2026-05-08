import type { Visitor } from '../entities';

export interface IVisitorRepository {
  create(visitor: Visitor): Promise<Visitor>;
  findById(id: string): Promise<Visitor | undefined>;
  listActive(): Promise<Visitor[]>;   // visitors without checkout
  recordCheckOut(id: string, updates: Partial<Visitor>): Promise<void>;
  countActive(): Promise<number>;
  activePlateExists(plate: string): Promise<boolean>;
  findLastCheckOutByPlate(plate: string, since: string): Promise<Visitor | undefined>;
}
