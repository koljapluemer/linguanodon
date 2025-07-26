import type { LinguisticUnitData } from "@/entities/linguisticUnits";

// Represents a learning event (user rating an exercise), persisted for progress tracking.
export interface LearningEventData {
  userEaseRating: "Impossible" | "Hard" | "Doable" | "Easy";
  timestamp: Date;
  exerciseType: string;
  taskType: string;
  level: number;
  linguisticUnit: LinguisticUnitData;
  userInput?: string;
} 