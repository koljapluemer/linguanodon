import type { WordData } from "@/entities/linguisticUnits";
import type { Exercise } from "../Exercise";
import type { LinguisticUnitData } from "@/entities/linguisticUnits";
import type { ExerciseGeneratorInterface, ExerciseGenerationContext } from "./ExerciseGeneratorInterface";

/**
 * Exercise generator specifically for word-based exercises.
 * Implements all levels 0-9 with word-specific logic.
 */
export class WordExerciseGenerator implements ExerciseGeneratorInterface {
  
  // Level 0: Look At Card
  generateLevel0(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    if (!this.canGenerateLevel0(unit, context)) return null;
    
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

    return {
      id: `word-level0-${unit.language}-${unit.content}`,
      type: 'reveal',
      prompt: `Try to remember this word: "${unit.content}"`,
      solution: `Translations: ${translations}`,
      level: 0,
      linguisticUnit,
      isRepeatable: false
    };
  }

  /**
   * Checks if a level 0 exercise can be generated for this word.
   */
  canGenerateLevel0(_unit: WordData, _context?: ExerciseGenerationContext): boolean {
    return true; // Always possible, eligibility checked in lesson generation
  }

  // Level 1: Flashcard from target to native, select from two buttons
  async generateLevel1(unit: WordData, context?: ExerciseGenerationContext): Promise<Exercise | null> {
    if (!this.canGenerateLevel1(unit, context)) return null;
    
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    const correctAnswer = unit.translations?.[0]?.content || '';
    
    // Get distractors from service if context is provided
    let wrongAnswer = '';
    if (context?.wordService) {
      const distractors = await context.wordService.getRandomInLanguage(unit.language);
      if (distractors && distractors.translations && distractors.translations.length > 0) {
        wrongAnswer = distractors.translations[0].content;
      }
    }

    return {
      id: `word-level1-${unit.language}-${unit.content}`,
      type: 'reveal', // Using reveal for now since choose-from-two isn't supported yet
      prompt: `What does "${unit.content}" mean?`,
      solution: `Correct: ${correctAnswer}\nIncorrect: ${wrongAnswer}`,
      level: 1,
      linguisticUnit,
      isRepeatable: true
    };
  }

  canGenerateLevel1(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return !!(unit.translations && unit.translations.length > 0);
  }

  // Level 2: Flashcard from target to native, select from four buttons
  generateLevel2(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    if (!this.canGenerateLevel2(unit, context)) return null;
    
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    const correctAnswer = unit.translations?.[0]?.content || '';
    const wrongAnswers = context?.distractors?.slice(0, 3).map(d => d.translations?.[0]?.content || '') || [];

    return {
      id: `word-level2-${unit.language}-${unit.content}`,
      type: 'choose-from-two',
      prompt: `What does "${unit.content}" mean?`,
      solution: `Correct: ${correctAnswer}`,
      level: 2,
      linguisticUnit,
      isRepeatable: true,
      data: {
        options: [correctAnswer, ...wrongAnswers],
        correctAnswer
      }
    };
  }

  canGenerateLevel2(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return !!(unit.translations && unit.translations.length > 0);
  }

  // Level 3: Flashcard from native to target, select from four buttons
  generateLevel3(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    if (!this.canGenerateLevel3(unit, context)) return null;
    
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    const correctAnswer = unit.content;
    const wrongAnswers = context?.distractors?.slice(0, 3).map(d => d.content) || [];

    return {
      id: `word-level3-${unit.language}-${unit.content}`,
      type: 'choose-from-two',
      prompt: `What is the word for "${unit.translations?.[0]?.content}"?`,
      solution: `Correct: ${correctAnswer}`,
      level: 3,
      linguisticUnit,
      isRepeatable: true,
      data: {
        options: [correctAnswer, ...wrongAnswers],
        correctAnswer
      }
    };
  }

  canGenerateLevel3(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return !!(unit.translations && unit.translations.length > 0);
  }

  // Level 4: Flashcard target to native
  generateLevel4(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    if (!this.canGenerateLevel4(unit, context)) return null;
    
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

    return {
      id: `word-level4-${unit.language}-${unit.content}`,
      type: 'reveal',
      prompt: `What does "${unit.content}" mean?`,
      solution: `Translations: ${translations}`,
      level: 4,
      linguisticUnit,
      isRepeatable: true
    };
  }

  canGenerateLevel4(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return !!(unit.translations && unit.translations.length > 0);
  }

  // Level 5: Flashcard native to target
  generateLevel5(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    if (!this.canGenerateLevel5(unit, context)) return null;
    
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    return {
      id: `word-level5-${unit.language}-${unit.content}`,
      type: 'reveal',
      prompt: `What is the word for "${unit.translations?.[0]?.content}"?`,
      solution: `Word: ${unit.content}`,
      level: 5,
      linguisticUnit,
      isRepeatable: true
    };
  }

  canGenerateLevel5(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return !!(unit.translations && unit.translations.length > 0);
  }

  // Levels 6-9: Not implemented yet
  generateLevel6(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    return null;
  }

  canGenerateLevel6(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return false;
  }

  generateLevel7(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    return null;
  }

  canGenerateLevel7(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return false;
  }

  generateLevel8(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    return null;
  }

  canGenerateLevel8(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return false;
  }

  generateLevel9(unit: WordData, context?: ExerciseGenerationContext): Exercise | null {
    return null;
  }

  canGenerateLevel9(unit: WordData, context?: ExerciseGenerationContext): boolean {
    return false;
  }
}
