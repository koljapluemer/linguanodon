import type { LinguisticUnitData } from "@/entities/linguisticUnits";

// Represents a generated exercise for a lesson. For MVP, only reveal and free-translate types are supported.
export interface Exercise {
  id: string;
  type: 'reveal' | 'free-translate';
  prompt: string;
  solution: string;
  level: number;
  linguisticUnit: LinguisticUnitData;
  isRepeatable: boolean;
  // For free-translate, optionally store the user's input for review
  userInput?: string;
} 