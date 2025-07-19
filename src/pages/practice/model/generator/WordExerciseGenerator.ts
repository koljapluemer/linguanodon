import type { WordData } from "@/entities/linguisticUnits";
import type { Exercise } from "../Exercise";
import type { LinguisticUnitData } from "@/entities/linguisticUnits";
import type { ExerciseGeneratorInterface, ExerciseGenerationContext } from "./ExerciseGeneratorInterface";

/**
 * Exercise generator specifically for word-based exercises.
 * Implements all levels 0-9 with word-specific logic.
 */
export class WordExerciseGenerator implements ExerciseGeneratorInterface {
  
  /**
   * Generates a level 0 "Look At Card" exercise for words.
   * Shows the word and its translations, asking the user to remember it.
   */
  async generateLevel0(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    // Check if this is a target or native language word
    const isTargetLanguage = context.targetLanguages.includes(unit.language);
    const isNativeLanguage = context.nativeLanguages.includes(unit.language);
    
    if (!isTargetLanguage && !isNativeLanguage) return null;

    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    const translations = unit.translations
      ?.map(t => t.content)
      .join(', ') || '';

    return [{
      id: `word-level0-${unit.language}-${unit.content}`,
      type: 'reveal',
      prompt: `Try to remember this word: "${unit.content}"`,
      solution: `Translations: ${translations}`,
      level: 0,
      linguisticUnit,
      isRepeatable: false
    }];
  }

  /**
   * Generates a level 1 flashcard exercise (target to native, 2 buttons).
   */
  async generateLevel1(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    // Check if this is a target language word
    const isTargetLanguage = context.targetLanguages.includes(unit.language);
    const isNativeLanguage = context.nativeLanguages.includes(unit.language);
    
    if (!isTargetLanguage && !isNativeLanguage) return null;

    const correctAnswer = unit.translations?.[0]?.content || '';
    
    // Get distractors from service
    let wrongAnswer = '';
    if (context.wordService) {
      const distractors = await context.wordService.getRandomInLanguage(unit.language);
      if (distractors && distractors.translations && distractors.translations.length > 0) {
        wrongAnswer = distractors.translations[0].content;
      }
    }

    return [{
      id: `word-level1-${unit.language}-${unit.content}`,
      type: 'reveal', // Using reveal for now since choose-from-two isn't supported yet
      prompt: `What does "${unit.content}" mean?`,
      solution: `Correct: ${correctAnswer}\nIncorrect: ${wrongAnswer}`,
      level: 1,
      linguisticUnit,
      isRepeatable: true
    }];
  }

  /**
   * Generates a level 2 flashcard exercise (target to native, 4 buttons).
   */
  async generateLevel2(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    // Check if this is a target language word
    const isTargetLanguage = context.targetLanguages.includes(unit.language);
    const isNativeLanguage = context.nativeLanguages.includes(unit.language);
    
    if (!isTargetLanguage && !isNativeLanguage) return null;

    const correctAnswer = unit.translations?.[0]?.content || '';
    
    // Get distractors from service
    let wrongAnswers: string[] = [];
    if (context.wordService) {
      const allWords = await context.wordService.getAllInLanguage(unit.language);
      const otherWords = allWords.filter(w => w.content !== unit.content).slice(0, 3);
      wrongAnswers = otherWords.map(w => w.translations?.[0]?.content || '').filter(Boolean);
    }

    return [{
      id: `word-level2-${unit.language}-${unit.content}`,
      type: 'reveal', // Using reveal for now since choose-from-two isn't supported yet
      prompt: `What does "${unit.content}" mean?`,
      solution: `Correct: ${correctAnswer}\nIncorrect: ${wrongAnswers.join(', ')}`,
      level: 2,
      linguisticUnit,
      isRepeatable: true
    }];
  }

  /**
   * Generates a level 3 flashcard exercise (native to target, 4 buttons).
   */
  async generateLevel3(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    // Check if this is a native language word
    const isNativeLanguage = context.nativeLanguages.includes(unit.language);
    if (!isNativeLanguage) return null;

    const correctAnswer = unit.content;
    
    // Get distractors from service
    let wrongAnswers: string[] = [];
    if (context.wordService) {
      const allWords = await context.wordService.getAllInLanguage(unit.language);
      const otherWords = allWords.filter(w => w.content !== unit.content).slice(0, 3);
      wrongAnswers = otherWords.map(w => w.content).filter(Boolean);
    }

    return [{
      id: `word-level3-${unit.language}-${unit.content}`,
      type: 'reveal', // Using reveal for now since choose-from-two isn't supported yet
      prompt: `What is the word for "${unit.translations?.[0]?.content}"?`,
      solution: `Correct: ${correctAnswer}\nIncorrect: ${wrongAnswers.join(', ')}`,
      level: 3,
      linguisticUnit,
      isRepeatable: true
    }];
  }

  /**
   * Generates a level 4 flashcard exercise (target to native).
   */
  async generateLevel4(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    // Check if this is a target language word
    const isTargetLanguage = context.targetLanguages.includes(unit.language);
    if (!isTargetLanguage) return null;

    const translations = unit.translations
      ?.map(t => t.content)
      .join(', ') || '';

    return [{
      id: `word-level4-${unit.language}-${unit.content}`,
      type: 'reveal',
      prompt: `What does "${unit.content}" mean?`,
      solution: `Translations: ${translations}`,
      level: 4,
      linguisticUnit,
      isRepeatable: true
    }];
  }

  /**
   * Generates a level 5 flashcard exercise (native to target).
   */
  async generateLevel5(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    // Check if this is a native language word
    const isNativeLanguage = context.nativeLanguages.includes(unit.language);
    if (!isNativeLanguage) return null;

    return [{
      id: `word-level5-${unit.language}-${unit.content}`,
      type: 'reveal',
      prompt: `What is the word for "${unit.translations?.[0]?.content}"?`,
      solution: `Word: ${unit.content}`,
      level: 5,
      linguisticUnit,
      isRepeatable: true
    }];
  }

  // Levels 6-9: Not implemented yet
  /**
   * Generates a level 6 exercise (not implemented).
   */
  async generateLevel6(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for word ${unit.content}, level 6, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 7 exercise (not implemented).
   */
  async generateLevel7(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for word ${unit.content}, level 7, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 8 exercise (not implemented).
   */
  async generateLevel8(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for word ${unit.content}, level 8, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 9 exercise (not implemented).
   */
  async generateLevel9(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for word ${unit.content}, level 9, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }
}
