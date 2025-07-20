import type { Lesson } from "./Lesson";
import type { Exercise } from "./Exercise";
import type { WordData, SentenceData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import type { ExerciseGenerationContext } from "./generator/ExerciseGeneratorInterface";
import { ExerciseGeneratorFactory } from "./generator/ExerciseGeneratorFactory";
import { MissingTranslationExerciseGenerator } from "./generator/MissingTranslationExerciseGenerator";

/**
 * Static class for generating missing translation lessons with exercises.
 * Includes 1-3 missing translation exercises plus standard exercises.
 */
export class MissingTranslationLessonGenerator {
  
  /**
   * Generates a lesson with 1-3 missing translation exercises plus standard exercises.
   */
  static async generateLesson(
    words: WordData[],
    sentences: SentenceData[],
    progressData: LinguisticUnitProgressData[]
  ): Promise<Lesson> {
    const lessonSize = this.getRandomLessonSize();
    let exercises: Exercise[] = [];

    // Step 1: Generate missing translation exercises
    const context = await ExerciseGeneratorFactory.createContext();
    const missingTranslationExercises = await MissingTranslationExerciseGenerator.findMissingTranslationExercises(context);
    
    // Take 1-3 missing translation exercises
    const numMissingExercises = Math.min(
      Math.floor(Math.random() * 3) + 1, // 1-3
      missingTranslationExercises.length
    );
    
    const selectedMissingExercises = this.shuffleArray(missingTranslationExercises)
      .slice(0, numMissingExercises);
    
    exercises.push(...selectedMissingExercises);

    // Step 2: Fill up with standard exercises
    const remainingSlots = lessonSize - exercises.length;
    
    if (remainingSlots > 0) {
      const standardExercises = await this.generateStandardExercises(
        words, 
        progressData, 
        remainingSlots,
        context
      );
      exercises.push(...standardExercises);
    }

    // Step 3: Shuffle all exercises
    exercises = this.shuffleArray(exercises);

    return {
      id: `lesson-${Date.now()}`,
      exercises,
      currentExerciseIndex: 0,
      isCompleted: false,
      createdAt: new Date()
    };
  }

  /**
   * Generate standard exercises to fill up the lesson.
   */
  private static async generateStandardExercises(
    words: WordData[],
    progressData: LinguisticUnitProgressData[],
    count: number,
    context: ExerciseGenerationContext
  ): Promise<Exercise[]> {
    const exercises: Exercise[] = [];
    const availableWords = [...words];

    for (let i = 0; i < count && availableWords.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const word = availableWords[randomIndex];
      
      const exercise = await this.generateExerciseForWord(word, words, progressData, context);
      if (exercise) {
        exercises.push(exercise);
      }
      
      // Remove this word to avoid duplicates
      availableWords.splice(randomIndex, 1);
    }

    return exercises;
  }

  /**
   * Generates an appropriate exercise for a word based on its progress.
   */
  private static async generateExerciseForWord(
    word: WordData,
    _allWords: WordData[],
    progressData: LinguisticUnitProgressData[],
    context: ExerciseGenerationContext
  ): Promise<Exercise | null> {
    // Find word progress
    const wordProgress = progressData.find(p => 
      p.language === word.language && 
      p.content === word.content && 
      p.type === 'word'
    );

    // Determine appropriate level based on progress
    let targetLevel = 0;
    if (wordProgress) {
      const cardCount = Object.keys(wordProgress.cards).length;
      if (cardCount >= 2) {
        targetLevel = 2;
      } else if (cardCount >= 1) {
        targetLevel = 1;
      }
    }
    
    // Generate exercise based on target level
    if (targetLevel === 0) {
      const exercise = await ExerciseGeneratorFactory.generateWordExercise(word, 0, context);
      if (exercise) return exercise;
    }
    
    if (targetLevel === 1) {
      const exercise = await ExerciseGeneratorFactory.generateWordExercise(word, 1, context);
      if (exercise) return exercise;
    }
    
    if (targetLevel === 2) {
      const exercise = await ExerciseGeneratorFactory.generateWordExercise(word, 2, context);
      if (exercise) return exercise;
    }

    // Fallback to level 0 if higher levels can't be generated
    const fallbackExercise = await ExerciseGeneratorFactory.generateWordExercise(word, 0, context);
    if (fallbackExercise) return fallbackExercise;

    return null;
  }

  /**
   * Gets a random lesson size between 5 and 20.
   */
  private static getRandomLessonSize(): number {
    return Math.floor(Math.random() * 16) + 5; // 5-20
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm.
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 