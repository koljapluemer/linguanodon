import type { WordData } from "@/entities/linguisticUnits";
import type { Exercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 3 exercise: native to target, select from four buttons.
 * Shows native language word and asks for target language equivalent with four options.
 * 
 * Eligibility: Word must be in native language and have translations to target languages
 */
export async function makeFourButtonsFromNative(
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

  // Get distractor words in the same target language
  const distractorWords: string[] = [];
  const targetLanguage = targetTranslations[0].language;
  
  if (context.wordService) {
    const allWords = await context.wordService.getAllInLanguage(targetLanguage);
    const otherWords = allWords.filter(w => w.content !== targetTranslations[0].content);
    
    // Take up to 3 distractors
    for (let i = 0; i < Math.min(3, otherWords.length); i++) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      if (!distractorWords.includes(randomWord.content)) {
        distractorWords.push(randomWord.content);
      }
    }
  }

  // Fill up to 3 distractors if needed
  while (distractorWords.length < 3) {
    distractorWords.push(`Distractor ${distractorWords.length + 1}`);
  }

  const correctAnswer = targetTranslations[0].content;

  const exercise: Exercise = {
    id: `word-level3-${word.language}-${word.content}`,
    type: 'reveal', // Using reveal for now since choose-from-two isn't supported yet
    prompt: `What is the word for "${word.content}"?`,
    solution: `Correct: ${correctAnswer}\nIncorrect: ${distractorWords.join(', ')}`,
    level: 3,
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