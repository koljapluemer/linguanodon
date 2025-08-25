import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { TaskData } from '@/entities/tasks/Task';
import type { NoteData } from '@/entities/notes/NoteData';
import type { VocabTaskGeneratorBase } from './generators/VocabTaskGeneratorBase';

import { AddPronunciationGenerator } from './generators/AddPronunciationGenerator';
import { VocabTryToRememberGenerator } from './generators/VocabTryToRememberGenerator';
import { VocabRevealTargetToNativeGenerator, VocabRevealNativeToTargetGenerator } from './generators/VocabRevealGenerator';
import { 
  VocabChooseFromTwoTargetToNativeGenerator,
  VocabChooseFromTwoNativeToTargetGenerator,
  VocabChooseFromFourTargetToNativeGenerator,
  VocabChooseFromFourNativeToTargetGenerator
} from './generators/VocabChoiceGenerator';

export class VocabTaskCoordinator {
  private generators: VocabTaskGeneratorBase[] = [
    new AddPronunciationGenerator(),
    new VocabTryToRememberGenerator(),
    new VocabRevealTargetToNativeGenerator(),
    new VocabRevealNativeToTargetGenerator(),
    new VocabChooseFromTwoTargetToNativeGenerator(),
    new VocabChooseFromTwoNativeToTargetGenerator(),
    new VocabChooseFromFourTargetToNativeGenerator(),
    new VocabChooseFromFourNativeToTargetGenerator()
  ];

  generateApplicableTasks(vocab: VocabData, translations: TranslationData[], notes: NoteData[]): TaskData[] {
    const tasks: TaskData[] = [];
    
    for (const generator of this.generators) {
      if (generator.canGenerate(vocab, translations, notes)) {
        const task = generator.generate(vocab, translations, notes);
        tasks.push(task);
      }
    }
    
    return tasks;
  }

  getActiveTaskTypes(vocab: VocabData, translations: TranslationData[], notes: NoteData[]): string[] {
    return this.generators
      .filter(generator => generator.canGenerate(vocab, translations, notes))
      .map(generator => generator.constructor.name.replace('Generator', ''));
  }
}