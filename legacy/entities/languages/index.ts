// Import types and implementations
import type { Language } from "./Language";
import { LanguageDexieRepository } from "./LanguageDexieRepository";

// Export types
export type { Language } from "./Language";

// Initialize repository (singleton pattern)
const languageRepo = new LanguageDexieRepository();

// Language service functions
export const languageService = {
  /** Get all languages from the database */
  getAll: () => languageRepo.getAll(),
  /** Get a language by code */
  getByCode: (code: string) => languageRepo.getByCode(code),
  /** Add a new language to the database */
  add: (language: Language) => languageRepo.add(language),
  /** Update an existing language in the database */
  update: (language: Language) => languageRepo.update(language),
  /** Delete a language from the database by code */
  delete: (code: string) => languageRepo.delete(code),
  /** Get user's target languages */
  getUserTargetLanguages: () => languageRepo.getUserTargetLanguages(),
  /** Get user's native languages */
  getUserNativeLanguages: () => languageRepo.getUserNativeLanguages()
}; 