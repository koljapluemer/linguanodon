import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { Task } from '@/entities/tasks/Task';
import { getRandomGeneratedTaskForVocab } from '@/pages/practice/modes/utils/getRandomGeneratedTaskForVocab';
import { getRandomGeneratedTaskForFactCard } from '@/pages/practice/modes/utils/getRandomGeneratedTaskForFactCard';
import { randomFromArray } from '@/shared/utils/arrayUtils';

export async function generateSisyphosTask(
  vocabRepo: VocabRepoContract,
  translationRepo: TranslationRepoContract,
  factCardRepo: FactCardRepoContract,
  languageCodes: string[],
  blockList?: string[]
): Promise<Task | null> {
  try {
    // Get both types of SEEN and DUE content
    const [dueVocab, dueFactCards] = await Promise.all([
      vocabRepo.getRandomAlreadySeenDueVocab(10, languageCodes, blockList),
      factCardRepo.getRandomAlreadySeenDueFactCards(10, languageCodes, blockList)
    ]);

    // Create content pool from both vocab and fact cards (only seen/due, never new)
    const contentOptions: Array<{type: 'vocab' | 'factCard', content: VocabData | FactCardData}> = [];
    
    // Add vocab to pool
    dueVocab.forEach(vocab => {
      contentOptions.push({ type: 'vocab', content: vocab });
    });
    
    // Add fact cards to pool  
    dueFactCards.forEach(factCard => {
      contentOptions.push({ type: 'factCard', content: factCard });
    });

    if (contentOptions.length === 0) {
      return null;
    }

    // Randomly pick between vocab and fact cards
    const selectedOption = randomFromArray(contentOptions);
    if (!selectedOption) {
      return null;
    }

    if (selectedOption.type === 'vocab') {
      // Get translations for vocab task generation
      const vocab = selectedOption.content as VocabData;
      const translations = await translationRepo.getTranslationsByIds(vocab.translations || []);
      return await getRandomGeneratedTaskForVocab(vocab, translations);
    } else {
      // Generate fact card task
      const factCard = selectedOption.content as FactCardData;
      return await getRandomGeneratedTaskForFactCard(factCard);
    }
  } catch (error) {
    console.error('Error generating Sisyphos task:', error);
    return null;
  }
}