import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { Task } from '@/entities/tasks/Task';

export function generateVocabFormSentence(vocab1: VocabData, vocab2: VocabData): Task {
  const uid = `vocab-form-sentence-${vocab1.uid}-${vocab2.uid}-${Date.now()}`;
  
  return {
    uid,
    language: vocab1.language,
    taskType: 'vocab-form-sentence',
    prompt: 'Form a sentence using both of these words',
    associatedVocab: [vocab1.uid, vocab2.uid]
  };
}

// export function canGenerateVocabFormSentence(
//   vocab1: VocabData,
//   vocab2: VocabData,
//   translations1: TranslationData[],
//   translations2: TranslationData[]
// ): boolean {
//   // Both vocab must be seen (level 0+) and have translations
//   return vocab1.progress.level >= 0 && 
//          vocab2.progress.level >= 0 &&
//          !!vocab1.content &&
//          !!vocab2.content &&
//          translations1.length > 0 &&
//          translations2.length > 0 &&
//          vocab1.language === vocab2.language;
// }