import type { TaskData } from '@/entities/tasks/Task';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { pickRandom } from '@/shared/arrayUtils';
import { getRandomActiveTaskForVocab } from './getRandomActiveTaskForVocab';

export async function addTasksForVocabList(
  taskRepo: TaskRepoContract,
  vocabList: Array<{ uid: string }>,
  targetCount: number,
  usedVocabIds: Set<string>,
  tasks: TaskData[]
): Promise<void> {
  const availableVocab = vocabList.filter(vocab => !usedVocabIds.has(vocab.uid));
  const selectedVocab = pickRandom(availableVocab, Math.min(targetCount, availableVocab.length));
  
  for (const vocab of selectedVocab) {
    if (tasks.length >= targetCount) break;
    
    const task = await getRandomActiveTaskForVocab(taskRepo, vocab.uid);
    if (task) {
      tasks.push(task);
      usedVocabIds.add(vocab.uid);
    }
  }
}