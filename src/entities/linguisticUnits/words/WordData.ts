import type { LinguisticUnitData } from "@/entities/linguisticUnits/LinguisticUnitData";

// Represents a word in a specific language, with translations and notes for MVP.
export interface WordData extends LinguisticUnitData {
  type: "word";
  otherForms?: Array<{
    type: "word";
    language: string;
    content: string;
  }>;
  synonyms?: Array<{
    type: "word";
    language: string;
    content: string;
  }>;
  appearsIn?: Array<{
    type: "sentence";
    language: string;
    content: string;
  }>;
}
