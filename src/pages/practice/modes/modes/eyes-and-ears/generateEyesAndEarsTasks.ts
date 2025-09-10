import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import { generateVocabChooseImageBySound } from '@/pages/practice/tasks/task-vocab-choose-image-by-sound/generate';
import { generateRecordSentenceTaskFromTwoVocab, generateRecordSentenceTaskFromSingleVocab } from '@/pages/practice/tasks/task-vocab-form-sentence/generate';
import { randomFromArray, pickRandom } from '@/shared/utils/arrayUtils';

// Helper function to check if vocab has both sound and images
function hasValidSoundAndImages(vocab: VocabData): boolean {
  const hasPlayableSound = vocab.sounds && vocab.sounds.some(sound => !sound.disableForPractice);
  const hasImages = vocab.images && vocab.images.length > 0;
  return !!(hasPlayableSound && hasImages);
}

// Helper function to get vocab with sound and images (custom filtering)
async function getVocabWithSoundAndImages(
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[],
  preferDue: boolean = true
): Promise<VocabData[]> {
  // Get all vocab for the specified languages
  const allVocab = await vocabRepo.getVocab();
  
  return allVocab.filter(vocab => {
    // Must be in target languages
    if (!languageCodes.includes(vocab.language)) return false;
    
    // Must not be in block list
    if (vocabBlockList && vocabBlockList.includes(vocab.uid)) return false;
    
    // Must not be marked as doNotPractice
    if (vocab.doNotPractice) return false;
    
    // Must have sound and images
    if (!hasValidSoundAndImages(vocab)) return false;
    
    // Filter by due status if specified
    if (preferDue) {
      // Due vocab: level >= 0 and due <= now
      return vocab.progress.level >= 0 && vocab.progress.due <= new Date();
    } else {
      // Unseen vocab: level === -1
      return vocab.progress.level === -1;
    }
  });
}

export interface EyesAndEarsOptions {
  includeGenerationExercises?: boolean;
}

export async function generateEyesAndEars(
  vocabRepo: VocabRepoContract,
  languageCodes: string[],
  vocabBlockList?: string[],
  options: EyesAndEarsOptions = {}
): Promise<Task | null> {
  try {
    // Choose task type based on user preferences
    let taskType: 'choose-image' | 'form-sentence';
    
    if (options.includeGenerationExercises === false) {
      // Recall exercises only - always choose image by sound
      taskType = 'choose-image';
    } else {
      // Include generation exercises - randomly choose: 60% choose image by sound, 40% form sentence
      taskType = Math.random() < 0.6 ? 'choose-image' : 'form-sentence';
    }
    
    if (taskType === 'choose-image') {
      // Original choose-image-by-sound task
      // 70% chance to prefer due vocab (if available), 30% chance for unseen vocab
      const preferDueVocab = Math.random() < 0.7;
      
      if (preferDueVocab) {
        // Try to get a due vocab with sound and images
        const dueVocab = await vocabRepo.getRandomDueVocabWithSoundAndImages(languageCodes, vocabBlockList);
        if (dueVocab) {
          return generateVocabChooseImageBySound(dueVocab);
        }
      }
      
      // Try to get an unseen vocab with sound and images
      const unseenVocab = await vocabRepo.getRandomUnseenVocabWithSoundAndImages(languageCodes, vocabBlockList);
      if (unseenVocab) {
        return generateVocabChooseImageBySound(unseenVocab);
      }
      
      // Fallback: if we wanted unseen but none available, try due vocab
      if (!preferDueVocab) {
        const dueVocab = await vocabRepo.getRandomDueVocabWithSoundAndImages(languageCodes, vocabBlockList);
        if (dueVocab) {
          return generateVocabChooseImageBySound(dueVocab);
        }
      }
      
      console.warn('Eyes and Ears: No vocab found with both sound and images for choose-image task', {
        languageCodes,
        vocabBlockListSize: vocabBlockList?.length || 0
      });
    } else {
      // Form sentence task with vocab that has sound and images
      // 70% chance to prefer due vocab, 30% unseen
      const preferDueVocab = Math.random() < 0.7;
      
      // Get eligible vocab
      let eligibleVocab = await getVocabWithSoundAndImages(vocabRepo, languageCodes, vocabBlockList, preferDueVocab);
      
      // If no vocab available with preferred due status, try the opposite
      if (eligibleVocab.length === 0) {
        eligibleVocab = await getVocabWithSoundAndImages(vocabRepo, languageCodes, vocabBlockList, !preferDueVocab);
      }
      
      if (eligibleVocab.length >= 2) {
        // Try to create a two-vocab sentence task
        // Group by language for better sentence formation
        const languageGroups: { [language: string]: VocabData[] } = {};
        for (const vocab of eligibleVocab) {
          if (!languageGroups[vocab.language]) {
            languageGroups[vocab.language] = [];
          }
          languageGroups[vocab.language].push(vocab);
        }
        
        // Find a language with at least 2 vocab items
        const languagesWithPairs = Object.entries(languageGroups)
          .filter(([, vocabs]) => vocabs.length >= 2);
        
        if (languagesWithPairs.length > 0) {
          const [, vocabsInLanguage] = randomFromArray(languagesWithPairs)!;
          const selectedPair = pickRandom(vocabsInLanguage, 2);
          return generateRecordSentenceTaskFromTwoVocab(selectedPair[0], selectedPair[1]);
        }
      }
      
      if (eligibleVocab.length >= 1) {
        // Create single-vocab record sentence task
        const selectedVocab = randomFromArray(eligibleVocab)!;
        return generateRecordSentenceTaskFromSingleVocab(selectedVocab);
      }
      
      console.warn('Eyes and Ears: No vocab found with both sound and images for form-sentence task', {
        languageCodes,
        vocabBlockListSize: vocabBlockList?.length || 0,
        eligibleVocabCount: eligibleVocab.length
      });
    }

    // No suitable vocab available
    console.warn('Eyes and Ears: No tasks could be generated - no suitable vocab available');
    return null;
  } catch (error) {
    console.error('Error generating eyes and ears task:', error);
    return null;
  }
}