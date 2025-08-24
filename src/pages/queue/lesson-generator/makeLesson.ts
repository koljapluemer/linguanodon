import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import { shuffleArray } from '@/shared/arrayUtils';
import { DueVocabStrategy } from './flavors/makeLessonAroundDueVocab';
import { NewVocabStrategy } from './flavors/makeLessonAroundNewVocab';
import { RelatedVocabStrategy } from './flavors/makeLessonAroundRelatedVocab';
import { ResourceExtractionStrategy } from './flavors/makeLessonAroundResourceExtraction';
import { RandomImmersionContentStrategy } from './flavors/makeLessonAroundRandomImmersionContent';
import { LowMasteryImmersionContentStrategy } from './flavors/makeLessonAroundLowMasteryImmersionContent';
import { HighMasteryImmersionContentStrategy } from './flavors/makeLessonAroundHighMasteryImmersionContent';
import { GoalBasedStrategy } from './flavors/makeLessonAroundGoals';

export async function makeLesson(
  vocabRepo: VocabRepoContract,
  resourceRepo: ResourceRepoContract,
  taskRepo: TaskRepoContract,
  languageRepo: LanguageRepoContract,
  immersionContentRepo: ImmersionContentRepoContract,
  goalRepo: GoalRepoContract
): Promise<TaskData[]> {
  
  try {
    // Get all active target languages
    const activeLanguages = await languageRepo.getActiveTargetLanguages();
    
    if (activeLanguages.length === 0) {
      console.warn('No active target languages found');
      return [];
    }
    
    const languageCodes = activeLanguages.map(lang => lang.code);
    
    // Create shared dependencies for all strategies
    const dependencies = {
      vocabRepo,
      taskRepo,
      resourceRepo,
      immersionContentRepo,
      goalRepo
    };

    // Define available lesson strategies
    const allStrategies = [
      new DueVocabStrategy(dependencies),
      new NewVocabStrategy(dependencies),
      new RelatedVocabStrategy(dependencies),
      new ResourceExtractionStrategy(dependencies),
      new RandomImmersionContentStrategy(dependencies),
      new LowMasteryImmersionContentStrategy(dependencies),
      new HighMasteryImmersionContentStrategy(dependencies),
      new GoalBasedStrategy(dependencies)
    ];
    
    // Shuffle strategies to try them in random order
    const shuffledStrategies = shuffleArray([...allStrategies]);
    
    // Try each strategy until we get tasks or exhaust all options
    console.log(`[LessonGenerator] Shuffled strategy order:`, shuffledStrategies.map(s => s.constructor.name));
    
    for (const strategy of shuffledStrategies) {
      console.log(`[LessonGenerator] Trying strategy: ${strategy.constructor.name}`);
      try {
        const tasks = await strategy.generateLesson(languageCodes);
        console.log(`[LessonGenerator] ${strategy.constructor.name} returned ${tasks.length} tasks`);
        if (tasks.length > 0) {
          console.log(`[LessonGenerator] Selected strategy: ${strategy.constructor.name} - Generated task types:`, tasks.map(t => t.taskType));
          return tasks;
        }
      } catch (error) {
        console.error(`[LessonGenerator] Error with lesson strategy ${strategy.constructor.name}:`, error);
        // Continue to next strategy
      }
    }
    
    // All strategies tried and no tasks generated
    console.warn('All lesson strategies exhausted, no tasks generated');
    return [];
    
  } catch (error) {
    console.warn('Error generating lesson:', error);
    return [];
  }
}