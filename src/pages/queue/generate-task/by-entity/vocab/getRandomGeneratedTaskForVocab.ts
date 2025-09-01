import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Task } from '@/entities/tasks/Task';
import { randomFromArray } from '@/shared/arrayUtils';

// Import all task generators
import { generateAddTranslation } from '../../make-a-task/generateAddTranslation';
import { generateVocabTryToRemember } from '../../make-a-task/generateVocabTryToRemember';
import { generateGuessWhatSentenceMeans } from '../../make-a-task/generateGuessWhatSentenceMeans';
import { generateVocabRevealTargetToNative } from '../../make-a-task/generateVocabRevealTargetToNative';
import { generateVocabRevealNativeToTarget } from '../../make-a-task/generateVocabRevealNativeToTarget';
import { generateVocabChoiceFromTwoTargetToNative } from '../../make-a-task/generateVocabChoiceFromTwoTargetToNative';
import { generateVocabChoiceFromTwoNativeToTarget } from '../../make-a-task/generateVocabChoiceFromTwoNativeToTarget';
import { generateVocabChoiceFromFourTargetToNative } from '../../make-a-task/generateVocabChoiceFromFourTargetToNative';
import { generateVocabChoiceFromFourNativeToTarget } from '../../make-a-task/generateVocabChoiceFromFourNativeToTarget';
import { generateClozeChoiceFromTwo } from '../../make-a-task/generateClozeChoiceFromTwo';
import { generateClozeChoiceFromFour } from '../../make-a-task/generateClozeChoiceFromFour';
import { generateClozeReveal } from '../../make-a-task/generateClozeReveal';

type TaskGenerator = () => Task;

export async function getRandomGeneratedTaskForVocab(
  vocab: VocabData,
  translations: TranslationData[] = []
): Promise<Task | null> {
  const level = vocab.progress.level;
  const isWordOrUnspecified = vocab.length === 'word' || vocab.length === 'unspecified';
  const isSentence = vocab.length === 'sentence';
  const hasTranslations = translations.length > 0;
  const hasContent = !!vocab.content;

  const eligibleTasks: TaskGenerator[] = [];

  // Unseen vocab (level -1)
  if (level === -1 && isWordOrUnspecified) {
    eligibleTasks.push(() => generateVocabTryToRemember(vocab));
  }
  if (level === -1 && isSentence && hasTranslations) {
    eligibleTasks.push(() => generateGuessWhatSentenceMeans(vocab));
  }

  // Word/unspecified choice tasks
  if (isWordOrUnspecified && hasTranslations && (level === 0 || level === 1)) {
    eligibleTasks.push(() => generateVocabChoiceFromTwoTargetToNative(vocab));
  }
  if (isWordOrUnspecified && hasTranslations && (level === 1 || level === 2)) {
    eligibleTasks.push(() => generateVocabChoiceFromFourTargetToNative(vocab));
  }
  if (isWordOrUnspecified && hasTranslations && (level === 1 || level === 2)) {
    eligibleTasks.push(() => generateVocabChoiceFromTwoNativeToTarget(vocab));
  }
  if (isWordOrUnspecified && hasTranslations && (level === 2 || level === 3)) {
    eligibleTasks.push(() => generateVocabChoiceFromFourNativeToTarget(vocab));
  }

  // Word/unspecified reveal tasks
  if (isWordOrUnspecified && hasTranslations && level >= 3) {
    eligibleTasks.push(() => generateVocabRevealTargetToNative(vocab));
  }
  if (isWordOrUnspecified && hasTranslations && level >= 4) {
    eligibleTasks.push(() => generateVocabRevealNativeToTarget(vocab));
  }

  // Sentence cloze tasks (levels 0-5)
  if (isSentence && hasTranslations && level >= 0 && level <= 5) {
    eligibleTasks.push(() => generateClozeChoiceFromTwo(vocab));
    eligibleTasks.push(() => generateClozeChoiceFromFour(vocab));
    eligibleTasks.push(() => generateClozeReveal(vocab));
  }

  // Sentence reveal tasks (level 6+)
  if (isSentence && hasTranslations && level > 6) {
    eligibleTasks.push(() => generateVocabRevealTargetToNative(vocab));
    eligibleTasks.push(() => generateVocabRevealNativeToTarget(vocab));
  }

  // Content enhancement tasks
  if (hasContent && !hasTranslations) {
    eligibleTasks.push(() => generateAddTranslation(vocab));
  }

  if (eligibleTasks.length === 0) {
    return null;
  }

  // Randomly pick one task from all eligible tasks
  const selectedTaskGenerator = randomFromArray(eligibleTasks);
  return selectedTaskGenerator ? selectedTaskGenerator() : null;
}