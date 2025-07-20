import type { LinguisticUnitIdentification } from "@/shared/LinguisticUnitIdentification";

/**
 * Represents a single row in the resource extraction form.
 * Each row can be either a word or sentence with optional translation.
 */
export interface ResourceExtractionFormRow {
  id: string;
  type: 'word' | 'sentence';
  originalLanguage: string;
  originalContent: string;
  translationLanguage: string;
  translationContent: string;
  isNew: boolean; // Whether this is a new row or existing data
  originalUnit?: LinguisticUnitIdentification; // Reference to existing unit if editing
} 