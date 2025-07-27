// Export main repository
export { VocabAndTranslationRepo } from './VocabAndTranslationRepo';
export type { VocabAndTranslationRepoContract, VocabPaginationResult } from './VocabAndTranslationRepoContract';

// Export data types
export type { VocabData } from './vocab/VocabData';
export type { TranslationData } from './translations/TranslationData';

// Export entity functions
export { calculateVocabMastery } from './vocabMastery';