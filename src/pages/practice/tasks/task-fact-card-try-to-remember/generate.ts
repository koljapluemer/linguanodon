import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { Task } from '@/pages/practice/Task';

export function generateFactCardTryToRemember(factCard: FactCardData): Task {
  const uid = `fact-card-try-to-remember-${factCard.uid}-${Date.now()}`;
  
  return {
    uid,
    language: factCard.language,
    taskType: 'fact-card-try-to-remember',
    prompt: 'Try to memorize',
    associatedFactCards: [factCard.uid]
  };
}