// just like generateExercisesFlashcardStandard, only it generates cloze
// only the target language is used for the cloze 
// (so, if a given unit of meaning is in the native lang, consider only its relevnant translations)
// (if a unit of meaning is in the target lang, use that)
// only units of meaning where the content has more than 1 word can be clozed
// generate all possible cloze cards, such as:
// "I have a cat" → "I have a ＿", "I have ＿ cat", "I ＿ a cat", "＿ have a cat"
// The front contains the cloze, and the back the translation and the full sentence

import type { UnitOfMeaning } from "@/entities/UnitOfMeaning";
import type { ExerciseFlashcard } from "@/entities/ExerciseFlashcard";

/**
 * Generates cloze deletion exercises from units of meaning
 * Only generates cloze for content with more than 1 word
 * Creates all possible cloze variations for each eligible unit
 */
export function generateExercisesFlashcardCloze(
  unitsOfMeaning: UnitOfMeaning[],
  nativeLanguage: string,
  getUnitOfMeaning: (uid: string) => UnitOfMeaning | undefined
): ExerciseFlashcard[] {
  const exercises: ExerciseFlashcard[] = [];

  for (const unit of unitsOfMeaning) {
    // Only process target language units or units with target language translations
    let targetLanguageContent: string | null = null;
    let nativeLanguageContent: string | null = null;

    if (unit.language !== nativeLanguage) {
      // This is target language content
      targetLanguageContent = unit.content;
      // Get native language translation
      if (unit.translations && unit.translations.length > 0) {
        const nativeTranslation = unit.translations
          .map(uid => getUnitOfMeaning(uid))
          .find(translation => translation?.language === nativeLanguage);
        if (nativeTranslation) {
          nativeLanguageContent = nativeTranslation.content;
        }
      }
    } else {
      // This is native language content, check if it has target language translations
      if (unit.translations && unit.translations.length > 0) {
        const targetTranslation = unit.translations
          .map(uid => getUnitOfMeaning(uid))
          .find(translation => translation?.language !== nativeLanguage);
        if (targetTranslation) {
          targetLanguageContent = targetTranslation.content;
          nativeLanguageContent = unit.content;
        }
      }
    }

    // Skip if no target language content or if content has only one word
    if (!targetLanguageContent || !nativeLanguageContent) {
      continue;
    }

    const words = targetLanguageContent.trim().split(/\s+/);
    if (words.length <= 1) {
      continue;
    }

    // Generate all possible cloze variations
    for (let i = 0; i < words.length; i++) {
      const clozeWords = [...words];
      clozeWords[i] = "＿";
      const clozeContent = clozeWords.join(" ");

      exercises.push({
        uid: `cloze_${unit.uid}_pos${i}`,
        front: clozeContent,
        back: `${nativeLanguageContent}\n\n${targetLanguageContent}`
      });
    }
  }

  return exercises;
}