import type { FactCardData } from './FactCardData';
import type { Rating } from 'ts-fsrs';

export interface FactCardListFilters {
  searchQuery?: string;
  languages?: string[];
  origins?: string[];
}

export interface FactCardRepoContract {
  // Basic CRUD operations
  getAllFactCards(): Promise<FactCardData[]>;
  getFactCardByUID(uid: string): Promise<FactCardData | undefined>;
  getFactCardsByUIDs(uids: string[]): Promise<FactCardData[]>;
  saveFactCard(factCard: Omit<FactCardData, 'uid' | 'progress'>): Promise<FactCardData>;
  updateFactCard(factCard: FactCardData): Promise<void>;
  deleteFactCard(uid: string): Promise<void>;

  // Progress operations
  scoreFactCard(factCardId: string, rating: Rating, immediateDue?: boolean): Promise<void>;
  updateLastReview(factCardId: string): Promise<void>;

  // Task generation operations
  getRandomUnseenFactCards(count: number, languages: string[], factCardBlockList?: string[]): Promise<FactCardData[]>;
  getRandomAlreadySeenDueFactCards(count: number, languages: string[], factCardBlockList?: string[]): Promise<FactCardData[]>;

  // List and pagination operations
  getFactCardsPaginated(offset: number, limit: number, filters?: FactCardListFilters): Promise<FactCardData[]>;
  getTotalFactCardsCount(filters?: FactCardListFilters): Promise<number>;
}