import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { Exercise } from '@/shared/ExerciseTypes';

export class ExerciseGenerator {
  
  static generateExercise(vocab: VocabData, translations: TranslationData[]): Exercise {
    const level = vocab.progress.level;
    
    if (level === -1) {
      return this.generateTryToRememberExercise(vocab, translations);
    } else {
      return this.generateRevealExercise(vocab, translations);
    }
  }

  private static generateTryToRememberExercise(vocab: VocabData, translations: TranslationData[]): Exercise {
    const translationTexts = translations.map(t => t.content).join(', ');
    
    return {
      id: `exercise-${vocab.id}-${Date.now()}`,
      type: 'try-to-remember',
      vocabId: vocab.id,
      prompt: 'Try to remember what this means:',
      solution: translationTexts,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      }
    };
  }

  private static generateRevealExercise(vocab: VocabData, translations: TranslationData[]): Exercise {
    const translationTexts = translations.map(t => t.content).join(', ');
    
    return {
      id: `exercise-${vocab.id}-${Date.now()}`,
      type: 'reveal',
      vocabId: vocab.id,
      prompt: 'What does this mean?',
      solution: translationTexts,
      vocab: {
        content: vocab.content || '',
        translations: translations.map(t => t.content)
      }
    };
  }
}