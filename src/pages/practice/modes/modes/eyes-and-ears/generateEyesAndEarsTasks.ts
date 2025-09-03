import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabChooseImageBySound } from '@/pages/practice/tasks/task-vocab-choose-image-by-sound/generateVocabChooseImageBySound';

export async function generateEyesAndEars(
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    // Get both types of vocab with sound and images
    const [dueVocab, unseenVocab] = await Promise.all([
      vocabRepo.getRandomAlreadySeenDueVocab(10, languageCodes, vocabBlockList),
      vocabRepo.getRandomUnseenVocab(10, languageCodes, vocabBlockList)
    ]);

    // Filter to only vocab that has both sound and images
    const dueVocabWithMedia = dueVocab.filter(v => v.hasSound && v.hasImage);
    const unseenVocabWithMedia = unseenVocab.filter(v => v.hasSound && v.hasImage);

    // 70% chance to prefer due vocab (if available), 30% chance for unseen vocab
    const preferDueVocab = Math.random() < 0.7;
    
    if (preferDueVocab && dueVocabWithMedia.length > 0) {
      // Pick a due vocab with sound and images
      const vocab = dueVocabWithMedia[0];
      return generateVocabChooseImageBySound(vocab);
    }
    
    if (unseenVocabWithMedia.length > 0) {
      // Pick an unseen vocab with sound and images
      const vocab = unseenVocabWithMedia[0];
      return generateVocabChooseImageBySound(vocab);
    }
    
    // Fallback: if we wanted unseen but none available, try due vocab
    if (dueVocabWithMedia.length > 0) {
      const vocab = dueVocabWithMedia[0];
      return generateVocabChooseImageBySound(vocab);
    }

    // No vocab available with both sound and images
    return null;
  } catch (error) {
    console.error('Error generating eyes and ears task:', error);
    return null;
  }
}