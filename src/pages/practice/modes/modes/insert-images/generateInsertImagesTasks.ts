import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateAddImageToVocab } from '@/pages/practice/tasks/task-add-image-to-vocab/generate';

export async function generateInsertImagesTask(
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  blockList?: string[]
): Promise<Task | null> {
  try {
    // Get vocab that needs images
    const vocabList = await vocabRepo.getVocabNeedingImages(languageCodes, blockList);
    
    if (vocabList.length === 0) {
      return null;
    }
    
    // Pick the first vocab that needs images
    const vocab = vocabList[0];
    
    // Generate add-image task
    return generateAddImageToVocab(vocab);
    
  } catch (error) {
    console.error('Error generating insert images task:', error);
    return null;
  }
}