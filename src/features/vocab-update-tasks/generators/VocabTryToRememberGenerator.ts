import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TaskData } from '@/entities/tasks/TaskData';
import { VocabTaskGeneratorBase } from './VocabTaskGeneratorBase';

export class VocabTryToRememberGenerator extends VocabTaskGeneratorBase {
  canGenerate(vocab: VocabData): boolean {
    return vocab.progress.level === -1;
  }

  generate(vocab: VocabData): TaskData {
    const uid = `vocab-try-to-remember-${vocab.uid}-${Date.now()}`;
    
    return this.createBaseTask(
      uid,
      vocab,
      'vocab-try-to-remember',
      vocab.content || 'Unknown vocab',
      'Try to remember the meaning of this word',
      'small',
      false, // don't evaluate difficulty
      false, // don't decide whether to do again
      true   // is one time
    );
  }
}