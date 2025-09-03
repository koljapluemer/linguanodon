import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateVocabChooseImageBySound } from '@/pages/practice/tasks/task-vocab-choose-image-by-sound/generateVocabChooseImageBySound';

export async function generateEyesAndEars(
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[]
): Promise<Task | null> {
  try {
    console.log('🔍 DEBUG: generateEyesAndEars called with languages:', languageCodes, 'blockList:', vocabBlockList);
    
    // 70% chance to prefer due vocab (if available), 30% chance for unseen vocab
    const preferDueVocab = Math.random() < 0.7;
    console.log('🔍 DEBUG: preferDueVocab:', preferDueVocab);
    
    if (preferDueVocab) {
      console.log('🔍 DEBUG: Trying to get due vocab with sound and images...');
      // Try to get a due vocab with sound and images
      const dueVocab = await vocabRepo.getRandomDueVocabWithSoundAndImages(languageCodes, vocabBlockList);
      console.log('🔍 DEBUG: dueVocab result:', dueVocab ? `Found vocab: ${dueVocab.uid} (${dueVocab.content})` : 'No due vocab found');
      if (dueVocab) {
        return generateVocabChooseImageBySound(dueVocab);
      }
    }
    
    console.log('🔍 DEBUG: Trying to get unseen vocab with sound and images...');
    // Try to get an unseen vocab with sound and images
    const unseenVocab = await vocabRepo.getRandomUnseenVocabWithSoundAndImages(languageCodes, vocabBlockList);
    console.log('🔍 DEBUG: unseenVocab result:', unseenVocab ? `Found vocab: ${unseenVocab.uid} (${unseenVocab.content})` : 'No unseen vocab found');
    if (unseenVocab) {
      return generateVocabChooseImageBySound(unseenVocab);
    }
    
    // Fallback: if we wanted unseen but none available, try due vocab
    if (!preferDueVocab) {
      console.log('🔍 DEBUG: Fallback - trying to get due vocab with sound and images...');
      const dueVocab = await vocabRepo.getRandomDueVocabWithSoundAndImages(languageCodes, vocabBlockList);
      console.log('🔍 DEBUG: fallback dueVocab result:', dueVocab ? `Found vocab: ${dueVocab.uid} (${dueVocab.content})` : 'No due vocab found');
      if (dueVocab) {
        return generateVocabChooseImageBySound(dueVocab);
      }
    }

    // No vocab available with both sound and images
    console.log('🔍 DEBUG: No vocab available with both sound and images');
    return null;
  } catch (error) {
    console.error('Error generating eyes and ears task:', error);
    return null;
  }
}