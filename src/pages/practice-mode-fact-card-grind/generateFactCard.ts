import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateFactCardTryToRemember } from '@/tasks/task-fact-card-try-to-remember/generateFactCardTryToRemember';
import { generateFactCardReveal } from '@/tasks/task-fact-card-reveal/generateFactCardReveal';

export async function generateFactCard(
  factCardRepo: FactCardRepoContract,
  languageCodes: string[],
  factCardBlockList?: string[]
): Promise<Task | null> {
  try {
    // First, try to get unseen fact cards (level -1) - these get try-to-remember tasks
    const unseenFactCards = await factCardRepo.getRandomUnseenFactCards(1, languageCodes, factCardBlockList);
    
    if (unseenFactCards.length > 0) {
      const factCard = unseenFactCards[0];
      return generateFactCardTryToRemember(factCard);
    }

    // If no unseen fact cards, get due fact cards (level >= 0) - these get reveal tasks
    const dueFactCards = await factCardRepo.getRandomAlreadySeenDueFactCards(1, languageCodes, factCardBlockList);
    
    if (dueFactCards.length > 0) {
      const factCard = dueFactCards[0];
      return generateFactCardReveal(factCard);
    }

    // No fact cards available
    return null;
  } catch (error) {
    console.error('Error generating fact card task:', error);
    return null;
  }
}