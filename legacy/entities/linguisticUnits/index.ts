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

/**
 * Shuffles an array using Fisher-Yates algorithm.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Word service functions - implements WordServiceContract
export const wordService: WordServiceContract = {
  // Basic CRUD operations
  /**
   * Retrieves all words from the repository.
   */
  getAll: () => wordRepo.getAll(),
  /**
   * Retrieves a word by its language and content.
   */
  getById: async (language: string, content: string) => {
    const result = await wordRepo.getById(language, content);
    return result || null;
  },
  /**
   * Adds a new word to the repository.
   */
  add: (word: WordData) => wordRepo.add(word),
  /**
   * Updates an existing word in the repository.
   */
  update: (word: WordData) => wordRepo.update(word),
  /**
   * Deletes a word from the repository.
   */
  delete: (language: string, content: string) => wordRepo.delete(language, content),
  
  // Pagination
  /**
   * Retrieves words with pagination support.
   */
  getAllPaginated: async (page: number, pageSize: number) => {
    const all = await wordRepo.getAll();
    const start = page * pageSize;
    return all.slice(start, start + pageSize);
  },
  
  // Due/eligibility operations
  /**
   * Retrieves all words that are currently due for review.
   */
  getAllDue: async () => {
    const all = await wordRepo.getAll();
    const dueWords: WordData[] = [];
    
    for (const word of all) {
      const progress = await progressRepo.get({ language: word.language, content: word.content, type: 'word' });
      if (!progress) {
        // New word, always due
        dueWords.push(word);
        continue;
      }
      
      // Check if any level is due
      for (const [, card] of Object.entries(progress.cards)) {
        if (card && card.due && new Date(card.due) <= new Date()) {
          dueWords.push(word);
          break;
        }
      }
    }
    
    return dueWords;
  },
  /**
   * Checks if a word is due for review.
   */
  isDue: async (language: string, content: string) => {
    const progress = await progressRepo.get({ language, content, type: 'word' });
    if (!progress) return true; // New word is always due
    
    // Check if any level is due
    for (const card of Object.values(progress.cards)) {
      if (card && card.due && new Date(card.due) <= new Date()) {
        return true;
      }
    }
    return false;
  },
  /**
   * Checks if a word is due for review at a specific level.
   */
  isDueAtLevel: async (language: string, content: string, level: number) => {
    const progress = await progressRepo.get({ language, content, type: 'word' });
    if (!progress) return true; // New word is always due
    
    const card = progress.cards[level];
    if (!card) return true; // Level not practiced yet
    
    return card.due && new Date(card.due) <= new Date();
  },
  /**
   * Calculates the average completion rate for specified levels.
   */
  getAverageCompletionRate: async (language: string, content: string, levels: number[]) => {
    const progress = await progressRepo.get({ language, content, type: 'word' });
    if (!progress) return 0;
    
    let totalRate = 0;
    let validLevels = 0;
    
    for (const level of levels) {
      const card = progress.cards[level];
      if (card) {
        // Calculate completion rate based on card state
        // For now, use a simple heuristic: newer cards have lower completion
        const daysSinceCreation = (Date.now() - new Date(card.due || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
        const rate = Math.max(0, Math.min(1, 1 - (daysSinceCreation / 30))); // Decay over 30 days
        totalRate += rate;
        validLevels++;
      }
    }
    
    return validLevels > 0 ? totalRate / validLevels : 0;
  },
  
  // Language-specific operations
  /**
   * Retrieves all words in a specific language.
   */
  getAllInLanguage: async (languageCode: string) => {
    const all = await wordRepo.getAll();
    return all.filter(word => word.language === languageCode);
  },
  /**
   * Retrieves a random word in a specific language.
   */
  getRandomInLanguage: async (languageCode: string) => {
    const all = await wordRepo.getAll();
    const filtered = all.filter(word => word.language === languageCode);
    return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
  },
  /**
   * Retrieves a random due word in a specific language.
   */
  getRandomDueInLanguage: async (languageCode: string) => {
    const dueWords = await wordService.getAllDue();
    const filtered = dueWords.filter(word => word.language === languageCode);
    return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
  },
  
  // Translation operations
  /**
   * Retrieves translations of a word in specified languages.
   */
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
  },

  /**
   * Gets a reasonable selection of due words with weighted choice between seen and unseen.
   * 80% due words that were seen before, 20% never-seen-before words.
   */
  getReasonableDueWords: async (amount: number): Promise<WordData[]> => {
    const allWords = await wordRepo.getAll();
    const allProgress = await progressRepo.getAll();
    
    // Separate words into seen (with progress) and unseen (no progress)
    const seenWords: WordData[] = [];
    const unseenWords: WordData[] = [];
    
    for (const word of allWords) {
      const progress = allProgress.find(p => 
        p.language === word.language && 
        p.content === word.content && 
        p.type === 'word'
      );
      
      if (progress) {
        // Check if this seen word is due
        for (const [, card] of Object.entries(progress.cards)) {
          if (card && card.due && new Date(card.due) <= new Date()) {
            seenWords.push(word);
            break;
          }
        }
      } else {
        // Unseen word
        unseenWords.push(word);
      }
    }
    
    // Calculate weights based on available data
    const totalSeen = seenWords.length;
    const totalUnseen = unseenWords.length;
    
    if (totalSeen === 0 && totalUnseen === 0) {
      return [];
    }
    
    if (totalSeen === 0) {
      // Only unseen words available
      return shuffleArray(unseenWords).slice(0, amount);
    }
    
    if (totalUnseen === 0) {
      // Only seen words available
      return shuffleArray(seenWords).slice(0, amount);
    }
    
    // Both types available - use weighted selection
    const targetSeen = Math.floor(amount * 0.8);
    const targetUnseen = amount - targetSeen;
    
    const selectedSeen = shuffleArray(seenWords).slice(0, Math.min(targetSeen, totalSeen));
    const selectedUnseen = shuffleArray(unseenWords).slice(0, Math.min(targetUnseen, totalUnseen));
    
    // Combine and shuffle
    const combined = [...selectedSeen, ...selectedUnseen];
    return shuffleArray(combined);
  }
};

