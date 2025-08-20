import type { VocabData } from './vocab/VocabData';
import type { TranslationData } from './translations/TranslationData';
import type { Rating } from 'ts-fsrs';

export interface VocabPaginationResult {
  vocab: VocabData[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface VocabAndTranslationRepoContract {
  // Vocab operations
  getVocab(): Promise<VocabData[]>;
  getVocabByUID(uid: string): Promise<VocabData | undefined>;
  getVocabByUIDs(uids: string[]): Promise<VocabData[]>;
  getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined>;
  getRandomAlreadySeenDueVocab(count: number): Promise<VocabData[]>;
  getRandomUnseenVocab(count: number): Promise<VocabData[]>;
  getDueOrUnseenVocabFromIds(uids: string[]): Promise<VocabData[]>;
  
  // Pagination operations
  getVocabPaginated(cursor?: string, limit?: number, searchQuery?: string): Promise<VocabPaginationResult>;
  getTotalVocabCount(searchQuery?: string): Promise<number>;
  
  // CRUD operations
  saveVocab(vocab: Omit<VocabData, 'uid' | 'progress' | 'tasks'>): Promise<VocabData>;
  updateVocab(vocab: VocabData): Promise<void>;
  deleteVocab(id: string): Promise<void>;
  
  // Progress operations
  scoreVocab(vocabId: string, rating: Rating): Promise<void>;
  updateLastReview(vocabId: string): Promise<void>;
  
  // Pronunciation operations
  addPronunciationToVocab(uid: string, pronunciation: string): Promise<void>;
  hasPronunciation(uid: string): Promise<boolean>;
  getRandomVocabWithMissingPronunciation(): Promise<VocabData | null>;
  
  // Related vocab operations
  addRelatedVocab(uid: string, relatedVocabUid: string): Promise<void>;
  removeRelatedVocab(uid: string, relatedVocabUid: string): Promise<void>;
  addNotRelatedVocab(uid: string, notRelatedVocabUid: string): Promise<void>;
  removeNotRelatedVocab(uid: string, notRelatedVocabUid: string): Promise<void>;
  
  // Translation operations
  getTranslationsByIds(ids: string[]): Promise<TranslationData[]>;
  getTranslationByContent(content: string): Promise<TranslationData | undefined>;
  saveTranslation(translation: Omit<TranslationData, 'uid'>): Promise<TranslationData>;
  updateTranslation(translation: TranslationData): Promise<void>;
  deleteTranslations(ids: string[]): Promise<void>;
  
  // Distractor generation operations
  getDueVocabInLanguage(language: string): Promise<VocabData[]>;
  getDueVocabInLanguages(languages: string[], setsToAvoid?: string[]): Promise<VocabData[]>;
  getRandomUnseenVocabInLanguages(languages: string[], count: number, setsToAvoid?: string[]): Promise<VocabData[]>;
  getAllTranslationsInLanguage(language: string): Promise<TranslationData[]>;
  findVocabByTranslationContent(translationContent: string): Promise<VocabData[]>;
}