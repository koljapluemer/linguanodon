// Import types for internal use
import type { WordData } from "./words/WordData";
import type { SentenceData } from "./sentences/SentenceData";
import type { LinguisticUnitProgressData } from "./progress/LinguisticUnitProgressData";

// Linguistic Unit Data Types
export type { LinguisticUnitData } from "./LinguisticUnitData";

// Word-related exports
export type { WordData } from "./words/WordData";
export { useDueWords } from "./words/useDueWords";

// Sentence-related exports
export type { SentenceData } from "./sentences/SentenceData";
export { useEligibleSentences } from "./sentences/useEligibleSentences";

// Progress-related exports
export type { LinguisticUnitProgressData } from "./progress/LinguisticUnitProgressData";

// Service functions - these encapsulate repository operations
import { WordDexieRepository } from "./words/WordDexieRepository";
import { SentenceDexieRepository } from "./sentences/SentenceDexieRepository";
import { LinguisticUnitProgressDexieRepository } from "./progress/LinguisticUnitProgressDexieRepository";

// Initialize repositories (singleton pattern)
const wordRepo = new WordDexieRepository();
const sentenceRepo = new SentenceDexieRepository();
const progressRepo = new LinguisticUnitProgressDexieRepository();

// Word service functions
export const wordService = {
  /** Get all words from the database */
  getAll: () => wordRepo.getAll(),
  /** Get a word by language and content */
  getById: (language: string, content: string) => wordRepo.getById(language, content),
  /** Add a new word to the database */
  add: (word: WordData) => wordRepo.add(word),
  /** Update an existing word in the database */
  update: (word: WordData) => wordRepo.update(word),
  /** Delete a word from the database by language and content */
  delete: (language: string, content: string) => wordRepo.delete(language, content)
};

// Sentence service functions
export const sentenceService = {
  /** Get all sentences from the database */
  getAll: () => sentenceRepo.getAll(),
  /** Get a sentence by language and content */
  getById: (language: string, content: string) => sentenceRepo.getById(language, content),
  /** Add a new sentence to the database */
  add: (sentence: SentenceData) => sentenceRepo.add(sentence),
  /** Update an existing sentence in the database */
  update: (sentence: SentenceData) => sentenceRepo.update(sentence),
  /** Delete a sentence from the database by language and content */
  delete: (language: string, content: string) => sentenceRepo.delete(language, content)
};

// Progress service functions
export const progressService = {
  /** Get progress data for a linguistic unit */
  get: (language: string, content: string, type: 'word' | 'sentence') => 
    progressRepo.get(language, content, type),
  /** Upsert progress data for a linguistic unit */
  upsert: (progress: LinguisticUnitProgressData) => progressRepo.upsert(progress),
  /** Get all progress data */
  getAll: () => progressRepo.getAll(),
  /** Clear all progress data */
  clear: () => progressRepo.clear()
};
