import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { TaskData } from '@/entities/tasks/TaskData';
import { VocabTaskGeneratorBase } from './VocabTaskGeneratorBase';

export class VocabRevealTargetToNativeGenerator extends VocabTaskGeneratorBase {
  canGenerate(vocab: VocabData, translations: TranslationData[]): boolean {
    // Level 3 or above
    if (vocab.progress.level < 3) return false;
    
    // Must have >0 translations and content
    return translations.length > 0 && !!vocab.content;
  }

  generate(vocab: VocabData): TaskData {
    const uid = `vocab-reveal-target-to-native-${vocab.uid}-${Date.now()}`;
    
    return this.createBaseTask(
      uid,
      vocab,
      'vocab-reveal-target-to-native',
      'What does this mean?',
      'small',
      true,  // evaluate difficulty
      false, // don't ask whether to do again
      false  // not one time
    );
  }
}

export class VocabRevealNativeToTargetGenerator extends VocabTaskGeneratorBase {
  canGenerate(vocab: VocabData, translations: TranslationData[]): boolean {
    // Level 4 or above
    if (vocab.progress.level < 4) return false;
    
    // Must have >0 translations and content
    return translations.length > 0 && !!vocab.content;
  }

  generate(vocab: VocabData): TaskData {
    const uid = `vocab-reveal-native-to-target-${vocab.uid}-${Date.now()}`;
    
    return this.createBaseTask(
      uid,
      vocab,
      'vocab-reveal-native-to-target',
      'What vocab has this translation?',
      'small',
      true,  // evaluate difficulty
      false, // don't ask whether to do again
      false  // not one time
    );
  }
}