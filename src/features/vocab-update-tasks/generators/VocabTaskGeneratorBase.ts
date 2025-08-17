import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { NoteData } from '@/entities/notes/NoteData';

export abstract class VocabTaskGeneratorBase {
  abstract canGenerate(vocab: VocabData, translations: TranslationData[], notes: NoteData[]): boolean;
  abstract generate(vocab: VocabData, translations: TranslationData[], notes: NoteData[]): TaskData;
  
  protected createBaseTask(
    uid: string,
    vocab: VocabData,
    taskType: TaskData['taskType'],
    title: string,
    prompt: string,
    size: TaskData['taskSize'],
    evaluateDifficulty: boolean,
    decideAgain: boolean,
    isOneTime: boolean
  ): TaskData {
    return {
      uid,
      taskType,
      title,
      prompt,
      evaluateDifficultyAfterDoing: evaluateDifficulty,
      decideWhetherToDoAgainAfterDoing: decideAgain,
      isOneTime,
      isActive: true,
      taskSize: size,
      associatedVocab: [vocab.uid]
    };
  }
}