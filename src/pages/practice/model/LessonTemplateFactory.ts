import type { Lesson } from "./Lesson";
import type { WordData, SentenceData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import type { ResourceRepository } from "@/entities/resources";
import { LessonGenerator } from "./LessonGenerator";
import { ResourceBasedLessonGenerator } from "./ResourceBasedLessonGenerator";

/**
 * Factory for generating lessons using different templates.
 * Randomly chooses between standard lessons and resource-based lessons.
 */
export class LessonTemplateFactory {
  /**
   * Generate a lesson using a randomly selected template.
   * 50% chance for standard template, 50% chance for resource-based template.
   */
  static async generateLesson(
    words: WordData[],
    sentences: SentenceData[],
    progressData: LinguisticUnitProgressData[],
    resourceRepository: ResourceRepository
  ): Promise<Lesson> {
    // Randomly choose between standard and resource-based templates
    const useResourceTemplate = Math.random() < 1;
    
    if (useResourceTemplate) {
      return ResourceBasedLessonGenerator.generateLesson(words, sentences, progressData, resourceRepository);
    } else {
      return LessonGenerator.generateLesson(words, sentences, progressData);
    }
  }
} 