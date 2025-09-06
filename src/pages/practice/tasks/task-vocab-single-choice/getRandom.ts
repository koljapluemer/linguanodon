import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { Task } from '@/pages/practice/Task';
import { 
  generateVocabChoiceFromTwoTargetToNative,
  generateVocabChoiceFromTwoNativeToTarget,
  generateVocabChoiceFromFourTargetToNative,
  generateVocabChoiceFromFourNativeToTarget
} from '@/pages/practice/tasks/task-vocab-single-choice/generate';

async function tryGenerateFromVocab(vocab: VocabData) {
  // Randomly pick between the four generators
  const availableGenerators = [
    () => generateVocabChoiceFromTwoTargetToNative(vocab),
    () => generateVocabChoiceFromTwoNativeToTarget(vocab),
    () => generateVocabChoiceFromFourTargetToNative(vocab),
    () => generateVocabChoiceFromFourNativeToTarget(vocab)
  ];
  
  const randomIndex = Math.floor(Math.random() * availableGenerators.length);
  return availableGenerators[randomIndex]();
}

export async function getRandomVocabChoiceTask({
  vocabRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo) return null;
  try {
    // 25% chance to try immersion resource first
    if (Math.random() < 0.25) {
      // TODO: Implement immersion vocab selection or remove this feature
      const immersionVocab = null;
      if (immersionVocab) {
        const task = await tryGenerateFromVocab(immersionVocab);
        if (task) return task;
      }
    }

    // Get due vocab (excluding sentences for choice tasks)
    const allDueVocab = await vocabRepo.getDueVocabInLanguages(languageCodes);
    const eligibleVocab = allDueVocab.filter(vocab => vocab.consideredSentence !== true);
    
    if (eligibleVocab.length === 0) return null;
    
    // Shuffle and try to find a valid vocab item
    const shuffled = [...eligibleVocab].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
      const task = await tryGenerateFromVocab(vocab);
      if (task) return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating vocab choice task:', error);
    return null;
  }
}