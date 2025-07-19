// Represents a minimal identifier for a linguistic unit (word or sentence).
// This is the base for both Word and Sentence entities, allowing unified progress tracking and exercise generation.
export interface LinguisticUnitData {
  language: string; // ISO code, e.g. 'eng', 'apc'
  content: string;  // The text of the word or sentence
  type: 'word' | 'sentence';
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
  credits?: Array<{
    license: string;
    owner: string;
    ownerLink?: string;
    source?: string;
    sourceLink?: string;
  }>;
} 