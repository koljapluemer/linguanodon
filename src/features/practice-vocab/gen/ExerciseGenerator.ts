import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { Exercise, AnswerOption } from '@/shared/ExerciseTypes';
import { DistractorGenerator } from './DistractorGenerator';
import { shuffleArray } from '@/shared/arrayUtils';

export class ExerciseGenerator {
  
  static async generateExercise(
    vocab: VocabData, 
    translations: TranslationData[], 
    vocabRepo: VocabAndTranslationRepoContract
  ): Promise<Exercise> {
    const level = vocab.progress.level;
    const distractorGen = new DistractorGenerator(vocabRepo);
    
    switch (level) {
      case -1:
        return this.generateTryToRememberExercise(vocab, translations);
      case 0:
        return await this.generateChooseFromTwoVocabToTranslation(vocab, translations, distractorGen);
      case 1:
        // Random choice between choose-from-four vocab→translation OR choose-from-two translation→vocab
        return Math.random() < 0.5 
          ? await this.generateChooseFromFourVocabToTranslation(vocab, translations, distractorGen)
          : await this.generateChooseFromTwoTranslationToVocab(vocab, translations, distractorGen);
      case 2:
        // Random choice between choose-from-four vocab→translation OR choose-from-four translation→vocab
        return Math.random() < 0.5
          ? await this.generateChooseFromFourVocabToTranslation(vocab, translations, distractorGen)
          : await this.generateChooseFromFourTranslationToVocab(vocab, translations, distractorGen);
      case 3:
        return this.generateRevealExercise(vocab, translations);
      case 4:
        // Random choice between reveal vocab→translation OR reveal translation→vocab(s)
        return Math.random() < 0.5
          ? this.generateRevealExercise(vocab, translations)
          : await this.generateReverseRevealExercise(vocab, translations, vocabRepo);
      default:
        // Fallback for levels > 4
        return this.generateRevealExercise(vocab, translations);
    }
  }

