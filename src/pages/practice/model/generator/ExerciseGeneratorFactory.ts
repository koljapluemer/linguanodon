import type { WordData, SentenceData } from "@/entities/linguisticUnits";
import { wordService, sentenceService, progressService } from "@/entities/linguisticUnits";
import { languageService } from "@/entities/languages";
import type { Exercise } from "../Exercise";
import type { ExerciseGenerationContext } from "./ExerciseGeneratorInterface";
import { WordExerciseGenerator } from "./WordExerciseGenerator";
import { SentenceExerciseGenerator } from "./SentenceExerciseGenerator";

/**
 * Factory for creating and managing exercise generators.
 * Provides generators with the proper service context.
 */
export class ExerciseGeneratorFactory {
  private static wordGenerator = new WordExerciseGenerator();
  private static sentenceGenerator = new SentenceExerciseGenerator();

  /**
   * Creates the exercise generation context with service contracts and language preferences.
   */
  static async createContext(): Promise<ExerciseGenerationContext> {
    const [targetLanguages, nativeLanguages] = await Promise.all([
      languageService.getUserTargetLanguages(),
      languageService.getUserNativeLanguages()
    ]);
    
    return {
      wordService,
      sentenceService,
      progressService,
      targetLanguages: targetLanguages.map(l => l.code),
      nativeLanguages: nativeLanguages.map(l => l.code)
    };
  }

  /**
   * Generates a word exercise at the specified level.
   * Returns a randomly selected exercise from the generated array.
   */
  static async generateWordExercise(
    word: WordData, 
    level: number, 
    context: ExerciseGenerationContext
  ): Promise<Exercise | null> {
    let exercises: Exercise[] = [];
    
    switch (level) {
      case 0:
        exercises = await this.wordGenerator.generateLevel0(word, context);
        break;
      case 1:
        exercises = await this.wordGenerator.generateLevel1(word, context);
        break;
      case 2:
        exercises = await this.wordGenerator.generateLevel2(word, context);
        break;
      case 3:
        exercises = await this.wordGenerator.generateLevel3(word, context);
        break;
      case 4:
        exercises = await this.wordGenerator.generateLevel4(word, context);
        break;
      case 5:
        exercises = await this.wordGenerator.generateLevel5(word, context);
        break;
      case 6:
        exercises = await this.wordGenerator.generateLevel6(word, context);
        break;
      case 7:
        exercises = await this.wordGenerator.generateLevel7(word, context);
        break;
      case 8:
        exercises = await this.wordGenerator.generateLevel8(word, context);
        break;
      case 9:
        exercises = await this.wordGenerator.generateLevel9(word, context);
        break;
      default:
        return null;
    }
    
    if (exercises.length === 0) {
      return null;
    }
    
    // Return a randomly selected exercise
    return exercises[Math.floor(Math.random() * exercises.length)];
  }

  /**
   * Generates a sentence exercise at the specified level.
   * Returns a randomly selected exercise from the generated array.
   */
  static async generateSentenceExercise(
    sentence: SentenceData, 
    level: number, 
    context: ExerciseGenerationContext
  ): Promise<Exercise | null> {
    let exercises: Exercise[] = [];
    
    switch (level) {
      case 0:
        exercises = await this.sentenceGenerator.generateLevel0(sentence, context);
        break;
      case 1:
        exercises = await this.sentenceGenerator.generateLevel1(sentence, context);
        break;
      case 2:
        exercises = await this.sentenceGenerator.generateLevel2(sentence, context);
        break;
      case 3:
        exercises = await this.sentenceGenerator.generateLevel3(sentence, context);
        break;
      case 4:
        exercises = await this.sentenceGenerator.generateLevel4(sentence, context);
        break;
      case 5:
        exercises = await this.sentenceGenerator.generateLevel5(sentence, context);
        break;
      case 6:
        exercises = await this.sentenceGenerator.generateLevel6(sentence, context);
        break;
      case 7:
        exercises = await this.sentenceGenerator.generateLevel7(sentence, context);
        break;
      case 8:
        exercises = await this.sentenceGenerator.generateLevel8(sentence, context);
        break;
      case 9:
        exercises = await this.sentenceGenerator.generateLevel9(sentence, context);
        break;
      default:
        return null;
    }
    
    if (exercises.length === 0) {
      return null;
    }
    
    // Return a randomly selected exercise
    return exercises[Math.floor(Math.random() * exercises.length)];
  }


} 