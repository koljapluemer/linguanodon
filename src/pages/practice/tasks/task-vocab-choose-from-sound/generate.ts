import type { VocabData } from '@/entities/vocab/VocabData';
import type { Task } from '@/pages/practice/Task';

export function generateVocabChooseFromSound(vocab: VocabData): Task {
  return {
    uid: crypto.randomUUID(),
    taskType: 'vocab-choose-from-sound',
    language: vocab.language,
    prompt: `Listen to the sound and choose the correct character`,
    associatedVocab: [vocab.uid],
    associatedFactCards: [],
    associatedGoals: [],
    associatedResources: []
  };
}