// Represents a minimal identifier for a linguistic unit (word or sentence).

import type { LinguisticUnitIdentification } from "@/shared/LinguisticUnitIdentification";

// This is the base for both Word and Sentence entities, allowing unified progress tracking and exercise generation.
export interface LinguisticUnitData extends LinguisticUnitIdentification {

  notes?: Array<{
    content: string;
    showBeforeExercise?: boolean;
  }>;
  translations?: LinguisticUnitIdentification[];
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