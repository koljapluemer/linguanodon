import type { SentenceData } from "@/entities/linguisticUnits";
import type { Exercise } from "../Exercise";
import type { LinguisticUnitData } from "@/entities/linguisticUnits";
import type { ExerciseGeneratorInterface, ExerciseGenerationContext } from "./ExerciseGeneratorInterface";

/**
 * Exercise generator specifically for sentence-based exercises.
 * Implements all levels 0-9 with sentence-specific logic.
 */
export class SentenceExerciseGenerator implements ExerciseGeneratorInterface {
  
  /**
   * Generates a level 0 free translation exercise for sentences.
   * Only generates for target language sentences (target → native translation).
   */
  async generateLevel0(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    // Only generate for sentences that have translations
    if (!unit.translations || unit.translations.length === 0) {
      return null;
    }
    
    // Check if this is a target language sentence
    const isTargetLanguage = context.targetLanguages.includes(unit.language);
    if (!isTargetLanguage) {
      return null;
    }
    
    const linguisticUnit: LinguisticUnitData = {
      type: 'sentence',
      language: unit.language,
      content: unit.content,
      translations: unit.translations,
      notes: unit.notes
    };

    const translations = unit.translations
      ?.map(t => t.content)
      .join(', ') || '';

    return [{
      id: `sentence-level0-${unit.language}-${unit.content}`,
      type: 'free-translate',
      prompt: `Translate this sentence: "${unit.content}"`,
      solution: `Translation: ${translations}`,
      level: 0,
      linguisticUnit,
      isRepeatable: false
    }];
  }

  // Levels 1-9: Not implemented yet
  /**
   * Generates a level 1 exercise (not implemented).
   */
  async generateLevel1(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 1, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 2 exercise (not implemented).
   */
  async generateLevel2(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 2, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 3 exercise (not implemented).
   */
  async generateLevel3(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 3, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 4 exercise (not implemented).
   */
  async generateLevel4(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 4, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 5 exercise (not implemented).
   */
  async generateLevel5(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 5, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 6 exercise (not implemented).
   */
  async generateLevel6(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 6, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 7 exercise (not implemented).
   */
  async generateLevel7(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 7, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 8 exercise (not implemented).
   */
  async generateLevel8(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 8, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }

  /**
   * Generates a level 9 exercise (not implemented).
   */
  async generateLevel9(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[] | null> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 9, target languages: ${context.targetLanguages.join(', ')}`);
    return null;
  }
}
