import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { Task } from '@/entities/tasks/Task';
import { generateFactCardTryToRemember } from '../../make-a-task/generateFactCardTryToRemember';
import { generateFactCardReveal } from '../../make-a-task/generateFactCardReveal';

export async function getRandomGeneratedTaskForFactCard(
  factCard: FactCardData
): Promise<Task | null> {
  const level = factCard.progress.level;
  
  // Unseen fact cards (level -1) get try-to-remember task
  if (level === -1) {
    return generateFactCardTryToRemember(factCard);
  }
  
  // All other fact cards get reveal task
  if (level >= 0) {
    return generateFactCardReveal(factCard);
  }
  
  return null;
}