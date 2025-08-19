import type { TaskData } from '@/entities/tasks/TaskData';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomBetween, randomFromArray } from '@/shared/arrayUtils';
import { calculateVocabMastery } from '@/entities/vocab/vocabMastery';
import { getRandomActiveTaskForVocab } from '../utils/getRandomActiveTaskForVocab';

const MIN_UNSEEN_VOCAB = 1;
const MAX_UNSEEN_VOCAB = 3;
const HIGH_MASTERY_MIN_THRESHOLD = 50;
const HIGH_MASTERY_MAX_THRESHOLD = 90;

export class HighMasteryImmersionContentStrategy extends BaseLessonStrategy {
  constructor(dependencies: LessonStrategyDependencies) {
    super(dependencies);
  }

  protected async generateCoreTasks(
    languages: string[], 
    targetTaskCount: number
  ): Promise<TaskData[]> {
    const tasks: TaskData[] = [];
    const usedVocabIds = new Set<string>();
    
    const allImmersionContent = await this.immersionContentRepo.getAllImmersionContent();
    const eligibleContent = [];
    
    for (const content of allImmersionContent) {
      if (!languages.includes(content.language) || content.tasks.length > 0 || content.neededVocab.length === 0) {
        continue;
      }
      
      const neededVocab = await Promise.all(
        content.neededVocab.map(id => this.vocabRepo.getVocabByUID(id))
      );
      const validNeededVocab = neededVocab.filter(vocab => vocab !== undefined);
      
      if (validNeededVocab.length === 0) continue;
      
      const totalMastery = validNeededVocab.reduce((sum, vocab) => {
        return sum + calculateVocabMastery(vocab);
      }, 0);
      const averageMastery = totalMastery / validNeededVocab.length;
      
      if (averageMastery > HIGH_MASTERY_MIN_THRESHOLD && averageMastery < HIGH_MASTERY_MAX_THRESHOLD) {
        eligibleContent.push(content);
      }
    }
    
    if (eligibleContent.length === 0) {
      console.warn('No high mastery immersion content available without tasks for languages:', languages);
      return [];
    }
    
    const selectedContent = randomFromArray(eligibleContent);
    if (!selectedContent) {
      console.warn('Failed to select high mastery immersion content');
      return [];
    }
    
    console.log('Selected high mastery immersion content:', selectedContent.title, selectedContent.uid);
    
    const neededVocab = await Promise.all(
      selectedContent.neededVocab.map(id => this.vocabRepo.getVocabByUID(id))
    );
    const validNeededVocab = neededVocab.filter(vocab => vocab !== undefined);
    
    const unseenVocab = validNeededVocab.filter(vocab => vocab.progress.level <= 0);
    const seenVocab = validNeededVocab.filter(vocab => 
      vocab.progress.level > 0 && vocab.progress.due <= new Date() && !vocab.doNotPractice
    );
    
    // Add unseen vocab tasks (1-3)
    if (unseenVocab.length > 0) {
      const unseenCount = randomBetween(MIN_UNSEEN_VOCAB, Math.min(MAX_UNSEEN_VOCAB, unseenVocab.length));
      for (const vocab of unseenVocab) {
        if (tasks.length >= unseenCount || usedVocabIds.has(vocab.uid)) continue;
        
        const task = await getRandomActiveTaskForVocab(this.taskRepo, vocab.uid);
        if (task) {
          tasks.push(task);
          usedVocabIds.add(vocab.uid);
        }
      }
    }
    
    // Add due seen vocab from needed vocab
    if (tasks.length < targetTaskCount && seenVocab.length > 0) {
      for (const vocab of seenVocab) {
        if (tasks.length >= targetTaskCount || usedVocabIds.has(vocab.uid)) continue;
        
        const task = await getRandomActiveTaskForVocab(this.taskRepo, vocab.uid);
        if (task) {
          tasks.push(task);
          usedVocabIds.add(vocab.uid);
        }
      }
    }
    
    console.log(`Generated ${tasks.length} core tasks based on high mastery immersion content: ${selectedContent.title}`);
    return tasks;
  }
}