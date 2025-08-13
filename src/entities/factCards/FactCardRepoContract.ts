import type { FactCardData } from './FactCardData';

export interface FactCardRepoContract {
  // Basic CRUD operations
  getAllFactCards(): Promise<FactCardData[]>;
  getFactCardByUID(uid: string): Promise<FactCardData | undefined>;
  saveFactCard(factCard: Omit<FactCardData, 'uid' | 'progress'>): Promise<FactCardData>;
  updateFactCard(factCard: FactCardData): Promise<void>;
  deleteFactCard(uid: string): Promise<void>;
}