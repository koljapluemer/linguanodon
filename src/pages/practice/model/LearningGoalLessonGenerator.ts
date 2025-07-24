import type { Lesson } from "./Lesson";
import type { Exercise, MilestoneExercise } from "./Exercise";
import type { WordData, SentenceData } from "@/entities/linguisticUnits";
import type { LearningGoalData } from "@/entities/learning-goals";
import { ExerciseGeneratorFactory } from "./generator/ExerciseGeneratorFactory";

/**
 * Generates a lesson based on a learning goal, mixing words/sentences and adding a milestone exercise.
 */
export class LearningGoalLessonGenerator {
  /**
   * Generate a lesson from a learning goal.
   */
  static async generateLesson(
    learningGoal: LearningGoalData,
    words: WordData[],
    sentences: SentenceData[]
  ): Promise<Lesson> {
    const lessonSize = LearningGoalLessonGenerator.getRandomLessonSize();
    let exercises: Exercise[] = [];

    // Step 1: Pick random associated units (words/sentences)
    const allUnits = learningGoal.associatedUnits;
    const shuffledUnits = LearningGoalLessonGenerator.shuffleArray(allUnits);
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

    // Step 3: Add a MilestoneExercise at the end (random milestone)
    if (learningGoal.milestones.length > 0) {
      const randomMilestone = learningGoal.milestones[Math.floor(Math.random() * learningGoal.milestones.length)];
      const milestoneExercise: MilestoneExercise = {
        id: `milestone-exercise-${Date.now()}`,
        type: 'milestone',
        level: 0,
        linguisticUnit: {
          language: learningGoal.language,
          content: learningGoal.title,
          type: 'sentence'
        },
        isRepeatable: false,
        prompt: `Reflect on this milestone:`,
        milestoneContent: randomMilestone.content
      };
      exercises.push(milestoneExercise);
    }

    // Step 4: Shuffle all exercises
    exercises = LearningGoalLessonGenerator.shuffleArray(exercises);

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