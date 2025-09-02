import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateFactCardTryToRemember } from '@/pages/practice/tasks/task-fact-card-try-to-remember/generateFactCardTryToRemember';

export async function getRandomFactCardTryToRememberTask(
  factCardRepo: FactCardRepoContract,
  languageCodes: string[],
  factCardBlockList?: string[]
): Promise<Task | null> {
  try {
    // Get unseen fact cards
    const unseenFactCards = await factCardRepo.getRandomUnseenFactCards(10, languageCodes, factCardBlockList);
    
    if (unseenFactCards.length === 0) return null;
    
    // Get first fact card
    for (const factCard of unseenFactCards) {
      return generateFactCardTryToRemember(factCard);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating fact card try to remember task:', error);
    return null;
  }
}