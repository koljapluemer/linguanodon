import type { WordData, SentenceData, LinguisticUnitProgressData } from "./index";

/**
 * Contract for Word service functions.
 * This interface defines the stable API that wordService must implement.
 */
export interface WordServiceContract {
  // Basic CRUD operations
  getAll(): Promise<WordData[]>;
  getById(language: string, content: string): Promise<WordData | null>;
  add(word: WordData): Promise<void>;
  update(word: WordData): Promise<void>;
  delete(language: string, content: string): Promise<void>;
  
  // Pagination
  getAllPaginated(page: number, pageSize: number): Promise<WordData[]>;
  
  // Due/eligibility operations
  getAllDue(): Promise<WordData[]>;
  isDue(language: string, content: string): Promise<boolean>;
  isDueAtLevel(language: string, content: string, level: number): Promise<boolean>;
  getAverageCompletionRate(language: string, content: string, levels: number[]): Promise<number>;
  
  // Language-specific operations
  getAllInLanguage(languageCode: string): Promise<WordData[]>;
  getRandomInLanguage(languageCode: string): Promise<WordData | null>;
  getRandomDueInLanguage(languageCode: string): Promise<WordData | null>;
  
  // Translation operations
  getTranslationsInLanguages(language: string, content: string, languageCodes: string[]): Promise<WordData[]>;

  getReasonableDueWords(amount: number): Promise<WordData[]>;
}

/**
 * Contract for Sentence service functions.
 * This interface defines the stable API that sentenceService must implement.
 */
export interface SentenceServiceContract {
  // Basic CRUD operations
  getAll(): Promise<SentenceData[]>;
  getById(language: string, content: string): Promise<SentenceData | null>;
  add(sentence: SentenceData): Promise<void>;
  update(sentence: SentenceData): Promise<void>;
  delete(language: string, content: string): Promise<void>;
  
  // Pagination
  getAllPaginated(page: number, pageSize: number): Promise<SentenceData[]>;
  
  // Due/eligibility operations
  getAllDue(): Promise<SentenceData[]>;
  getHighestCompletionRateUnseen(): Promise<SentenceData | null>;
  getAverageCompletionRate(language: string, content: string): Promise<number>;
  
  // Language-specific operations
  getAllInLanguage(languageCode: string): Promise<SentenceData[]>;
  getRandomInLanguage(languageCode: string): Promise<SentenceData | null>;
  getRandomDueInLanguage(languageCode: string): Promise<SentenceData | null>;
  
  // Translation operations
  getTranslationsInLanguages(language: string, content: string, languageCodes: string[]): Promise<SentenceData[]>;
  getReasonableDueSentences(amount: number): Promise<SentenceData[]>;
}

/**
 * Contract for Progress service functions.
 * This interface defines the stable API that progressService must implement.
 */
export interface ProgressServiceContract {
  // Basic operations
  get(language: string, content: string, type: 'word' | 'sentence'): Promise<LinguisticUnitProgressData | null>;
  upsert(progress: LinguisticUnitProgressData): Promise<void>;
  getAll(): Promise<LinguisticUnitProgressData[]>;
  clear(): Promise<void>;
  
  // Recent operations
  getRecent(limit?: number): Promise<LinguisticUnitProgressData[]>;
}

 