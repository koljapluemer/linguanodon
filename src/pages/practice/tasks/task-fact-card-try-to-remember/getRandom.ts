import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/entities/tasks/Task';
import { generateFactCardTryToRemember } from '@/pages/practice/tasks/task-fact-card-try-to-remember/generate';

export async function getRandomFactCardTryToRememberTask({
  factCardRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!factCardRepo) return null;
  
  try {
    // Get unseen fact cards
    const unseenFactCards = await factCardRepo.getRandomUnseenFactCards(10, languageCodes);
    
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