import type { WordData } from "@/entities/linguisticUnits";
import type { Exercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 2 exercise: native to target, select from two buttons.
 * Shows native language word and asks for target language equivalent with two options.
 * 
 * Eligibility: Word must be in native language and have translations to target languages
 */
export async function makeTwoButtonsFromNative(
  word: WordData, 
  context: ExerciseGenerationContext
): Promise<Exercise[]> {
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

  // Get a distractor word in the same target language
  let distractorWord = '';
  const targetLanguage = targetTranslations[0].language;
  
  if (context.wordService) {
    const allWords = await context.wordService.getAllInLanguage(targetLanguage);
    const otherWords = allWords.filter(w => w.content !== targetTranslations[0].content);
    
    if (otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      distractorWord = randomWord.content;
    }
  }

  // If no distractor found, use a simple placeholder
  if (!distractorWord) {
    distractorWord = 'Unknown word';
  }

  const correctAnswer = targetTranslations[0].content;

  const exercise: Exercise = {
    id: `word-level2-native-${word.language}-${word.content}`,
    type: 'reveal', // Using reveal for now since choose-from-two isn't supported yet
    prompt: `What is the word for "${word.content}"?`,
    solution: `Correct: ${correctAnswer}\nIncorrect: ${distractorWord}`,
    level: 2,
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
