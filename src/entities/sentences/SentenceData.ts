import type { LinguisticUnitData } from "@/shared/linguisticUnits/LinguisticUnitData";

// Represents a sentence in a specific language, with translations, credits, and contained words for MVP.
export interface SentenceData extends LinguisticUnitData {
  notes?: string[];
  translations?: Array<{
    language: string;
    content: string;
  }>;
  links?: Array<{
    label: string;
    url: string;
  }>;
  credits?: Array<{
    license: string;
    owner: string;
    ownerLink?: string;
    source?: string;
    sourceLink?: string;
  }>;
  containsWords?: Array<{
    language: string;
    content: string;
  }>;
} 