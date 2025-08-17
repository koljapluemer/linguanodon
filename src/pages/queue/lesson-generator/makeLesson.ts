import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import { shuffleArray } from '@/shared/arrayUtils';
import { makeLessonAroundDueVocab } from './flavors/makeLessonAroundDueVocab';
import { makeLessonAroundNewVocab } from './flavors/makeLessonAroundNewVocab';
import { makeLessonAroundResourceExtraction } from './flavors/makeLessonAroundResourceExtraction';

export async function makeLesson(
  vocabRepo: VocabAndTranslationRepoContract,
  resourceRepo: ResourceRepoContract,
  taskRepo: TaskRepoContract,
  languageRepo: LanguageRepoContract
): Promise<TaskData[]> {
  
  try {
    // Get all active target languages
    const activeLanguages = await languageRepo.getActiveTargetLanguages();
    
    if (activeLanguages.length === 0) {
      console.warn('No active target languages found');
      return [];
    }
    
    const languageCodes = activeLanguages.map(lang => lang.code);
    
    // Define available lesson flavors
    const allFlavors = [
      () => makeLessonAroundDueVocab(vocabRepo, taskRepo, languageCodes),
      () => makeLessonAroundNewVocab(vocabRepo, taskRepo, languageCodes), 
      () => makeLessonAroundResourceExtraction(vocabRepo, resourceRepo, taskRepo, languageCodes)
    ];
    
    // Shuffle flavors to try them in random order
    const shuffledFlavors = shuffleArray([...allFlavors]);
    
    // Try each flavor until we get tasks or exhaust all options
    for (const flavor of shuffledFlavors) {
      try {
        const tasks = await flavor();
        if (tasks.length > 0) {
          return tasks;
        }
      } catch (error) {
        console.warn('Error with lesson flavor:', error);
        // Continue to next flavor
      }
    }
    
    // All flavors tried and no tasks generated
    console.warn('All lesson flavors exhausted, no tasks generated');
    return [];
    
  } catch (error) {
    console.warn('Error generating lesson:', error);
    return [];
  }
}