import type { Lesson } from "./Lesson";
import type { WordData, SentenceData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import type { ResourceRepository } from "@/entities/resources";
import { LessonGenerator } from "./LessonGenerator";
import { ResourceBasedLessonGenerator } from "./ResourceBasedLessonGenerator";
import { MissingTranslationLessonGenerator } from "./MissingTranslationLessonGenerator";

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
    // Randomly choose between three templates
    const random = Math.random();
    
    return MissingTranslationLessonGenerator.generateLesson(words, sentences, progressData);


    if (random < 0.33) {
      return LessonGenerator.generateLesson(words, sentences, progressData);
    } else if (random < 0.66) {
      return ResourceBasedLessonGenerator.generateLesson(words, sentences, progressData, resourceRepository);
    } else {
      return MissingTranslationLessonGenerator.generateLesson(words, sentences, progressData);
    }
  }
} 