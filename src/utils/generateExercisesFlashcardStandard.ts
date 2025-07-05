// based on UnitOfMeaning[], generates standard flashcard exercises
// front: a given unit of meanings content, back: it's translation(s) in a native language
// also another flashcard, w/ front and back reversed

import type { UnitOfMeaning } from "@/entities/UnitOfMeaning";
import type { ExerciseFlashcard } from "@/entities/ExerciseFlashcard";

/**
 * Generates standard flashcard exercises from units of meaning
 * Creates flashcards with front/back content and their reversed versions
 */
export function generateExercisesFlashcardStandard(
  unitsOfMeaning: UnitOfMeaning[],
  nativeLanguage: string,
  getUnitOfMeaning: (uid: string) => UnitOfMeaning | undefined
): ExerciseFlashcard[] {
  const exercises: ExerciseFlashcard[] = [];

  for (const unit of unitsOfMeaning) {
    // Skip if no translations
    if (!unit.translations || unit.translations.length === 0) {
      continue;
    }

    // Get all translations in the native language
    const nativeTranslations = unit.translations
      .map(translationUid => getUnitOfMeaning(translationUid))
      .filter((translation): translation is UnitOfMeaning => 
        translation !== undefined && translation.language === nativeLanguage
      )
      .map(translation => translation.content);

    if (nativeTranslations.length === 0) {
      continue;
    }

    // Create forward flashcard (target language -> native language)
    exercises.push({
      uid: `std_fwd_${unit.uid}`,
      front: unit.content,
      back: nativeTranslations.join(", ")
    });

    // Create reverse flashcard (native language -> target language)
    exercises.push({
      uid: `std_rev_${unit.uid}`,
      front: nativeTranslations.join(", "),
      back: unit.content
    });
  }

  return exercises;
}