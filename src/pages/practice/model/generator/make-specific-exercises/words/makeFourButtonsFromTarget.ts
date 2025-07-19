import type { WordData } from "@/entities/linguisticUnits";
import type { Exercise } from "../../../Exercise";
import type { ExerciseGenerationContext } from "../../ExerciseGeneratorInterface";

/**
 * Generates a Level 2 exercise: target to native, select from four buttons.
 * Shows target language word and asks for meaning with four options.
 * 
 * Eligibility: Word must be in target language and have translations to native languages
 */
export async function makeFourButtonsFromTarget(
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

  // Get distractor words in the same native language
  const distractorTranslations: string[] = [];
  const targetNativeLanguage = nativeTranslations[0].language;
  
  if (context.wordService) {
    const allWords = await context.wordService.getAllInLanguage(word.language);
    const otherWords = allWords.filter(w => 
      w.content !== word.content && 
      w.translations?.some(t => t.language === targetNativeLanguage)
    );
    
    // Take up to 3 distractors
    for (let i = 0; i < Math.min(3, otherWords.length); i++) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      const distractor = randomWord.translations?.find(t => t.language === targetNativeLanguage);
      if (distractor && !distractorTranslations.includes(distractor.content)) {
        distractorTranslations.push(distractor.content);
      }
    }
  }

  // Fill up to 3 distractors if needed
  while (distractorTranslations.length < 3) {
    distractorTranslations.push(`Distractor ${distractorTranslations.length + 1}`);
  }

  const correctAnswer = nativeTranslations[0].content;

  const exercise: Exercise = {
    id: `word-level2-${word.language}-${word.content}`,
    type: 'reveal', // Using reveal for now since choose-from-two isn't supported yet
    prompt: `What does "${word.content}" mean?`,
    solution: `Correct: ${correctAnswer}\nIncorrect: ${distractorTranslations.join(', ')}`,
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