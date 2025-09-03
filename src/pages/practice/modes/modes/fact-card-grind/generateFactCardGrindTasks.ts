import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { Task } from '@/pages/practice/Task';
import { generateFactCardTryToRemember } from '@/pages/practice/tasks/task-fact-card-try-to-remember/generate';
import { generateFactCardReveal } from '@/pages/practice/tasks/task-fact-card-reveal/generate';

export async function generateFactCard(
  factCardRepo: FactCardRepoContract,
  languageCodes: string[],
  factCardBlockList?: string[]
): Promise<Task | null> {
  try {
    // Get both types of fact cards
    const [dueFactCards, unseenFactCards] = await Promise.all([
      factCardRepo.getRandomAlreadySeenDueFactCards(10, languageCodes, factCardBlockList),
      factCardRepo.getRandomUnseenFactCards(10, languageCodes, factCardBlockList)
    ]);

    // 70% chance to prefer due cards (if available), 30% chance for unseen cards
    const preferDueCards = Math.random() < 0.7;
    
    if (preferDueCards && dueFactCards.length > 0) {
      // Pick a due fact card - these get reveal tasks
      const factCard = dueFactCards[0];
      return generateFactCardReveal(factCard);
    }
    
    if (unseenFactCards.length > 0) {
      // Pick an unseen fact card - these get try-to-remember tasks
      const factCard = unseenFactCards[0];
      return generateFactCardTryToRemember(factCard);
    }
    
    // Fallback: if we wanted unseen but none available, try due cards
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