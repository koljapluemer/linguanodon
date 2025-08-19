import type { TaskData } from '@/entities/tasks/TaskData';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomBetween } from '@/shared/arrayUtils';
import { getRandomActiveTaskForVocab } from '../utils/getRandomActiveTaskForVocab';

const MIN_NEW_VOCAB_COUNT = 3;
const MAX_NEW_VOCAB_COUNT = 5;

export class NewVocabStrategy extends BaseLessonStrategy {
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
    
    // Get new (unseen) vocab
    const newVocabCount = randomBetween(MIN_NEW_VOCAB_COUNT, MAX_NEW_VOCAB_COUNT);
    const newVocab = await this.vocabRepo.getRandomUnseenVocabInLanguages(languages, newVocabCount);
    
    for (const vocab of newVocab) {
      if (tasks.length >= newVocabCount || usedVocabIds.has(vocab.uid)) continue;
      
      const task = await getRandomActiveTaskForVocab(this.taskRepo, vocab.uid);
      if (task) {
        tasks.push(task);
        usedVocabIds.add(vocab.uid);
      }
    }
    
    return tasks;
  }
}

