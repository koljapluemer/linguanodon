import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import { generateFactCardReveal } from '@/pages/practice/tasks/task-fact-card-reveal/generate';

export async function getRandomFactCardRevealTask({
  factCardRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!factCardRepo) return null;
  try {
    // Get already seen due fact cards
    const dueFactCards = await factCardRepo.getRandomAlreadySeenDueFactCards(10, languageCodes);
    
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