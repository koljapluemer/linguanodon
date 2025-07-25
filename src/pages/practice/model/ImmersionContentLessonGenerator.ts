import type { Lesson } from "./Lesson";
import type { Exercise } from "./Exercise";
import type { WordData, SentenceData } from "@/entities/linguisticUnits";
import type { ImmersionContentData } from "@/entities/immersion-content";
import type { ImmersionContentExercise } from "./Exercise";
import { ExerciseGeneratorFactory } from "./generator/ExerciseGeneratorFactory";

/**
 * Generates a lesson based on immersion content, using associated units and a final extraction/rating task.
 */
export class ImmersionContentLessonGenerator {
  /**
   * Generate a lesson from an immersion content item.
   */
  static async generateLesson(
    immersionContent: ImmersionContentData,
    words: WordData[],
    sentences: SentenceData[]
  ): Promise<Lesson> {
    const lessonSize = ImmersionContentLessonGenerator.getRandomLessonSize();
    let exercises: Exercise[] = [];

    // Step 1: Pick random associated units (words/sentences)
    const allUnits = immersionContent.associatedUnits;
    const shuffledUnits = ImmersionContentLessonGenerator.shuffleArray(allUnits);
    const selectedUnits = shuffledUnits.slice(0, Math.min(lessonSize, shuffledUnits.length));

    // Step 2: Generate standard exercises for selected units
    const context = await ExerciseGeneratorFactory.createContext();
    for (const unit of selectedUnits) {
      if (unit.type === 'word') {
        const word = words.find(w => w.language === unit.language && w.content === unit.content);
        if (word) {
          const ex = await ExerciseGeneratorFactory.generateWordExercise(word, 0, context);
          if (ex) exercises.push(ex);
        }
      } else if (unit.type === 'sentence') {
        const sentence = sentences.find(s => s.language === unit.language && s.content === unit.content);
        if (sentence) {
          const ex = await ExerciseGeneratorFactory.generateSentenceExercise(sentence, 0, context);
          if (ex) exercises.push(ex);
        }
      }
    }

    // Step 3: Add a final immersion content task (rate understanding + extract units)
    const immersionTask: ImmersionContentExercise = {
      id: `immersion-content-task-${Date.now()}`,
      type: 'immersion-content',
      level: 0,
      linguisticUnit: {
        language: immersionContent.language,
        content: immersionContent.title,
        type: 'sentence'
      },
      isRepeatable: false,
      immersionContent,
      prompt: `Watch/read the immersion content, rate your understanding, and extract any new words or sentences.`
    };
    exercises.push(immersionTask);

    // Step 4: Shuffle all exercises
    exercises = ImmersionContentLessonGenerator.shuffleArray(exercises);

    return {
      id: `lesson-${Date.now()}`,
      exercises,
      currentExerciseIndex: 0,
      isCompleted: false,
      createdAt: new Date()
    };
  }

  /**
   * Gets a random lesson size between 5 and 19.
   */
  private static getRandomLessonSize(): number {
    return Math.floor(Math.random() * 15) + 5; // 5 to 19
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