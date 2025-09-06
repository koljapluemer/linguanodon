import type { TranslationData } from './TranslationData';

export interface TranslationRepoContract {
  // Basic CRUD operations
  getTranslationsByIds(ids: string[]): Promise<TranslationData[]>;
  getAllTranslations(): Promise<TranslationData[]>;
  getTranslationByContent(content: string): Promise<TranslationData | undefined>;
  saveTranslation(translation: Omit<TranslationData, 'uid' | 'origins'>): Promise<TranslationData>;
  updateTranslation(translation: TranslationData): Promise<void>;
  deleteTranslations(ids: string[]): Promise<void>;
  
  // Query operations
  searchTranslationsByContent(content: string): Promise<TranslationData[]>;
  
  // Distractor generation operations
  generateWrongTranslations(correctTranslationContent: string, count: number): Promise<string[]>;
}