import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import { generateVocabChooseImageBySound } from '@/pages/practice/tasks/task-vocab-choose-image-by-sound/generate';

export async function getRandomVocabChooseImageBySoundTask({
  vocabRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo) return null;
  
  try {
    // 70% chance to prefer due vocab (if available), 30% chance for unseen vocab
    const preferDueVocab = Math.random() < 0.7;
    
    if (preferDueVocab) {
      // Try to get a due vocab with sound and images
      const dueVocab = await vocabRepo.getRandomDueVocabWithSoundAndImages(languageCodes);
      if (dueVocab) {
        return generateVocabChooseImageBySound(dueVocab);
      }
    }
    
    // Try to get an unseen vocab with sound and images
    const unseenVocab = await vocabRepo.getRandomUnseenVocabWithSoundAndImages(languageCodes);
    if (unseenVocab) {
      return generateVocabChooseImageBySound(unseenVocab);
    }
    
    // Fallback: if we wanted unseen but none available, try due vocab
    if (!preferDueVocab) {
      const dueVocab = await vocabRepo.getRandomDueVocabWithSoundAndImages(languageCodes);
      if (dueVocab) {
        return generateVocabChooseImageBySound(dueVocab);
      }
    }

    // No vocab available with both sound and images
    return null;
  } catch (error) {
    console.error('Error generating vocab choose image by sound task:', error);
    return null;
  }
}