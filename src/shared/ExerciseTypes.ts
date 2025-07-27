export interface AnswerOption {
  content: string;
  isCorrect: boolean;
}

export interface Exercise {
  id: string;
  type: 'try-to-remember' | 'reveal' | 'choose-from-two-vocab-to-translation' | 'choose-from-two-translation-to-vocab' | 'choose-from-four-vocab-to-translation' | 'choose-from-four-translation-to-vocab';
  vocabId: string;
  prompt: string;
  solution: string;
  vocab: {
    content: string;
    translations: string[];
  };
  // For choice exercises
  answerOptions?: AnswerOption[];
  // For reverse exercises (translation → vocab)
  isReverse?: boolean;
  targetTranslation?: string;
}

export type ExerciseRating = 'Impossible' | 'Hard' | 'Doable' | 'Easy';

export interface ExerciseEmits {
  (e: 'rate', rating: ExerciseRating): void;
}

export interface TaskEvaluation {
  correctnessRating: number; // 1-5 range slider
  difficultyRating: number;  // 1-5 range slider
  wantToDoAgain: 'no' | 'yes' | 'maybe';
}