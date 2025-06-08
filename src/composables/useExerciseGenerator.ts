import type { UnitOfMeaning, Exercise, ExerciseFlashcard, ExerciseCloze, ExerciseFindTranslation } from '@/types/learning'

export function useExerciseGenerator() {
  const generateExercises = (unit: UnitOfMeaning): Exercise[] => {
    const exercises: Exercise[] = []

    // Generate flashcard exercises if both target language and translation are present
    if (unit.targetLanguage && unit.translation) {
      // Front: target language, Back: translation
      exercises.push({
        type: 'exercise',
        exerciseType: 'FLASHCARD',
        instruction: 'Translate.',
        unitId: unit._id!,
        front: unit.targetLanguage,
        back: unit.translation,
      } as ExerciseFlashcard)

      // Front: translation, Back: target language
      exercises.push({
        type: 'exercise',
        exerciseType: 'FLASHCARD',
        instruction: 'Translate.',
        unitId: unit._id!,
        front: unit.translation,
        back: unit.targetLanguage,
      } as ExerciseFlashcard)

      // Generate cloze exercise if target language has multiple words
      const words = unit.targetLanguage.trim().split(/\s+/)
      if (words.length > 1) {
        words.forEach((word, index) => {
          const content = `${unit.translation}\n\n${unit.targetLanguage}`
          const clozeStart = content.indexOf(word)
          const clozeEnd = clozeStart + word.length

          exercises.push({
            type: 'exercise',
            exerciseType: 'CLOZE',
            instruction: 'Fill in the blank.',
            unitId: unit._id!,
            content,
            clozeStart,
            clozeEnd,
          } as ExerciseCloze)
        })
      }
    }

    // Generate find translation exercise if either target language or translation is missing
    if (!unit.targetLanguage || !unit.translation) {
      exercises.push({
        type: 'exercise',
        exerciseType: 'FIND_TRANSLATION',
        instruction: 'Find the translation.',
        unitId: unit._id!,
        targetLanguage: unit.targetLanguage || '',
        translation: unit.translation || '',
      } as ExerciseFindTranslation)
    }

    return exercises
  }

  return {
    generateExercises,
  }
} 