  private static generateTryToRememberExercise(vocab: VocabData, translations: TranslationData[]): Exercise {
    const translationTexts = translations.map(t => t.content).join(', ');
    
    return {
      id: `exercise-${vocab.uid}-${Date.now()}`,
      type: 'try-to-remember',
      vocabId: vocab.uid,
      prompt: 'How hard is this word to remember?',
      solution: translationTexts,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      }
    };
  }

  private static generateRevealExercise(vocab: VocabData, translations: TranslationData[]): Exercise {
    const translationTexts = translations.slice(0, 8).map(t => t.content).join(', ');
    const hasMore = translations.length > 8;
    
    return {
      id: `exercise-${vocab.uid}-${Date.now()}`,
      type: 'reveal',
      vocabId: vocab.uid,
      prompt: 'What does this mean?',
      solution: hasMore ? `${translationTexts}...` : translationTexts,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      }
    };
  }

  private static async generateReverseRevealExercise(
    vocab: VocabData, 
    translations: TranslationData[], 
    vocabRepo: VocabAndTranslationRepoContract
  ): Promise<Exercise> {
    // Pick a random translation
    const randomTranslation = translations[Math.floor(Math.random() * translations.length)];
    
    // Find all vocab with this translation
    const vocabWithTranslation = await vocabRepo.findVocabByTranslationContent(randomTranslation.content);
    const vocabContents = vocabWithTranslation
      .filter(v => v.content)
      .slice(0, 8)
      .map(v => v.content!);
    
    const hasMore = vocabWithTranslation.length > 8;
    const solution = hasMore ? `${vocabContents.join(', ')}...` : vocabContents.join(', ');
    
    return {
      id: `exercise-${vocab.uid}-${Date.now()}`,
      type: 'reveal',
      vocabId: vocab.uid,
      prompt: 'What vocab has this translation?',
      solution,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      },
      isReverse: true,
      targetTranslation: randomTranslation.content
    };
  }

  private static async generateChooseFromTwoVocabToTranslation(
    vocab: VocabData, 
    translations: TranslationData[], 
    distractorGen: DistractorGenerator
  ): Promise<Exercise> {
    const correctAnswer = translations[Math.floor(Math.random() * translations.length)].content;
    const wrongAnswers = await distractorGen.generateWrongTranslations(vocab, translations, correctAnswer, 1);
    
    const options: AnswerOption[] = [
      { content: correctAnswer, isCorrect: true },
      { content: wrongAnswers[0] || correctAnswer, isCorrect: wrongAnswers.length === 0 }
    ];
    
    // Handle edge case where both are correct
    if (wrongAnswers.length === 0) {
      options[1].isCorrect = true;
    }
    
    return {
      id: `exercise-${vocab.uid}-${Date.now()}`,
      type: 'choose-from-two-vocab-to-translation',
      vocabId: vocab.uid,
      prompt: 'Choose the correct translation:',
      solution: correctAnswer,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      },
      answerOptions: shuffleArray(options)
    };
  }

  private static async generateChooseFromFourVocabToTranslation(
    vocab: VocabData, 
    translations: TranslationData[], 
    distractorGen: DistractorGenerator
  ): Promise<Exercise> {
    const correctAnswer = translations[Math.floor(Math.random() * translations.length)].content;
    const wrongAnswers = await distractorGen.generateWrongTranslations(vocab, translations, correctAnswer, 3);
    
    const options: AnswerOption[] = [
      { content: correctAnswer, isCorrect: true }
    ];
    
    // Add wrong answers
    wrongAnswers.forEach(wrong => {
      options.push({ content: wrong, isCorrect: false });
    });
    
    // Fill remaining slots with correct answer if needed (edge case)
    while (options.length < 4) {
      options.push({ content: correctAnswer, isCorrect: true });
    }
    
    return {
      id: `exercise-${vocab.uid}-${Date.now()}`,
      type: 'choose-from-four-vocab-to-translation',
      vocabId: vocab.uid,
      prompt: 'Choose the correct translation:',
      solution: correctAnswer,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      },
      answerOptions: shuffleArray(options)
    };
  }

  private static async generateChooseFromTwoTranslationToVocab(
    vocab: VocabData, 
    translations: TranslationData[], 
    distractorGen: DistractorGenerator
  ): Promise<Exercise> {
    const randomTranslation = translations[Math.floor(Math.random() * translations.length)];
    const correctAnswer = vocab.content || '';
    const wrongAnswers = await distractorGen.generateWrongVocabs(vocab.language, correctAnswer, 1);
    
    const options: AnswerOption[] = [
      { content: correctAnswer, isCorrect: true },
      { content: wrongAnswers[0] || correctAnswer, isCorrect: wrongAnswers.length === 0 }
    ];
    
    // Handle edge case where both are correct
    if (wrongAnswers.length === 0) {
      options[1].isCorrect = true;
    }
    
    return {
      id: `exercise-${vocab.uid}-${Date.now()}`,
      type: 'choose-from-two-translation-to-vocab',
      vocabId: vocab.uid,
      prompt: 'Choose the correct vocab:',
      solution: correctAnswer,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      },
      answerOptions: shuffleArray(options),
      isReverse: true,
      targetTranslation: randomTranslation.content
    };
  }

  private static async generateChooseFromFourTranslationToVocab(
    vocab: VocabData, 
    translations: TranslationData[], 
    distractorGen: DistractorGenerator
  ): Promise<Exercise> {
    const randomTranslation = translations[Math.floor(Math.random() * translations.length)];
    const correctAnswer = vocab.content || '';
    const wrongAnswers = await distractorGen.generateWrongVocabs(vocab.language, correctAnswer, 3);
    
    const options: AnswerOption[] = [
      { content: correctAnswer, isCorrect: true }
    ];
    
    // Add wrong answers
    wrongAnswers.forEach(wrong => {
      options.push({ content: wrong, isCorrect: false });
    });
    
    // Fill remaining slots with correct answer if needed (edge case)
    while (options.length < 4) {
      options.push({ content: correctAnswer, isCorrect: true });
    }
    
    return {
      id: `exercise-${vocab.uid}-${Date.now()}`,
      type: 'choose-from-four-translation-to-vocab',
      vocabId: vocab.uid,
      prompt: 'Choose the correct vocab:',
      solution: correctAnswer,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      },
      answerOptions: shuffleArray(options),
      isReverse: true,
      targetTranslation: randomTranslation.content
    };
  }
}