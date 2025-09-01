import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateFactCardReveal } from '@/tasks/task-fact-card-reveal/generateFactCardReveal';

export async function getRandomFactCardRevealTask(
  factCardRepo: FactCardRepoContract,
  languageCodes: string[],
  factCardBlockList?: string[]
): Promise<Task | null> {
  try {
    // Get already seen due fact cards
    const dueFactCards = await factCardRepo.getRandomAlreadySeenDueFactCards(10, languageCodes, factCardBlockList);
    
    if (dueFactCards.length === 0) return null;
    
    // Shuffle and get first fact card
    const shuffled = [...dueFactCards].sort(() => Math.random() - 0.5);
    
    for (const factCard of shuffled) {
      return generateFactCardReveal(factCard);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating fact card reveal task:', error);
    return null;
  }
}