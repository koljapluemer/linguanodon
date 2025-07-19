import type { LinguisticUnitData } from "@/shared/linguisticUnits/LinguisticUnitData";

// Represents a generated exercise for a lesson. For MVP, only reveal and free-translate types are supported.
export interface ExerciseData {
  id: string;
  type: 'reveal' | 'free-translate';
  prompt: string;
  solution: string;
  level: number;
  linguisticUnit: LinguisticUnitData;
  // For free-translate, optionally store the user's input for review
  userInput?: string;
} 