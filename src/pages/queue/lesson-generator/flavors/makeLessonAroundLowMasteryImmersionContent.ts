import type { TaskData } from '@/entities/tasks/Task';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomBetween, randomFromArray } from '@/shared/arrayUtils';
import { calculateVocabMastery } from '@/entities/vocab/vocabMastery';
import { getRandomGeneratedTaskForVocab } from '../utils/getRandomGeneratedTaskForVocab';

const MIN_UNSEEN_VOCAB = 1;
const MAX_UNSEEN_VOCAB = 3;
const LOW_MASTERY_THRESHOLD = 20;

export class LowMasteryImmersionContentStrategy extends BaseLessonStrategy {
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
      if (!languages.includes(content.language) || content.neededVocab.length === 0) {
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
      
      if (averageMastery < LOW_MASTERY_THRESHOLD) {
        eligibleContent.push(content);
      }
    }
    
    if (eligibleContent.length === 0) {
      console.warn('No low mastery immersion content available without tasks for languages:', languages);
      return [];
    }
    
    const selectedContent = randomFromArray(eligibleContent);
    if (!selectedContent) {
      console.warn('Failed to select low mastery immersion content');
      return [];
    }
    
    console.log('Selected low mastery immersion content:', selectedContent.title, selectedContent.uid);
    
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
        
        const task = await getRandomGeneratedTaskForVocab(vocab);
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
        
        const task = await getRandomGeneratedTaskForVocab(vocab);
        if (task) {
          tasks.push(task);
          usedVocabIds.add(vocab.uid);
        }
      }
    }
    
    console.log(`Generated ${tasks.length} core tasks based on low mastery immersion content: ${selectedContent.title}`);
    return tasks;
  }
}