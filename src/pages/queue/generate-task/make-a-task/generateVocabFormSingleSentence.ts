import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabFormSingleSentence(vocab: VocabData): Task {
  const uid = `vocab-form-sentence-single-${vocab.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab.language,
    taskType: 'vocab-form-sentence-single',
    prompt: 'Form a sentence using this word',
    associatedVocab: [vocab.uid]
  };
}

// export function canGenerateVocabFormSingleSentence(
//   vocab: VocabData,
//   translations: TranslationData[]
// ): boolean {
//   // Vocab must be seen (level 0+) and have translations
//   return vocab.progress.level >= 0 && 
//          !!vocab.content &&
//          translations.length > 0;
// }