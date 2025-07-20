import type { Language } from "./Language";

// Repository interface for accessing and managing Language entities.
export interface LanguageRepository {
  getAll(): Promise<Language[]>;
  getByCode(code: string): Promise<Language | undefined>;
  add(language: Language): Promise<void>;
  update(language: Language): Promise<void>;
  delete(code: string): Promise<void>;
  
  // User language management
  getUserTargetLanguages(): Promise<Language[]>;
  getUserNativeLanguages(): Promise<Language[]>;
} 