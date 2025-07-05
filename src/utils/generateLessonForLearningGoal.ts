import type { LearningGoal } from "@/entities/LearningGoal";
import type { UnitOfMeaning } from "@/entities/UnitOfMeaning";
import type { ExerciseFlashcard } from "@/entities/ExerciseFlashcard";
import { generateExercisesFlashcardStandard } from "@/utils/generateExercisesFlashcardStandard";
import { generateExercisesFlashcardCloze } from "@/utils/generateExercisesFlashcardCloze";

/**
 * Generates a lesson with exercises for a given learning goal
 * Combines standard flashcards and cloze exercises, randomly selects 20
 */
export function generateLessonForLearningGoal(
  learningGoal: LearningGoal,
  unitsOfMeaning: UnitOfMeaning[],
  nativeLanguage: string,
  getUnitOfMeaning: (uid: string) => UnitOfMeaning | undefined
): ExerciseFlashcard[] {
  // Generate all possible exercises
  const standardExercises = generateExercisesFlashcardStandard(
    unitsOfMeaning,
    nativeLanguage,
    getUnitOfMeaning
  );

  const clozeExercises = generateExercisesFlashcardCloze(
    unitsOfMeaning,
    nativeLanguage,
    getUnitOfMeaning
  );

  // Combine all exercises
  const allExercises = [...standardExercises, ...clozeExercises];

  // Randomly shuffle and pick first 20 (or all if less than 20)
  const shuffled = allExercises.sort(() => Math.random() - 0.5);
  const selectedExercises = shuffled.slice(0, 20);

  return selectedExercises;
}