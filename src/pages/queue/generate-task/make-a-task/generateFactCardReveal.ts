import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { Task } from '@/entities/tasks/Task';

export function generateFactCardReveal(factCard: FactCardData): Task {
  const uid = `fact-card-reveal-${factCard.uid}-${Date.now()}`;
  
  return {
    uid,
    language: factCard.language,
    taskType: 'fact-card-reveal',
    prompt: 'What does this mean?',
    associatedFactCards: [factCard.uid]
  };
}