// Sentence service functions - implements SentenceServiceContract
export const sentenceService: SentenceServiceContract = {
  // Basic CRUD operations
  /**
   * Retrieves all sentences from the repository.
   */
  getAll: () => sentenceRepo.getAll(),
  /**
   * Retrieves a sentence by its language and content.
   */
  getById: async (language: string, content: string) => {
    const result = await sentenceRepo.getById(language, content);
    return result || null;
  },
  /**
   * Adds a new sentence to the repository.
   */
  add: (sentence: SentenceData) => sentenceRepo.add(sentence),
  /**
   * Updates an existing sentence in the repository.
   */
  update: (sentence: SentenceData) => sentenceRepo.update(sentence),
  /**
   * Deletes a sentence from the repository.
   */
  delete: (language: string, content: string) => sentenceRepo.delete(language, content),
  
  // Pagination
  /**
   * Retrieves sentences with pagination support.
   */
  getAllPaginated: async (page: number, pageSize: number) => {
    const all = await sentenceRepo.getAll();
    const start = page * pageSize;
    return all.slice(start, start + pageSize);
  },
  
  // Due/eligibility operations
  /**
   * Retrieves all sentences that are currently due for review.
   */
  getAllDue: async () => {
    const all = await sentenceRepo.getAll();
    const dueSentences: SentenceData[] = [];
    
    for (const sentence of all) {
      const progress = await progressRepo.get({ language: sentence.language, content: sentence.content, type: 'sentence' });
      if (!progress) {
        // New sentence, always due
        dueSentences.push(sentence);
        continue;
      }
      
      // Check if any level is due
      for (const [, card] of Object.entries(progress.cards)) {
        if (card && card.due && new Date(card.due) <= new Date()) {
          dueSentences.push(sentence);
          break;
        }
      }
    }
    
    return dueSentences;
  },
  /**
   * Finds the sentence with highest completion rate of associated words that hasn't been seen.
   */
  getHighestCompletionRateUnseen: async () => {
    const all = await sentenceRepo.getAll();
    let bestSentence: SentenceData | null = null;
    let bestRate = 0;
    
    for (const sentence of all) {
      const progress = await progressRepo.get({ language: sentence.language, content: sentence.content, type: 'sentence' });
      if (progress) continue; // Skip seen sentences
      
      // Calculate average completion rate of associated words
      let totalRate = 0;
      let wordCount = 0;
      
      for (const wordRef of sentence.containsWords || []) {
        const wordProgress = await progressRepo.get({ language: wordRef.language, content: wordRef.content, type: 'word' });
        if (wordProgress) {
          const rate = await wordService.getAverageCompletionRate(wordRef.language, wordRef.content, [0, 1, 2, 3, 4, 5]);
          totalRate += rate;
          wordCount++;
        }
      }
      
      const avgRate = wordCount > 0 ? totalRate / wordCount : 0;
      if (avgRate > bestRate) {
        bestRate = avgRate;
        bestSentence = sentence;
      }
    }
    
    return bestSentence;
  },
  /**
   * Calculates the average completion rate for associated words.
   */
  getAverageCompletionRate: async (language: string, content: string) => {
    const sentence = await sentenceRepo.getById(language, content);
    if (!sentence) return 0;
    
    let totalRate = 0;
    let wordCount = 0;
    
    for (const wordRef of sentence.containsWords || []) {
      const rate = await wordService.getAverageCompletionRate(wordRef.language, wordRef.content, [0, 1, 2, 3, 4, 5]);
      totalRate += rate;
      wordCount++;
    }
    
    return wordCount > 0 ? totalRate / wordCount : 0;
  },
  
  // Language-specific operations
  /**
   * Retrieves all sentences in a specific language.
   */
  getAllInLanguage: async (languageCode: string) => {
    const all = await sentenceRepo.getAll();
    return all.filter(sentence => sentence.language === languageCode);
  },
  /**
   * Retrieves a random sentence in a specific language.
   */
  getRandomInLanguage: async (languageCode: string) => {
    const all = await sentenceRepo.getAll();
    const filtered = all.filter(sentence => sentence.language === languageCode);
    return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
  },
  /**
   * Retrieves a random due sentence in a specific language.
   */
  getRandomDueInLanguage: async (languageCode: string) => {
    const dueSentences = await sentenceService.getAllDue();
    const filtered = dueSentences.filter(sentence => sentence.language === languageCode);
    return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
  },
  
  // Translation operations
  /**
   * Retrieves translations of a sentence in specified languages.
   */
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
  },

  /**
   * Gets a reasonable selection of due sentences with weighted choice between seen and unseen.
   * 80% due sentences that were seen before, 20% never-seen-before sentences.
   */
  getReasonableDueSentences: async (amount: number): Promise<SentenceData[]> => {
    const allSentences = await sentenceRepo.getAll();
    const allProgress = await progressRepo.getAll();
    
    // Separate sentences into seen (with progress) and unseen (no progress)
    const seenSentences: SentenceData[] = [];
    const unseenSentences: SentenceData[] = [];
    
    for (const sentence of allSentences) {
      const progress = allProgress.find(p => 
        p.language === sentence.language && 
        p.content === sentence.content && 
        p.type === 'sentence'
      );
      
      if (progress) {
        // Check if this seen sentence is due
        for (const [, card] of Object.entries(progress.cards)) {
          if (card && card.due && new Date(card.due) <= new Date()) {
            seenSentences.push(sentence);
            break;
          }
        }
      } else {
        // Unseen sentence
        unseenSentences.push(sentence);
      }
    }
    
    // Calculate weights based on available data
    const totalSeen = seenSentences.length;
    const totalUnseen = unseenSentences.length;
    
    if (totalSeen === 0 && totalUnseen === 0) {
      return [];
    }
    
    if (totalSeen === 0) {
      // Only unseen sentences available
      return shuffleArray(unseenSentences).slice(0, amount);
    }
    
    if (totalUnseen === 0) {
      // Only seen sentences available
      return shuffleArray(seenSentences).slice(0, amount);
    }
    
    // Both types available - use weighted selection
    const targetSeen = Math.floor(amount * 0.8);
    const targetUnseen = amount - targetSeen;
    
    const selectedSeen = shuffleArray(seenSentences).slice(0, Math.min(targetSeen, totalSeen));
    const selectedUnseen = shuffleArray(unseenSentences).slice(0, Math.min(targetUnseen, totalUnseen));
    
    // Combine and shuffle
    const combined = [...selectedSeen, ...selectedUnseen];
    return shuffleArray(combined);
  }
};

// Progress service functions - implements ProgressServiceContract
export const progressService: ProgressServiceContract = {
  // Basic operations
  /**
   * Retrieves progress data for a linguistic unit.
   */
  get: async (language: string, content: string, type: 'word' | 'sentence') => {
    const result = await progressRepo.get({ language, content, type });
    return result || null;
  },
  /**
   * Updates or inserts progress data for a linguistic unit.
   */
  upsert: (progress: LinguisticUnitProgressData) => progressRepo.upsert(progress),
  /**
   * Retrieves all progress data.
   */
  getAll: () => progressRepo.getAll(),
  /**
   * Clears all progress data.
   */
  clear: () => progressRepo.clear(),
  
  // Recent operations
  /**
   * Retrieves the most recent progress data entries.
   */
  getRecent: async (limit = 100) => {
    const all = await progressRepo.getAll();
    return all.slice(-limit);
  }
};
