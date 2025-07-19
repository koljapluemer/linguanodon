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
}

/**
 * Interface for exercise generators that enforce the contract
 * of having generation and validation methods for each level 0-9.
 */
export interface ExerciseGeneratorInterface {
  /**
   * Generates a level 0 exercise.
   */
  generateLevel0(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 1 exercise.
   */
  generateLevel1(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 2 exercise.
   */
  generateLevel2(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 3 exercise.
   */
  generateLevel3(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 4 exercise.
   */
  generateLevel4(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 5 exercise.
   */
  generateLevel5(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 6 exercise.
   */
  generateLevel6(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 7 exercise.
   */
  generateLevel7(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 8 exercise.
   */
  generateLevel8(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Generates a level 9 exercise.
   */
  generateLevel9(unit: WordData | SentenceData, context?: ExerciseGenerationContext): Promise<Exercise | null>;
  
  /**
   * Checks if a level 0 exercise can be generated.
   */
  canGenerateLevel0(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 1 exercise can be generated.
   */
  canGenerateLevel1(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 2 exercise can be generated.
   */
  canGenerateLevel2(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 3 exercise can be generated.
   */
  canGenerateLevel3(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 4 exercise can be generated.
   */
  canGenerateLevel4(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 5 exercise can be generated.
   */
  canGenerateLevel5(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 6 exercise can be generated.
   */
  canGenerateLevel6(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 7 exercise can be generated.
   */
  canGenerateLevel7(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 8 exercise can be generated.
   */
  canGenerateLevel8(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
  
  /**
   * Checks if a level 9 exercise can be generated.
   */
  canGenerateLevel9(unit: WordData | SentenceData, context?: ExerciseGenerationContext): boolean;
} 