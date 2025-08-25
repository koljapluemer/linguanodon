import type { TaskData } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomBetween, pickRandom } from '@/shared/arrayUtils';
import { getRandomGeneratedTaskForVocab } from '../utils/getRandomGeneratedTaskForVocab';

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
    console.log(`[RelatedVocabStrategy] Looking for due vocab with related items in languages: ${languages.join(', ')}`);
    const baseVocab = await this.getDueVocabWithRelatedItems(languages);
    if (!baseVocab) {
      console.log(`[RelatedVocabStrategy] No due vocab with related items found`);
      return [];
    }
    
    console.log(`[RelatedVocabStrategy] Selected base vocab: ${baseVocab.content} (${baseVocab.uid.slice(0, 8)}) with ${baseVocab.relatedVocab?.length || 0} related items`);
    
    // Add task for the base vocab
    const baseTask = await getRandomGeneratedTaskForVocab(baseVocab);
    if (baseTask) {
      console.log(`[RelatedVocabStrategy] Generated task ${baseTask.taskType} for base vocab: ${baseVocab.content}`);
      tasks.push(baseTask);
      usedVocabIds.add(baseVocab.uid);
    }
    
    // Get all related vocab that is due or new
    const relatedVocabItems = await this.getRelatedDueOrNewVocab(baseVocab, languages);
    console.log(`[RelatedVocabStrategy] Found ${relatedVocabItems.length} related due/new vocab items:`, relatedVocabItems.map(v => `${v.content} (${v.uid.slice(0, 8)})`));
    
    // Determine how many related vocab to include
    const targetRelatedCount = randomBetween(
      Math.min(MIN_RELATED_VOCAB_COUNT, relatedVocabItems.length),
      Math.min(MAX_RELATED_VOCAB_COUNT, relatedVocabItems.length)
    );
    console.log(`[RelatedVocabStrategy] Target related vocab count: ${targetRelatedCount}`);
    
    const selectedRelatedVocab = pickRandom(relatedVocabItems, targetRelatedCount);
    console.log(`[RelatedVocabStrategy] Selected related vocab:`, selectedRelatedVocab.map(v => `${v.content} (${v.uid.slice(0, 8)})`));
    
    // Add tasks for each selected related vocab
    for (const vocab of selectedRelatedVocab) {
      if (usedVocabIds.has(vocab.uid)) continue;
      
      const task = await getRandomGeneratedTaskForVocab(vocab);
      if (task) {
        console.log(`[RelatedVocabStrategy] Generated task ${task.taskType} for related vocab: ${vocab.content}`);
        tasks.push(task);
        usedVocabIds.add(vocab.uid);
      }
    }
    
    console.log(`[RelatedVocabStrategy] Total core tasks generated: ${tasks.length}`);
    return tasks;
  }

  private async getDueVocabWithRelatedItems(languages: string[]): Promise<VocabData | null> {
    try {
      // Get all due vocab in the specified languages
      console.log(`[RelatedVocabStrategy] Calling vocabRepo.getDueVocabInLanguages(${languages.join(', ')})`);
      const dueVocab = await this.vocabRepo.getDueVocabInLanguages(languages);
      console.log(`[RelatedVocabStrategy] Found ${dueVocab.length} due vocab items`);
      
      // Filter to only vocab that has related vocabulary items
      const vocabWithRelatedItems = dueVocab.filter(vocab => 
        vocab.relatedVocab && vocab.relatedVocab.length > 0
      );
      console.log(`[RelatedVocabStrategy] ${vocabWithRelatedItems.length} due vocab items have related vocabulary`);
      
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
      console.log(`[RelatedVocabStrategy] Calling vocabRepo.getVocabByUIDs for ${baseVocab.relatedVocab.length} related vocab IDs`);
      const relatedVocabItems = await this.vocabRepo.getVocabByUIDs(baseVocab.relatedVocab);
      console.log(`[RelatedVocabStrategy] Retrieved ${relatedVocabItems.length} related vocab items`);
      
      // Filter to only those in the target languages
      const languageFilteredVocab = relatedVocabItems.filter(vocab => 
        languages.includes(vocab.language)
      );
      console.log(`[RelatedVocabStrategy] ${languageFilteredVocab.length} related vocab items match target languages`);
      
      // Get due or unseen vocab from the related items
      console.log(`[RelatedVocabStrategy] Calling vocabRepo.getDueOrUnseenVocabFromIds for ${languageFilteredVocab.length} filtered vocab items`);
      const dueOrNewVocab = await this.vocabRepo.getDueOrUnseenVocabFromIds(
        languageFilteredVocab.map(vocab => vocab.uid)
      );
      console.log(`[RelatedVocabStrategy] Found ${dueOrNewVocab.length} due or unseen related vocab items`);
      
      return dueOrNewVocab;
    } catch (error) {
      console.warn('Error getting related due or new vocab:', error);
      return [];
    }
  }
}