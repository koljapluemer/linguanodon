import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import { generateAddImageToVocab } from '@/pages/practice/tasks/task-add-image-to-vocab/generate';

export async function getRandomAddImageToVocabTask({
  vocabRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo) return null;
  
  try {
    // Get vocab that needs images
    const vocabWithoutImages = await vocabRepo.getVocabNeedingImages(languageCodes);
    
    if (vocabWithoutImages.length === 0) return null;
    
    // Return task for first vocab item
    return generateAddImageToVocab(vocabWithoutImages[0]);
  } catch (error) {
    console.error('Error generating add image to vocab task:', error);
    return null;
  }
}