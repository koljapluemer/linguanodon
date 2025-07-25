import type { SentenceData } from "@/entities/linguisticUnits";
import type { FreeTranslateExercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 0 free translation exercise for sentences.
 * Shows target language sentence and asks user to translate it.
 * 
 * Eligibility: Sentence must be in target language and have translations to native languages
 */
export async function makeFreeTranslateFromTarget(
  sentence: SentenceData, 
  context: ExerciseGenerationContext
): Promise<FreeTranslateExercise[]> {
  // Check if this is a target language sentence
  const isTargetLanguage = context.targetLanguages.includes(sentence.language);
  if (!isTargetLanguage) {
    return []; // Not a target language sentence
  }

  // Check if sentence has translations to native languages
  const nativeTranslations = sentence.translations
    ?.filter(t => context.nativeLanguages.includes(t.language)) || [];
  
  if (nativeTranslations.length === 0) {
    return []; // No native language translations available
  }

  const translationsText = nativeTranslations.map(t => t.content).join(', ');

  const exercise: FreeTranslateExercise = {
    id: `sentence-level0-${sentence.language}-${sentence.content}`,
    type: 'free-translate',
    prompt: `Translate this sentence:`,
    solution: `Translations: ${translationsText}`,
    level: 0,
    linguisticUnit: {
      type: 'sentence',
      language: sentence.language,
      content: sentence.content,
      translations: sentence.translations,
      notes: sentence.notes
    },
    isRepeatable: false
  };

  return [exercise];
}
