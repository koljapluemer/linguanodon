import type { WordData } from "@/entities/linguisticUnits";
import type { RevealExercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 4 exercise: target to native, reveal translation.
 * Shows target language word and reveals the translation when user clicks reveal.
 * 
 * Eligibility: Word must be in target language and have translations to native languages
 */
export async function makeRevealFromTarget(
  word: WordData, 
  context: ExerciseGenerationContext
): Promise<RevealExercise[]> {
  // Check if this is a target language word
  const isTargetLanguage = context.targetLanguages.includes(word.language);
  if (!isTargetLanguage) {
    return []; // Not a target language word
  }

  // Check if word has translations to native languages
  const nativeTranslations = word.translations
    ?.filter(t => context.nativeLanguages.includes(t.language)) || [];
  
  if (nativeTranslations.length === 0) {
    return []; // No native language translations available
  }

  const translationsText = nativeTranslations.map(t => t.content).join(', ');

  const exercise: RevealExercise = {
    id: `word-level4-${word.language}-${word.content}`,
    type: 'reveal',
    prompt: `What does "${word.content}" mean?`,
    solution: `Translations: ${translationsText}`,
    level: 4,
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
