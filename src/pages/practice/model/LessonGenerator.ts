import type { Lesson } from "./Lesson";
import type { Exercise } from "./Exercise";
import type { WordData, SentenceData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import type { ExerciseGenerationContext } from "./generator/ExerciseGeneratorInterface";
import { ExerciseGeneratorFactory } from "./generator/ExerciseGeneratorFactory";

/**
 * Static class for generating complete lessons with exercises.
 */
export class LessonGenerator {
  /**
   * Generates a complete lesson with 5-20 exercises.
   * Follows the algorithm from the spec:
   * 1. Find special sentence exercise (but don't add it yet)
   * 2. Generate word exercises for sentence words
   * 3. Fill up with additional word exercises
   * 4. Add sentence exercise at the end (if eligible)
   */
  static async generateLesson(
    words: WordData[],
    sentences: SentenceData[],
    progressData: LinguisticUnitProgressData[]
  ): Promise<Lesson> {
    const lessonSize = this.getRandomLessonSize();
    let exercises: Exercise[] = [];

    // Step 1: Try to find a special sentence exercise (but don't add it yet)
    const specialSentence = this.findSpecialSentence(sentences, progressData);
    const context = ExerciseGeneratorFactory.createContext();
    const sentenceExercise = specialSentence 
      ? await ExerciseGeneratorFactory.generateSentenceExercise(specialSentence, 0, context)
      : null;

    // Step 2: Generate word exercises for sentence words
    if (specialSentence) {
      const sentenceWordExercises = await this.generateWordExercisesForSentence(
        specialSentence, 
        words, 
        progressData,
        context
      );
      exercises.push(...sentenceWordExercises);
    }

    // Step 3: Fill up the lesson with additional word exercises
    // Reserve 1 slot for sentence exercise if we have one
    const targetWordExercises = sentenceExercise ? lessonSize - 1 : lessonSize;
    const remainingSlots = targetWordExercises - exercises.length;
    
    if (remainingSlots > 0) {
      const additionalExercises = await this.generateAdditionalExercises(
        words, 
        progressData, 
        remainingSlots,
        context
      );
      exercises.push(...additionalExercises);
    }

    // Step 4: Shuffle word exercises (but keep sentence exercise at the end)
    if (sentenceExercise) {
      // Separate word exercises from sentence exercise
      const wordExercises = exercises;
      const shuffledWordExercises = this.shuffleArray(wordExercises);
      
      // Add sentence exercise at the end
      shuffledWordExercises.push(sentenceExercise);
      exercises = shuffledWordExercises;
    } else {
      // No sentence exercise, just shuffle all word exercises
      exercises = this.shuffleArray(exercises);
    }

    return {
      id: `lesson-${Date.now()}`,
      exercises,
      currentExerciseIndex: 0,
      isCompleted: false,
      createdAt: new Date()
    };
  }

  /**
   * Gets a random lesson size between 5 and 20.
   */
  private static getRandomLessonSize(): number {
    return Math.floor(Math.random() * 16) + 5; // 5 to 20
  }

  /**
   * Finds a sentence eligible for a special exercise.
   * Prioritizes sentences that haven't been seen before.
   */
  private static findSpecialSentence(
    sentences: SentenceData[], 
    progressData: LinguisticUnitProgressData[]
  ): SentenceData | null {
    if (sentences.length === 0) return null;

    // First, try to find sentences that haven't been seen before
    const unseenSentences = sentences.filter(sentence => 
      !progressData.some(p => 
        p.language === sentence.language && 
        p.content === sentence.content && 
        p.type === 'sentence'
      )
    );

    if (unseenSentences.length > 0) {
      return unseenSentences[Math.floor(Math.random() * unseenSentences.length)];
    }

    // If all sentences have been seen, pick a random one
    return sentences[Math.floor(Math.random() * sentences.length)];
  }

  /**
   * Generates word exercises for words contained in a sentence.
   */
  private static async generateWordExercisesForSentence(
    sentence: SentenceData,
    words: WordData[],
    progressData: LinguisticUnitProgressData[],
    context: ExerciseGenerationContext
  ): Promise<Exercise[]> {
    const exercises: Exercise[] = [];
    
    // Find words that appear in this sentence
    const sentenceWords = words.filter(word => 
      sentence.content.toLowerCase().includes(word.content.toLowerCase())
    );

    // Generate one exercise per sentence word
    for (const word of sentenceWords) {
      const exercise = await this.generateExerciseForWord(word, words, progressData, context);
      if (exercise) {
        exercises.push(exercise);
      }
    }

    return exercises;
  }

  /**
   * Generates an appropriate exercise for a word based on its progress.
   */
  private static async generateExerciseForWord(
    word: WordData,
    allWords: WordData[],
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
   * Gets distractor words for multiple choice exercises.
   */
  private static getDistractorWords(
    targetWord: WordData,
    allWords: WordData[],
    count: number
  ): WordData[] {
    const distractors = allWords.filter(word => 
      word.content !== targetWord.content && 
      word.language === targetWord.language
    );
    
    // Shuffle and take the requested number
    return this.shuffleArray(distractors).slice(0, count);
  }

  /**
   * Generates additional exercises to fill up the lesson.
   */
  private static async generateAdditionalExercises(
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
   * Shuffles an array in place.
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
