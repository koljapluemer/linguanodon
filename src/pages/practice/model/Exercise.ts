import type { LinguisticUnitData } from "@/entities/linguisticUnits";

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

// Union type for all exercises
export type Exercise = RevealExercise | ChooseFromTwoExercise | ChooseFromFourExercise | FreeTranslateExercise | TryToRememberExercise; 