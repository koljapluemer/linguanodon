import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { Task } from '@/entities/tasks/Task';
import { generateFactCardTryToRemember } from '@/pages/practice/tasks/task-fact-card-try-to-remember/generateFactCardTryToRemember';
import { generateFactCardReveal } from '@/pages/practice/tasks/task-fact-card-reveal/generateFactCardReveal';

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