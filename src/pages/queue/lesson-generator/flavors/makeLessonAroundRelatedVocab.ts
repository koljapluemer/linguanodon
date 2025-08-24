import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomBetween, pickRandom } from '@/shared/arrayUtils';
import { getRandomActiveTaskForVocab } from '../utils/getRandomActiveTaskForVocab';

const MIN_RELATED_VOCAB_COUNT = 3;
const MAX_RELATED_VOCAB_COUNT = 8;

export class RelatedVocabStrategy extends BaseLessonStrategy {
  constructor(dependencies: LessonStrategyDependencies) {
    super(dependencies);
  }

  protected async generateCoreTasks(
    languages: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _targetTaskCount: number
  ): Promise<TaskData[]> {
    const tasks: TaskData[] = [];
    const usedVocabIds = new Set<string>();
    
    // Get a due vocab that has related vocabulary items
    const baseVocab = await this.getDueVocabWithRelatedItems(languages);
    if (!baseVocab) {
      return [];
    }
    
    // Add task for the base vocab
    const baseTask = await getRandomActiveTaskForVocab(this.taskRepo, baseVocab.uid);
    if (baseTask) {
      tasks.push(baseTask);
      usedVocabIds.add(baseVocab.uid);
    }
    
    // Get all related vocab that is due or new
    const relatedVocabItems = await this.getRelatedDueOrNewVocab(baseVocab, languages);
    
    // Determine how many related vocab to include
    const targetRelatedCount = randomBetween(
      Math.min(MIN_RELATED_VOCAB_COUNT, relatedVocabItems.length),
      Math.min(MAX_RELATED_VOCAB_COUNT, relatedVocabItems.length)
    );
    
    const selectedRelatedVocab = pickRandom(relatedVocabItems, targetRelatedCount);
    
    // Add tasks for each selected related vocab
    for (const vocab of selectedRelatedVocab) {
      if (usedVocabIds.has(vocab.uid)) continue;
      
      const task = await getRandomActiveTaskForVocab(this.taskRepo, vocab.uid);
      if (task) {
        tasks.push(task);
        usedVocabIds.add(vocab.uid);
      }
    }
    
    return tasks;
  }

  private async getDueVocabWithRelatedItems(languages: string[]): Promise<VocabData | null> {
    try {
      // Get all due vocab in the specified languages
      const dueVocab = await this.vocabRepo.getDueVocabInLanguages(languages);
      
      // Filter to only vocab that has related vocabulary items
      const vocabWithRelatedItems = dueVocab.filter(vocab => 
        vocab.relatedVocab && vocab.relatedVocab.length > 0
      );
      
      if (vocabWithRelatedItems.length === 0) {
        return null;
      }
      
      // Pick a random vocab from those with related items
      return pickRandom(vocabWithRelatedItems, 1)[0] || null;
    } catch (error) {
      console.warn('Error getting due vocab with related items:', error);
      return null;
    }
  }

  private async getRelatedDueOrNewVocab(baseVocab: VocabData, languages: string[]): Promise<VocabData[]> {
    if (!baseVocab.relatedVocab || baseVocab.relatedVocab.length === 0) {
      return [];
    }
    
    try {
      // Get all related vocab items
      const relatedVocabItems = await this.vocabRepo.getVocabByUIDs(baseVocab.relatedVocab);
      
      // Filter to only those in the target languages
      const languageFilteredVocab = relatedVocabItems.filter(vocab => 
        languages.includes(vocab.language)
      );
      
      // Get due or unseen vocab from the related items
      const dueOrNewVocab = await this.vocabRepo.getDueOrUnseenVocabFromIds(
        languageFilteredVocab.map(vocab => vocab.uid)
      );
      
      return dueOrNewVocab;
    } catch (error) {
      console.warn('Error getting related due or new vocab:', error);
      return [];
    }
  }
}