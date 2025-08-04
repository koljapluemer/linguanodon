import type { LanguageData } from './LanguageData';

export interface LanguageRepoContract {
  // Get operations
  getAll(): Promise<LanguageData[]>;
  getActiveTargetLanguages(): Promise<LanguageData[]>;
  getByCode(code: string): Promise<LanguageData | undefined>;
  
  // CRUD operations
  add(language: LanguageData): Promise<void>;
  update(language: LanguageData): Promise<void>;
  delete(code: string): Promise<void>;
  
  // Status operations
  setActive(code: string, isActive: boolean): Promise<void>;
  
  // Validation
  isValidLanguageCode(code: string): Promise<boolean>;
  
  // Count
  getCount(): Promise<number>;
}