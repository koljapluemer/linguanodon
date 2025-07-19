// Linguistic Unit Data Types
export type { LinguisticUnitData } from "./LinguisticUnitData";

// Word-related exports
export type { WordData } from "./words/WordData";
export type { WordRepository } from "./words/WordRepository";
export { WordDexieRepository } from "./words/WordDexieRepository";
export { useDueWords } from "./words/useDueWords";

// Sentence-related exports
export type { SentenceData } from "./sentences/SentenceData";
export type { SentenceRepository } from "./sentences/SentenceRepository";
export { SentenceDexieRepository } from "./sentences/SentenceDexieRepository";
export { useEligibleSentences } from "./sentences/useEligibleSentences";

// Progress-related exports
export type { LinguisticUnitProgressData } from "./progress/LinguisticUnitProgressData";
export type { LinguisticUnitProgressRepository } from "./progress/LinguisticUnitProgressRepository";
export { LinguisticUnitProgressDexieRepository } from "./progress/LinguisticUnitProgressDexieRepository";
