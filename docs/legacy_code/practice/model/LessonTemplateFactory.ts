import type { Lesson } from "./Lesson";
import type { WordData, SentenceData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import type { ResourceRepository } from "@/entities/resources";
import { ResourceBasedLessonGenerator } from "./ResourceBasedLessonGenerator";
import { MissingTranslationLessonGenerator } from "./MissingTranslationLessonGenerator";
import { FreeTranslateNewSentenceLessonGenerator } from "@/pages/practice/model/FreeTranslateNewSentenceLessonGenerator";
import { LearningGoalLessonGenerator } from './LearningGoalLessonGenerator';
import { learningGoalService } from '@/entities/learning-goals';
import { ImmersionContentLessonGenerator } from './ImmersionContentLessonGenerator';
import { immersionContentService } from '@/entities/immersion-content';

/**
 * Factory for generating lessons using different templates.
 * Randomly chooses between standard lessons, resource-based lessons, and missing translation lessons.
 */
export class LessonTemplateFactory {
  /**
   * Generate a lesson using a randomly selected template.
   * 33% chance for each template type.
   */
  static async generateLesson(
    words: WordData[],
    sentences: SentenceData[],
    progressData: LinguisticUnitProgressData[],
    resourceRepository: ResourceRepository
  ): Promise<Lesson> {
    // Randomly choose between five templates
    const random = Math.random();
    if (random < 0.2) {
      return FreeTranslateNewSentenceLessonGenerator.generateLesson(words, sentences, progressData);
    } else if (random < 0.4) {
      return ResourceBasedLessonGenerator.generateLesson(words, sentences, progressData, resourceRepository);
    } else if (random < 0.6) {
      // Try to get a random learning goal
      const learningGoal = await learningGoalService.getRandom();
      if (learningGoal) {
        return LearningGoalLessonGenerator.generateLesson(learningGoal, words, sentences, progressData);
      } else {
        // Fallback to missing translation
        return MissingTranslationLessonGenerator.generateLesson(words, sentences, progressData);
      }
    } else if (random < 0.8) {
      // Try to get a random immersion content
      const immersionContent = await immersionContentService.getRandom();
      if (immersionContent) {
        return ImmersionContentLessonGenerator.generateLesson(immersionContent, words, sentences);
      } else {
        // Fallback to missing translation
        return MissingTranslationLessonGenerator.generateLesson(words, sentences, progressData);
      }
    } else {
      return MissingTranslationLessonGenerator.generateLesson(words, sentences, progressData);
    }
  }
} 