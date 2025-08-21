import type { TranslationData } from './TranslationData';

export interface TranslationRepoContract {
  // Basic CRUD operations
  getTranslationsByIds(ids: string[]): Promise<TranslationData[]>;
  getTranslationByContent(content: string): Promise<TranslationData | undefined>;
  saveTranslation(translation: Omit<TranslationData, 'uid' | 'origins'>): Promise<TranslationData>;
  updateTranslation(translation: TranslationData): Promise<void>;
  deleteTranslations(ids: string[]): Promise<void>;
  
  // Query operations
  getAllTranslationsInLanguage(language: string): Promise<TranslationData[]>;
  findTranslationsByContent(content: string): Promise<TranslationData[]>;
}