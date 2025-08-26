import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { Task } from '@/entities/tasks/Task';
import { pickRandom } from '@/shared/arrayUtils';

// Import all task generators
import { generateAddPronunciation, canGenerateAddPronunciation } from '../task-generator/generateAddPronunciation';
import { generateVocabTryToRemember, canGenerateVocabTryToRemember } from '../task-generator/generateVocabTryToRemember';
import { generateGuessWhatSentenceMeans, canGenerateGuessWhatSentenceMeans } from '../task-generator/generateGuessWhatSentenceMeans';
import { generateVocabRevealTargetToNative, canGenerateVocabRevealTargetToNative } from '../task-generator/generateVocabRevealTargetToNative';
import { generateVocabRevealNativeToTarget, canGenerateVocabRevealNativeToTarget } from '../task-generator/generateVocabRevealNativeToTarget';
import { generateVocabChoiceFromTwoTargetToNative, canGenerateVocabChoiceFromTwoTargetToNative } from '../task-generator/generateVocabChoiceFromTwoTargetToNative';
import { generateVocabChoiceFromTwoNativeToTarget, canGenerateVocabChoiceFromTwoNativeToTarget } from '../task-generator/generateVocabChoiceFromTwoNativeToTarget';
import { generateVocabChoiceFromFourTargetToNative, canGenerateVocabChoiceFromFourTargetToNative } from '../task-generator/generateVocabChoiceFromFourTargetToNative';
import { generateVocabChoiceFromFourNativeToTarget, canGenerateVocabChoiceFromFourNativeToTarget } from '../task-generator/generateVocabChoiceFromFourNativeToTarget';

type VocabTaskGenerator = {
  canGenerate: (vocab: VocabData, translations: TranslationData[], notes: NoteData[]) => boolean;
  generate: (vocab: VocabData, translations?: TranslationData[], notes?: NoteData[]) => Task;
};

const vocabTaskGenerators: VocabTaskGenerator[] = [
  {
    canGenerate: canGenerateAddPronunciation,
    generate: (vocab) => generateAddPronunciation(vocab)
  },
  {
    canGenerate: canGenerateVocabTryToRemember,
    generate: (vocab) => generateVocabTryToRemember(vocab)
  },
  {
    canGenerate: canGenerateGuessWhatSentenceMeans,
    generate: (vocab) => generateGuessWhatSentenceMeans(vocab)
  },
  {
    canGenerate: canGenerateVocabRevealTargetToNative,
    generate: (vocab) => generateVocabRevealTargetToNative(vocab)
  },
  {
    canGenerate: canGenerateVocabRevealNativeToTarget,
    generate: (vocab) => generateVocabRevealNativeToTarget(vocab)
  },
  {
    canGenerate: canGenerateVocabChoiceFromTwoTargetToNative,
    generate: (vocab) => generateVocabChoiceFromTwoTargetToNative(vocab)
  },
  {
    canGenerate: canGenerateVocabChoiceFromTwoNativeToTarget,
    generate: (vocab) => generateVocabChoiceFromTwoNativeToTarget(vocab)
  },
  {
    canGenerate: canGenerateVocabChoiceFromFourTargetToNative,
    generate: (vocab) => generateVocabChoiceFromFourTargetToNative(vocab)
  },
  {
    canGenerate: canGenerateVocabChoiceFromFourNativeToTarget,
    generate: (vocab) => generateVocabChoiceFromFourNativeToTarget(vocab)
  }
];

export async function getRandomGeneratedTaskForVocab(
  vocab: VocabData,
  translations: TranslationData[] = [],
  notes: NoteData[] = []
): Promise<Task | null> {
  // Find all generators that can generate tasks for this vocab
  const availableGenerators = vocabTaskGenerators.filter(generator =>
    generator.canGenerate(vocab, translations, notes)
  );

  if (availableGenerators.length === 0) {
    return null;
  }

  // Pick a random generator and generate a task
  const selectedGenerator = pickRandom(availableGenerators, 1)[0];
  return selectedGenerator.generate(vocab, translations, notes);
}