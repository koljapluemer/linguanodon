import type { SentenceData } from "@/entities/linguisticUnits";
import type { Exercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 0 exercise: free translation from target language sentence.
 * Shows target language sentence and asks user to translate it freely.
 * 
 * Eligibility: 
 * - Sentence must have no associated LinguisticProgressData (never seen before)
 * - At least 60% of associated words must be mastered (levels 0-5 either not due or not practiced)
 */
export async function makeFreeTranslateFromTarget(
  sentence: SentenceData, 
  context: ExerciseGenerationContext
): Promise<Exercise[]> {
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

  // Check eligibility: sentence must not have been seen before
  const progress = await context.progressService.get(sentence.language, sentence.content, 'sentence');
  if (progress) {
    return []; // Sentence has been seen before, not eligible for Level 0
  }

  // Check if associated words are mastered (at least 60% completion rate)
  if (sentence.containsWords && sentence.containsWords.length > 0) {
    let masteredWords = 0;
    let totalWords = 0;

    for (const wordRef of sentence.containsWords) {
      const wordProgress = await context.progressService.get(wordRef.language, wordRef.content, 'word');
      
      if (wordProgress) {
        // Check if levels 0-5 are either not practiced or not due
        let wordMastered = true;
        for (let level = 0; level <= 5; level++) {
          const card = wordProgress.cards[level];
          if (card && card.due && new Date(card.due) <= new Date()) {
            // Card exists and is due, so word is not mastered
            wordMastered = false;
            break;
          }
        }
        if (wordMastered) {
          masteredWords++;
        }
      } else {
        // Word has no progress data, consider it not mastered
        // wordMastered is already false from the loop above
      }
      totalWords++;
    }

    const masteryRate = totalWords > 0 ? masteredWords / totalWords : 0;
    if (masteryRate < 0.6) {
      return []; // Less than 60% of words are mastered
    }
  }

  const translationsText = nativeTranslations.map(t => t.content).join(', ');

  const exercise: Exercise = {
    id: `sentence-level0-${sentence.language}-${sentence.content}`,
    type: 'free-translate',
    prompt: `Translate this sentence: "${sentence.content}"`,
    solution: `Translation: ${translationsText}`,
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
