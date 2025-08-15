import type { FactCardData } from './FactCardData';
import type { Rating } from 'ts-fsrs';

export interface FactCardRepoContract {
  // Basic CRUD operations
  getAllFactCards(): Promise<FactCardData[]>;
  getFactCardByUID(uid: string): Promise<FactCardData | undefined>;
  saveFactCard(factCard: Omit<FactCardData, 'uid' | 'progress'>): Promise<FactCardData>;
  updateFactCard(factCard: FactCardData): Promise<void>;
  deleteFactCard(uid: string): Promise<void>;

  // Progress operations
  scoreFactCard(factCardId: string, rating: Rating): Promise<void>;
  updateLastReview(factCardId: string): Promise<void>;
}