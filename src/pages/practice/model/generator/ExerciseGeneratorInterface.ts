import type { Exercise } from "../Exercise";
import type { WordData, SentenceData } from "@/entities/linguisticUnits";
import type { WordServiceContract, SentenceServiceContract, ProgressServiceContract } from "@/entities/linguisticUnits/contracts";

/**
 * Context for exercise generation, containing service contracts.
 */
export interface ExerciseGenerationContext {
  wordService: WordServiceContract;
  sentenceService: SentenceServiceContract;
  progressService: ProgressServiceContract;
  nativeLanguages: string[];
  targetLanguages: string[];
}

/**
 * Interface for exercise generators that enforce the contract
 * of having generation and validation methods for each level 0-9.
 */
export interface ExerciseGeneratorInterface {
  /**
   * Generates a level 0 exercise.
   */
  generateLevel0(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 1 exercise.
   */
  generateLevel1(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 2 exercise.
   */
  generateLevel2(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 3 exercise.
   */
  generateLevel3(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 4 exercise.
   */
  generateLevel4(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 5 exercise.
   */
  generateLevel5(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 6 exercise.
   */
  generateLevel6(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 7 exercise.
   */
  generateLevel7(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 8 exercise.
   */
  generateLevel8(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;
  
  /**
   * Generates a level 9 exercise.
   */
  generateLevel9(unit: WordData | SentenceData, context: ExerciseGenerationContext): Promise<Exercise[]>;

} 