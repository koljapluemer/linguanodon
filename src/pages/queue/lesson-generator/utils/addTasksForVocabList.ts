import type { Task } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import { pickRandom } from '@/shared/arrayUtils';
import { getRandomGeneratedTaskForVocab } from './getRandomGeneratedTaskForVocab';

export async function addTasksForVocabList(
  vocabList: VocabData[],
  targetCount: number,
  usedVocabIds: Set<string>,
  tasks: Task[]
): Promise<void> {
  const availableVocab = vocabList.filter(vocab => !usedVocabIds.has(vocab.uid));
  const selectedVocab = pickRandom(availableVocab, Math.min(targetCount, availableVocab.length));
  
  for (const vocab of selectedVocab) {
    if (tasks.length >= targetCount) break;
    
    const task = await getRandomGeneratedTaskForVocab(vocab);
    if (task) {
      tasks.push(task);
      usedVocabIds.add(vocab.uid);
    }
  }
}