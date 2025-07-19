import type { WordData } from "@/entities/linguisticUnits";
import type { RevealExercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 5 exercise: native to target, reveal translation.
 * Shows native language word and reveals the target language equivalent when user clicks reveal.
 * 
 * Eligibility: Word must be in native language and have translations to target languages
 */
export async function makeRevealFromNative(
  word: WordData, 
  context: ExerciseGenerationContext
): Promise<RevealExercise[]> {
  // Check if this is a native language word
  const isNativeLanguage = context.nativeLanguages.includes(word.language);
  if (!isNativeLanguage) {
    return []; // Not a native language word
  }

  // Check if word has translations to target languages
  const targetTranslations = word.translations
    ?.filter(t => context.targetLanguages.includes(t.language)) || [];
  
  if (targetTranslations.length === 0) {
    return []; // No target language translations available
  }

  const translationsText = targetTranslations.map(t => t.content).join(', ');

  const exercise: RevealExercise = {
    id: `word-level5-${word.language}-${word.content}`,
    type: 'reveal',
    prompt: `What is the word for "${word.content}"?`,
    solution: `Translations: ${translationsText}`,
    level: 5,
    linguisticUnit: {
      type: 'word',
      language: word.language,
      content: word.content,
      translations: word.translations,
      notes: word.notes
    },
    isRepeatable: true
  };

  return [exercise];
}
