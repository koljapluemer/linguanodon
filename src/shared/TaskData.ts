export interface TaskData {
  taskType: string;
  title: string;
  prompt: string;
  evaluateAfterDoing: boolean;
  extraInfo?: string;
  lastShownAt?: Date;
  wantToDoAgain?: boolean;
  nextShownEarliestAt?: Date;
  lastDifficultyRating?: number;
  lastCorrectnessRating?: number;
} 