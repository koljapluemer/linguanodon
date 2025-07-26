import type { VocabData } from './vocab/VocabData';
import type { TranslationData } from './translations/TranslationData';

export interface VocabAndTranslationRepoContract {
  // Vocab operations
  getVocab(): Promise<VocabData[]>;
  getVocabByUID(uid: string): Promise<VocabData | undefined>;
  getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined>;
  getRandomDueVocab(count: number): Promise<VocabData[]>;
  
  // Progress operations
  calculateMasteryLevelForVocab(id: string): Promise<number>;
  scoreVocab(vocabId: string, rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): Promise<void>;
  
  // Pronunciation operations
  addPronunciationToVocab(uid: string, pronunciation: string): Promise<void>;
  hasPronunciation(uid: string): Promise<boolean>;
  getRandomVocabWithMissingPronunciation(): Promise<VocabData | null>;
  
  // Translation operations
  getTranslationsByIds(ids: string[]): Promise<TranslationData[]>;
}