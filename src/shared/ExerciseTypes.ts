export interface Exercise {
  id: string;
  type: 'try-to-remember' | 'reveal';
  vocabId: string;
  prompt: string;
  solution: string;
  vocab: {
    content: string;
    translations: string[];
  };
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