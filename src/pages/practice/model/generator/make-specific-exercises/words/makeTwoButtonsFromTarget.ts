import type { WordData } from "@/entities/linguisticUnits";
import type { Exercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 1 exercise: target to native, select from two buttons.
 * Shows target language word and asks for meaning with two options.
 * 
 * Eligibility: Word must be in target language and have translations to native languages
 */
export async function makeTwoButtonsFromTarget(
  word: WordData, 
  context: ExerciseGenerationContext
): Promise<Exercise[]> {
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

  // Get a distractor word in the same native language
  let distractorTranslation = '';
  const targetNativeLanguage = nativeTranslations[0].language;
  
  if (context.wordService) {
    const allWords = await context.wordService.getAllInLanguage(word.language);
    const otherWords = allWords.filter(w => 
      w.content !== word.content && 
      w.translations?.some(t => t.language === targetNativeLanguage)
    );
    
    if (otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      const distractor = randomWord.translations?.find(t => t.language === targetNativeLanguage);
      if (distractor) {
        distractorTranslation = distractor.content;
      }
    }
  }

  // If no distractor found, use a simple placeholder
  if (!distractorTranslation) {
    distractorTranslation = 'Unknown word';
  }

  const correctAnswer = nativeTranslations[0].content;

  const exercise: Exercise = {
    id: `word-level1-${word.language}-${word.content}`,
    type: 'reveal', // Using reveal for now since choose-from-two isn't supported yet
    prompt: `What does "${word.content}" mean?`,
    solution: `Correct: ${correctAnswer}\nIncorrect: ${distractorTranslation}`,
    level: 1,
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
