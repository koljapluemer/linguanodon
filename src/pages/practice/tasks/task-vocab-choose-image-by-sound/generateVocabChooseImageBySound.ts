import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabChooseImageBySound(vocab: VocabData): Task {
  const uid = `vocab-choose-image-by-sound-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-choose-image-by-sound',
    prompt: 'Choose the correct image based on what you hear',
    associatedVocab: [vocab.uid]
  };
}