import type { WordData } from "@/entities/linguisticUnits";
import type { TryToRememberExercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 0 "Look At Card" exercise.
 * Shows the word and its translations, asking the user to remember it.
 * Can work with both target and native language words.
 * 
 * Eligibility: Word must have no associated LinguisticProgressData (never seen before)
 */
export async function makeTryToRemember(
  word: WordData, 
  context: ExerciseGenerationContext
): Promise<TryToRememberExercise[]> {
  // Check eligibility: word must not have been seen before
  const progress = await context.progressService.get(word.language, word.content, 'word');
  if (progress) {
    return []; // Word has been seen before, not eligible for Level 0
  }

  // Check if this is a target or native language word
  const isTargetLanguage = context.targetLanguages.includes(word.language);
  const isNativeLanguage = context.nativeLanguages.includes(word.language);
  
  if (!isTargetLanguage && !isNativeLanguage) {
    return []; // Word is not in user's languages
  }

  // Get translations in the appropriate language
  let displayTranslations: string[] = [];
  
  if (isTargetLanguage) {
    // For target language words, show translations to native languages
    displayTranslations = word.translations
      ?.filter(t => context.nativeLanguages.includes(t.language))
      .map(t => t.content) || [];
  } else {
    // For native language words, show translations to target languages
    displayTranslations = word.translations
      ?.filter(t => context.targetLanguages.includes(t.language))
      .map(t => t.content) || [];
  }

  if (displayTranslations.length === 0) {
    return []; // No suitable translations available
  }

  const translationsText = displayTranslations.join(', ');

  const exercise: TryToRememberExercise = {
    id: `word-level0-${word.language}-${word.content}`,
    type: 'try-to-remember',
    prompt: `Try to remember this word:`,
    solution: `${translationsText}`,
    level: 0,
    linguisticUnit: {
      type: 'word',
      language: word.language,
      content: word.content,
      translations: word.translations,
      notes: word.notes
    },
    isRepeatable: false
  };

  return [exercise];
}
