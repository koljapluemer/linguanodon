import type { VocabData } from './vocab/VocabData';
import type { TranslationData } from './translations/TranslationData';

export interface VocabPaginationResult {
  vocab: VocabData[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface VocabAndTranslationRepoContract {
  // Vocab operations
  getVocab(): Promise<VocabData[]>;
  getVocabByUID(uid: string): Promise<VocabData | undefined>;
  getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined>;
  getRandomAlreadySeenDueVocab(count: number): Promise<VocabData[]>;
  getRandomUnseenVocab(count: number): Promise<VocabData[]>;
  
  // Pagination operations
  getVocabPaginated(cursor?: string, limit?: number, searchQuery?: string): Promise<VocabPaginationResult>;
  getTotalVocabCount(searchQuery?: string): Promise<number>;
  
  // CRUD operations
  saveVocab(vocab: Partial<VocabData>): Promise<VocabData>;
  updateVocab(vocab: VocabData): Promise<void>;
  deleteVocab(id: string): Promise<void>;
  
  // Progress operations
  scoreVocab(vocabId: string, rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): Promise<void>;
  
  // Pronunciation operations
  addPronunciationToVocab(uid: string, pronunciation: string): Promise<void>;
  hasPronunciation(uid: string): Promise<boolean>;
  getRandomVocabWithMissingPronunciation(): Promise<VocabData | null>;
  
  // Translation operations
  getTranslationsByIds(ids: string[]): Promise<TranslationData[]>;
  getTranslationByContent(content: string): Promise<TranslationData | undefined>;
  saveTranslation(translation: Partial<TranslationData>): Promise<TranslationData>;
  updateTranslation(translation: TranslationData): Promise<void>;
  deleteTranslations(ids: string[]): Promise<void>;
  
  // Distractor generation operations
  getDueVocabInLanguage(language: string): Promise<VocabData[]>;
  getAllTranslationsInLanguage(language: string): Promise<TranslationData[]>;
  findVocabByTranslationContent(translationContent: string): Promise<VocabData[]>;
}