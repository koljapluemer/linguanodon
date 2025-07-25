import type { LinguisticUnitData } from "@/entities/linguisticUnits";
import type { ResourceData } from "@/entities/resources";

// Base interface for all exercises
export interface BaseExercise {
  id: string;
  level: number;
  linguisticUnit: LinguisticUnitData;
  isRepeatable: boolean;
}

// Answer option interface
export interface AnswerOption {
  content: string;
  isCorrect: boolean;
}

// Type-specific exercise interfaces
export interface RevealExercise extends BaseExercise {
  type: 'reveal';
  prompt: string;
  solution: string;
}

export interface ChooseFromTwoExercise extends BaseExercise {
  type: 'choose-from-two';
  prompt: string;
  answerOptions: [AnswerOption, AnswerOption];
}

export interface ChooseFromFourExercise extends BaseExercise {
  type: 'choose-from-four';
  prompt: string;
  answerOptions: [AnswerOption, AnswerOption, AnswerOption, AnswerOption];
}

export interface FreeTranslateExercise extends BaseExercise {
  type: 'free-translate';
  prompt: string;
  solution: string;
}

export interface TryToRememberExercise extends BaseExercise {
  type: 'try-to-remember';
  prompt: string;
  solution: string;
}

export interface ResourceExercise extends BaseExercise {
  type: 'resource-extraction';
  resource: ResourceData;
  prompt: string;
}

export interface MissingTranslationExercise extends BaseExercise {
  type: 'missing-translation';
  missingLanguages: string[];
  prompt: string;
}

export interface MilestoneExercise extends BaseExercise {
  type: 'milestone';
  prompt: string;
  milestoneContent: string;
}

export interface ImmersionContentExercise extends BaseExercise {
  type: 'immersion-content';
  prompt: string;
  immersionContent: import('@/entities/immersion-content').ImmersionContentData;
}

// Union type for all exercises
export type Exercise = RevealExercise | ChooseFromTwoExercise | ChooseFromFourExercise | FreeTranslateExercise | TryToRememberExercise | ResourceExercise | MissingTranslationExercise | MilestoneExercise | ImmersionContentExercise; 