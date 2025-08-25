import type { TaskData } from '@/entities/tasks/Task';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomBetween } from '@/shared/arrayUtils';
import { getRandomGeneratedTaskForVocab } from '../utils/getRandomGeneratedTaskForVocab';

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
    console.log(`[NewVocabStrategy] Requesting ${newVocabCount} unseen vocab items`);
    console.log(`[NewVocabStrategy] Calling vocabRepo.getRandomUnseenVocabInLanguages(${languages.join(', ')}, ${newVocabCount})`);
    
    const newVocab = await this.vocabRepo.getRandomUnseenVocabInLanguages(languages, newVocabCount);
    console.log(`[NewVocabStrategy] Found ${newVocab.length} unseen vocab items:`, newVocab.map(v => `${v.content} (${v.uid.slice(0, 8)})`));
    
    for (const vocab of newVocab) {
      if (tasks.length >= newVocabCount || usedVocabIds.has(vocab.uid)) continue;
      
      const task = await getRandomGeneratedTaskForVocab(vocab);
      if (task) {
        console.log(`[NewVocabStrategy] Generated task ${task.taskType} for new vocab: ${vocab.content}`);
        tasks.push(task);
        usedVocabIds.add(vocab.uid);
      }
    }
    
    console.log(`[NewVocabStrategy] Total core tasks generated: ${tasks.length}`);
    return tasks;
  }
}

