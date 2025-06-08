export interface LearningGoal {
  _id: string;
  _rev: string;
  type: 'learning_goal';
  title: string;
  description: string;
  parentId?: string;
}

export interface SubGoal {
  _id: string;
  _rev: string;
  type: 'sub_goal';
  title: string;
  description: string;
  parentId: string;
}

export interface UnitOfMeaning {
  _id: string;
  _rev: string;
  type: 'unit_of_meaning';
  subGoalId: string;
  targetLanguage: string;
  translation: string;
}

export interface Exercise {
  _id: string;
  _rev: string;
  type: 'exercise';
  exerciseType: 'FLASHCARD' | 'CLOZE' | 'FIND_TRANSLATION';
  instruction: string;
  unitId: string;
  done?: boolean;
}

export interface ExerciseFlashcard extends Exercise {
  exerciseType: 'FLASHCARD';
  front: string;
  back: string;
}

export interface ExerciseCloze extends Exercise {
  exerciseType: 'CLOZE';
  content: string;
  clozeStart: number;
  clozeEnd: number;
}

export interface ExerciseFindTranslation extends Exercise {
  exerciseType: 'FIND_TRANSLATION';
  targetLanguage: string;
  translation: string;
} 