/*

## Contracts for Export

### for LinguisticUnitProgressData

- upsert 
- getting all
- getting all by type+lang+content
- getting recent (hardcoded to 100)

### for WordData

- edit
- add new
- get by lang+content
- delete
- getting all
- getting all paginated

- get all due
- get whether given Word is due (by lang+content)
- get whether given Word is due at a specific level (by lang+content, and passing in level number)
- get avg rate of completion for levels (given level either has no card associated or card is currently not due) (by lang+content, and array of level numbers)

- get all in language (langcode)
- get random in language
- get random due in language

- get all translations for word in given languages (by lang+content, and array of lang_codes)

### for SentenceData

- edit
- add new
- get by lang+content
- delete
- getting all
- getting all paginated

- get all due
- get the one where the avg completion  of associated Words in the levels 0-5 is highest and no learning data is associated
- get avg % of completion of associated Words in the levels 0-5

- get all in language (lang code)
- get random in language
- get random due in language

- get all translations for word in given languages (by lang+content, and array of lang_codes)

*/


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
import type { WordServiceContract, SentenceServiceContract, ProgressServiceContract } from "./contracts";

// Initialize repositories (singleton pattern)
const wordRepo = new WordDexieRepository();
const sentenceRepo = new SentenceDexieRepository();
const progressRepo = new LinguisticUnitProgressDexieRepository();

// Word service functions - implements WordServiceContract
export const wordService: WordServiceContract = {
  // Basic CRUD operations
  getAll: () => wordRepo.getAll(),
  getById: async (language: string, content: string) => {
    const result = await wordRepo.getById(language, content);
    return result || null;
  },
  add: (word: WordData) => wordRepo.add(word),
  update: (word: WordData) => wordRepo.update(word),
  delete: (language: string, content: string) => wordRepo.delete(language, content),
  
  // Pagination - TODO: implement in repository
  getAllPaginated: async (page: number, pageSize: number) => {
    const all = await wordRepo.getAll();
    const start = page * pageSize;
    return all.slice(start, start + pageSize);
  },
  
  // Due/eligibility operations - TODO: implement in repository
  getAllDue: async () => {
    // For now, return all words. This should be implemented with FSRS logic
    return wordRepo.getAll();
  },
  isDue: async (language: string, content: string) => {
    // TODO: implement FSRS due check
    return true;
  },
  isDueAtLevel: async (language: string, content: string, level: number) => {
    // TODO: implement FSRS due check for specific level
    return true;
  },
  getAverageCompletionRate: async (language: string, content: string, levels: number[]) => {
    // TODO: implement completion rate calculation
    return 0.5;
  },
  
  // Language-specific operations - TODO: implement in repository
  getAllInLanguage: async (languageCode: string) => {
    const all = await wordRepo.getAll();
    return all.filter(word => word.language === languageCode);
  },
  getRandomInLanguage: async (languageCode: string) => {
    const all = await wordRepo.getAll();
    const filtered = all.filter(word => word.language === languageCode);
    return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
  },
  getRandomDueInLanguage: async (languageCode: string) => {
    // For now, same as getRandomInLanguage
    return wordService.getRandomInLanguage(languageCode);
  },
  
  // Translation operations - TODO: implement in repository
  getTranslationsInLanguages: async (language: string, content: string, languageCodes: string[]) => {
    const word = await wordRepo.getById(language, content);
    if (!word || !word.translations) return [];
    // Convert translation objects to WordData format
    return word.translations
      .filter(t => languageCodes.includes(t.language))
      .map(t => ({
        type: 'word' as const,
        language: t.language,
        content: t.content,
        translations: [],
        notes: [],
        links: [],
        otherForms: [],
        synonyms: [],
        appearsIn: []
      }));
  }
};

// Sentence service functions - implements SentenceServiceContract
export const sentenceService: SentenceServiceContract = {
  // Basic CRUD operations
  getAll: () => sentenceRepo.getAll(),
  getById: async (language: string, content: string) => {
    const result = await sentenceRepo.getById(language, content);
    return result || null;
  },
  add: (sentence: SentenceData) => sentenceRepo.add(sentence),
  update: (sentence: SentenceData) => sentenceRepo.update(sentence),
  delete: (language: string, content: string) => sentenceRepo.delete(language, content),
  
  // Pagination - TODO: implement in repository
  getAllPaginated: async (page: number, pageSize: number) => {
    const all = await sentenceRepo.getAll();
    const start = page * pageSize;
    return all.slice(start, start + pageSize);
  },
  
  // Due/eligibility operations - TODO: implement in repository
  getAllDue: async () => {
    // For now, return all sentences. This should be implemented with FSRS logic
    return sentenceRepo.getAll();
  },
  getHighestCompletionRateUnseen: async () => {
    // TODO: implement logic to find sentence with highest completion rate of associated words
    const all = await sentenceRepo.getAll();
    return all.length > 0 ? all[0] : null;
  },
  getAverageCompletionRate: async (language: string, content: string) => {
    // TODO: implement completion rate calculation for associated words
    return 0.5;
  },
  
  // Language-specific operations - TODO: implement in repository
  getAllInLanguage: async (languageCode: string) => {
    const all = await sentenceRepo.getAll();
    return all.filter(sentence => sentence.language === languageCode);
  },
  getRandomInLanguage: async (languageCode: string) => {
    const all = await sentenceRepo.getAll();
    const filtered = all.filter(sentence => sentence.language === languageCode);
    return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
  },
  getRandomDueInLanguage: async (languageCode: string) => {
    // For now, same as getRandomInLanguage
    return sentenceService.getRandomInLanguage(languageCode);
  },
  
  // Translation operations - TODO: implement in repository
  getTranslationsInLanguages: async (language: string, content: string, languageCodes: string[]) => {
    const sentence = await sentenceRepo.getById(language, content);
    if (!sentence || !sentence.translations) return [];
    // Convert translation objects to SentenceData format
    return sentence.translations
      .filter(t => languageCodes.includes(t.language))
      .map(t => ({
        type: 'sentence' as const,
        language: t.language,
        content: t.content,
        translations: [],
        notes: [],
        links: [],
        credits: [],
        containsWords: []
      }));
  }
};

// Progress service functions - implements ProgressServiceContract
export const progressService: ProgressServiceContract = {
  // Basic operations
  get: async (language: string, content: string, type: 'word' | 'sentence') => {
    const result = await progressRepo.get(language, content, type);
    return result || null;
  },
  upsert: (progress: LinguisticUnitProgressData) => progressRepo.upsert(progress),
  getAll: () => progressRepo.getAll(),
  clear: () => progressRepo.clear(),
  
  // Recent operations - TODO: implement in repository
  getRecent: async (limit = 100) => {
    const all = await progressRepo.getAll();
    return all.slice(-limit);
  }
};
