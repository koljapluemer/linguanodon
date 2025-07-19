import type { LinguisticUnitData } from "@/entities/linguisticUnits";

// Represents a generated exercise for a lesson.
export interface Exercise {
  id: string;
  type: 'reveal' | 'free-translate' | 'choose-from-two';
  prompt: string;
  solution: string;
  level: number;
  linguisticUnit: LinguisticUnitData;
  isRepeatable: boolean;
  // For free-translate, optionally store the user's input for review
  userInput?: string;
  // Additional data for specific exercise types
  data?: Record<string, unknown>;
} 