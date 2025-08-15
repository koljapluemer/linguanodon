import type { Rating } from "ts-fsrs";

export interface TaskData {
  uid: string;
  taskType: string;
  title: string;
  prompt: string;
  evaluateDifficultyAfterDoing: boolean;
  decideWhetherToDoAgainAfterDoing: boolean;
  isOneTime: boolean;
  isActive: boolean;
  taskSize: 'big' | 'medium' | 'small';
  lastShownAt?: Date;
  lastDifficultyRating?: Rating;

  associatedVocab?: string[] // uids of vocab data
  associatedResources?: string[] // uids of resourcee data
  associatedFactCards?: string[] // uids of fact card data
  associatedGoals?: string[] // uids of goal data
} 