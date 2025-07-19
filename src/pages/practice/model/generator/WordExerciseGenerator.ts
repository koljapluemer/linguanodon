import type { WordData } from "@/entities/linguisticUnits";
import type { Exercise } from "../Exercise";
import type { ExerciseGeneratorInterface, ExerciseGenerationContext } from "./ExerciseGeneratorInterface";
import { makeTryToRemember } from "./make-specific-exercises/words/makeTryToRemember";
import { makeTwoButtonsFromTarget } from "./make-specific-exercises/words/makeTwoButtonsFromTarget";
import { makeFourButtonsFromTarget } from "./make-specific-exercises/words/makeFourButtonsFromTarget";
import { makeFourButtonsFromNative } from "./make-specific-exercises/words/makeFourButtonsFromNative";
import { makeRevealFromTarget } from "./make-specific-exercises/words/makeRevealFromTarget";
import { makeRevealFromNative } from "./make-specific-exercises/words/makeRevealFromNative";

/**
 * Exercise generator specifically for word-based exercises.
 * Delegates to specific exercise functions for each level.
 */
export class WordExerciseGenerator implements ExerciseGeneratorInterface {
  
  /**
   * Generates a level 0 "Look At Card" exercise for words.
   */
  async generateLevel0(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    return makeTryToRemember(unit, context);
  }

  /**
   * Generates a level 1 flashcard exercise (target to native, 2 buttons).
   */
  async generateLevel1(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    return makeTwoButtonsFromTarget(unit, context);
  }

  /**
   * Generates a level 2 flashcard exercise (target to native, 4 buttons).
   */
  async generateLevel2(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    return makeFourButtonsFromTarget(unit, context);
  }

  /**
   * Generates a level 3 flashcard exercise (native to target, 4 buttons).
   */
  async generateLevel3(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    return makeFourButtonsFromNative(unit, context);
  }

  /**
   * Generates a level 4 flashcard exercise (target to native).
   */
  async generateLevel4(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    return makeRevealFromTarget(unit, context);
  }

  /**
   * Generates a level 5 flashcard exercise (native to target).
   */
  async generateLevel5(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    return makeRevealFromNative(unit, context);
  }

  // Levels 6-9: Not implemented yet
  /**
   * Generates a level 6 exercise (not implemented).
   */
  async generateLevel6(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for word ${unit.content}, level 6, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 7 exercise (not implemented).
   */
  async generateLevel7(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for word ${unit.content}, level 7, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 8 exercise (not implemented).
   */
  async generateLevel8(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for word ${unit.content}, level 8, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }

  /**
   * Generates a level 9 exercise (not implemented).
   */
  async generateLevel9(unit: WordData, context: ExerciseGenerationContext): Promise<Exercise[]> {
    console.debug(`Generating exercises for word ${unit.content}, level 9, target languages: ${context.targetLanguages.join(', ')}`);
    return [];
  }
}
