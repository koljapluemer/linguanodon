import type { LinguisticUnitData } from "@/shared/linguisticUnits/LinguisticUnitData";

// Represents a sentence in a specific language, with translations, credits, and contained words for MVP.
export interface SentenceData extends LinguisticUnitData {
  type: 'sentence';
  containsWords?: Array<{
    type: 'word';
    language: string;
    content: string;
  }>;
} 