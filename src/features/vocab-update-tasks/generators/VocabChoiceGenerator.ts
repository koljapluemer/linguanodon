import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { TaskData } from '@/entities/tasks/TaskData';
import { VocabTaskGeneratorBase } from './VocabTaskGeneratorBase';

export class VocabChooseFromTwoTargetToNativeGenerator extends VocabTaskGeneratorBase {
  canGenerate(vocab: VocabData, translations: TranslationData[]): boolean {
    // Level 0 or 1
    if (vocab.progress.level !== 0 && vocab.progress.level !== 1) return false;
    
    // Must have >0 translations and content
    return translations.length > 0 && !!vocab.content;
  }

  generate(vocab: VocabData): TaskData {
    const uid = `vocab-choose-from-two-target-to-native-${vocab.uid}-${Date.now()}`;
    
    return this.createBaseTask(
      uid,
      vocab,
      'vocab-choose-from-two-target-to-native',
      'Choose the correct translation',
      'small',
      true,  // evaluate difficulty
      false, // don't ask whether to do again
      false  // not one time
    );
  }
}

export class VocabChooseFromTwoNativeToTargetGenerator extends VocabTaskGeneratorBase {
  canGenerate(vocab: VocabData, translations: TranslationData[]): boolean {
    // Level 1 or 2
    if (vocab.progress.level !== 1 && vocab.progress.level !== 2) return false;
    
    // Must have >0 translations and content
    return translations.length > 0 && !!vocab.content;
  }

  generate(vocab: VocabData): TaskData {
    const uid = `vocab-choose-from-two-native-to-target-${vocab.uid}-${Date.now()}`;
    
    return this.createBaseTask(
      uid,
      vocab,
      'vocab-choose-from-two-native-to-target',
      'Choose the correct vocab',
      'small',
      true,  // evaluate difficulty
      false, // don't ask whether to do again
      false  // not one time
    );
  }
}

export class VocabChooseFromFourTargetToNativeGenerator extends VocabTaskGeneratorBase {
  canGenerate(vocab: VocabData, translations: TranslationData[]): boolean {
    // Level 1 or 2
    if (vocab.progress.level !== 1 && vocab.progress.level !== 2) return false;
    
    // Must have >0 translations and content
    return translations.length > 0 && !!vocab.content;
  }

  generate(vocab: VocabData): TaskData {
    const uid = `vocab-choose-from-four-target-to-native-${vocab.uid}-${Date.now()}`;
    
    return this.createBaseTask(
      uid,
      vocab,
      'vocab-choose-from-four-target-to-native',
      'Choose the correct translation',
      'small',
      true,  // evaluate difficulty
      false, // don't ask whether to do again
      false  // not one time
    );
  }
}

export class VocabChooseFromFourNativeToTargetGenerator extends VocabTaskGeneratorBase {
  canGenerate(vocab: VocabData, translations: TranslationData[]): boolean {
    // Level 2 or 3
    if (vocab.progress.level !== 2 && vocab.progress.level !== 3) return false;
    
    // Must have >0 translations and content
    return translations.length > 0 && !!vocab.content;
  }

  generate(vocab: VocabData): TaskData {
    const uid = `vocab-choose-from-four-native-to-target-${vocab.uid}-${Date.now()}`;
    
    return this.createBaseTask(
      uid,
      vocab,
      'vocab-choose-from-four-native-to-target',
      'Choose the correct vocab',
      'small',
      true,  // evaluate difficulty
      false, // don't ask whether to do again
      false  // not one time
    );
  }
}