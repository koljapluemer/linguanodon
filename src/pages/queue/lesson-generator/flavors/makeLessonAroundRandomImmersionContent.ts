import type { Task } from '@/entities/tasks/Task';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomBetween, randomFromArray } from '@/shared/arrayUtils';
import { getRandomGeneratedTaskForVocab } from '../utils/getRandomGeneratedTaskForVocab';

const MIN_UNSEEN_VOCAB = 1;
const MAX_UNSEEN_VOCAB = 3;

export class RandomImmersionContentStrategy extends BaseLessonStrategy {
  constructor(dependencies: LessonStrategyDependencies) {
    super(dependencies);
  }

  protected async generateCoreTasks(
    languages: string[], 
    targetTaskCount: number
  ): Promise<Task[]> {
    const tasks: Task[] = [];
    const usedVocabIds = new Set<string>();
    
    // Find random immersion content where no tasks are attached
    const allImmersionContent = await this.immersionContentRepo.getAllImmersionContent();
    const availableContent = allImmersionContent.filter(content => 
      languages.includes(content.language)
    );
    
    if (availableContent.length === 0) {
      console.warn('No immersion content available without tasks for languages:', languages);
      return [];
    }
    
    const selectedContent = randomFromArray(availableContent);
    if (!selectedContent) {
      console.warn('Failed to select random immersion content');
      return [];
    }
    
    console.log('Selected immersion content:', selectedContent.title, selectedContent.uid);
    
    // Get all needed vocab items
    const neededVocab = await Promise.all(
      selectedContent.neededVocab.map(id => this.vocabRepo.getVocabByUID(id))
    );
    const validNeededVocab = neededVocab.filter(vocab => vocab !== undefined);
    
    // Separate unseen and seen vocab
    const unseenVocab = validNeededVocab.filter(vocab => vocab.progress.level <= 0);
    const seenVocab = validNeededVocab.filter(vocab => 
      vocab.progress.level > 0 && vocab.progress.due <= new Date() && !vocab.doNotPractice
    );
    
    // 1. Add unseen vocab tasks (1-3)
    if (unseenVocab.length > 0) {
      const unseenCount = randomBetween(MIN_UNSEEN_VOCAB, Math.min(MAX_UNSEEN_VOCAB, unseenVocab.length));
      for (const vocab of unseenVocab) {
        if (tasks.length >= unseenCount || usedVocabIds.has(vocab.uid)) continue;
        
        const task = await getRandomGeneratedTaskForVocab(vocab);
        if (task) {
          tasks.push(task);
          usedVocabIds.add(vocab.uid);
        }
      }
    }
    
    // 2. Add due seen vocab from needed vocab
    if (tasks.length < targetTaskCount && seenVocab.length > 0) {
      for (const vocab of seenVocab) {
        if (tasks.length >= targetTaskCount || usedVocabIds.has(vocab.uid)) continue;
        
        const task = await getRandomGeneratedTaskForVocab(vocab);
        if (task) {
          tasks.push(task);
          usedVocabIds.add(vocab.uid);
        }
      }
    }
    
    console.log(`Generated ${tasks.length} core tasks based on immersion content: ${selectedContent.title}`);
    return tasks;
  }
}