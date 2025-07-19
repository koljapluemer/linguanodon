import type { SentenceData } from "@/entities/linguisticUnits";
import type { Exercise } from "../Exercise";
import type { ExerciseGeneratorInterface, ExerciseGenerationContext } from "./ExerciseGeneratorInterface";
import { makeFreeTranslateFromTarget } from "./make-specific-exercises/sentences/makeFreeTranslateFromTarget";

/**
 * Exercise generator specifically for sentence-based exercises.
 * Delegates to specific exercise functions for each level.
 */
export class SentenceExerciseGenerator implements ExerciseGeneratorInterface {
  
  /**
   * Generates a level 0 free translation exercise for sentences.
   */
  async generateLevel0(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    return makeFreeTranslateFromTarget(unit, context);
  }

  // Levels 1-9: Not implemented yet
  /**
   * Generates a level 1 exercise (not implemented).
   */
  async generateLevel1(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 1, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 2 exercise (not implemented).
   */
  async generateLevel2(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 2, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 3 exercise (not implemented).
   */
  async generateLevel3(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 3, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 4 exercise (not implemented).
   */
  async generateLevel4(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 4, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 5 exercise (not implemented).
   */
  async generateLevel5(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 5, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 6 exercise (not implemented).
   */
  async generateLevel6(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 6, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 7 exercise (not implemented).
   */
  async generateLevel7(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 7, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 8 exercise (not implemented).
   */
  async generateLevel8(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 8, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 9 exercise (not implemented).
   */
  async generateLevel9(unit: SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for sentence ${unit.content.substring(0, 20)}..., level 9, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }
}
