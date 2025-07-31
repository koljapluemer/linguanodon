import type { TaskType } from './TaskType';

export interface TaskData {
  taskType: TaskType;
  title: string;
  prompt: string;
  evaluateAfterDoing?: boolean;
  decideWhetherToDoAgainAfterDoing?: boolean;
  extraInfo?: string;
  lastShownAt?: Date;
  wantToDoAgain?: boolean;
  nextShownEarliestAt?: Date;
  lastDifficultyRating?: number;
  lastCorrectnessRating?: number;
} 