export interface TaskData {
  taskType: string;
  title: string;
  prompt: string;
  extraInfo?: string;
  lastShownAt?: Date;
  wantToDoAgain?: boolean;
  nextShownEarliestAt?: Date;
  lastDifficultyRating?: number;
  lastCorrectnessRating?: number;
} 