import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { Task } from '@/pages/practice/Task';
import { generateClozeChoiceFromFour, generateClozeChoiceFromTwo } from '@/pages/practice/tasks/task-cloze-choice/generate';
import { getRandomDueVocabFromRandomValidImmersionResource } from '../../modes/utils/getRandomDueVocabFromRandomValidImmersionResource';

async function tryGenerateFromVocab(vocab: VocabData) {
  // Filter to only sentence vocab (cloze tasks are now sentence-only)
  if (vocab.consideredSentence !== true) {
    return null;
  }

  // Randomly pick between the two generators
  const availableGenerators = [
    () => generateClozeChoiceFromTwo(vocab),
    () => generateClozeChoiceFromFour(vocab)
  ];
  
  const randomIndex = Math.floor(Math.random() * availableGenerators.length);
  return availableGenerators[randomIndex]();
}

export async function getRandomClozeChoiceTask({
  vocabRepo,
  resourceRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!vocabRepo || !resourceRepo) return null;
  try {
    // 25% chance to try immersion resource first
    if (Math.random() < 0.25) {
      const immersionVocab = await getRandomDueVocabFromRandomValidImmersionResource(
        resourceRepo, vocabRepo, languageCodes
      );
      if (immersionVocab) {
        const task = await tryGenerateFromVocab(immersionVocab);
        if (task) return task;
      }
    }

    // Get due sentence vocab with level <= 6 directly from DB
    const sentenceVocab = await vocabRepo.getDueSentenceVocabWithMaxLevel(languageCodes, 6);
    
    if (sentenceVocab.length === 0) {
      // Fallback to unseen sentence vocab
      const unseenSentenceVocab = await vocabRepo.getRandomUnseenSentenceVocab(20, languageCodes);
      if (unseenSentenceVocab.length === 0) return null;
      
      for (const vocab of unseenSentenceVocab) {
        const task = await tryGenerateFromVocab(vocab);
        if (task) return task;
      }
      return null;
    }
    
    // Shuffle and try to find a valid vocab item from due sentence vocab
    const shuffled = [...sentenceVocab].sort(() => Math.random() - 0.5);
    
    for (const vocab of shuffled) {
      const task = await tryGenerateFromVocab(vocab);
      if (task) return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating cloze choice task:', error);
    return null;
  }
}