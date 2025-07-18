import type { LinguisticUnitData } from "@/shared/linguisticUnits/LinguisticUnitData";

// Represents a word in a specific language, with translations and notes for MVP.
export interface WordData extends LinguisticUnitData {
  notes?: Array<{
    content: string;
    showBeforeExercise?: boolean;
  }>;
  translations?: Array<{
    language: string;
    content: string;
  }>;
  links?: Array<{
    label: string;
    url: string;
  }>;
  otherForms?: string[];
  synonyms?: string[];
  appearsIn?: Array<{
    language: string;
    content: string;
  }>;
} 