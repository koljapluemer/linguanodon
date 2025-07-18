// Represents a learning event (user rating an exercise), persisted for progress tracking.
export interface LearningEventData {
  userEaseRating: "Impossible" | "Hard" | "Doable" | "Easy";
  timestamp: Date;
  exerciseType: string;
  taskType: string;
  level: number;
  linguisticUnit: {
    language: string;
    content: string;
  };
  userInput?: string;
} 