import type { WordData, SentenceData } from "@/entities/linguisticUnits";
import type { Exercise } from "../Exercise";
import type { LinguisticUnitData } from "@/entities/linguisticUnits";

/**
 * Static class for generating exercises of different types and levels.
 */
export class ExerciseGenerator {
  /**
   * Generates a level 0 "Look At Card" exercise for words.
   * Shows the word and its translations, asking the user to remember it.
   */
  static generateWordLevel0(word: WordData): Exercise {
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: word.language,
      content: word.content,
      translations: word.translations,
      notes: word.notes
    };

    const translations = word.translations
      ?.map(t => t.content)
      .join(', ') || '';

    return {
      id: `word-level0-${word.language}-${word.content}`,
      type: 'reveal',
      prompt: `Try to remember this word: "${word.content}"`,
      solution: `Translations: ${translations}`,
      level: 0,
      linguisticUnit,
      isRepeatable: false
    };
  }

  /**
   * Generates a level 1 flashcard exercise (target to native, 2 buttons).
   */
  static generateWordLevel1(word: WordData, distractors: WordData[]): Exercise {
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: word.language,
      content: word.content,
      translations: word.translations,
      notes: word.notes
    };

    const correctAnswer = word.translations?.[0]?.content || '';
    const wrongAnswer = distractors[0]?.translations?.[0]?.content || '';

    return {
      id: `word-level1-${word.language}-${word.content}`,
      type: 'reveal',
      prompt: `What does "${word.content}" mean?`,
      solution: `Correct: ${correctAnswer}\nIncorrect: ${wrongAnswer}`,
      level: 1,
      linguisticUnit,
      isRepeatable: true
    };
  }

  /**
   * Generates a level 2 flashcard exercise (target to native, 4 buttons).
   */
  static generateWordLevel2(word: WordData, distractors: WordData[]): Exercise {
    const linguisticUnit: LinguisticUnitData = {
      type: 'word',
      language: word.language,
      content: word.content,
      translations: word.translations,
      notes: word.notes
    };

    const correctAnswer = word.translations?.[0]?.content || '';
    const wrongAnswers = distractors.slice(0, 3).map(d => d.translations?.[0]?.content || '');

    return {
      id: `word-level2-${word.language}-${word.content}`,
      type: 'reveal',
      prompt: `What does "${word.content}" mean?`,
      solution: `Correct: ${correctAnswer}\nIncorrect: ${wrongAnswers.join(', ')}`,
      level: 2,
      linguisticUnit,
      isRepeatable: true
    };
  }

  /**
   * Generates a level 0 free translation exercise for sentences.
   * Only generates for target language sentences (target → native translation).
   */
  static generateSentenceLevel0(sentence: SentenceData): Exercise {
    const linguisticUnit: LinguisticUnitData = {
      type: 'sentence',
      language: sentence.language,
      content: sentence.content,
      translations: sentence.translations,
      notes: sentence.notes
    };

    const translations = sentence.translations
      ?.map(t => t.content)
      .join(', ') || '';

    return {
      id: `sentence-level0-${sentence.language}-${sentence.content}`,
      type: 'free-translate',
      prompt: `Translate this sentence: "${sentence.content}"`,
      solution: `Translation: ${translations}`,
      level: 0,
      linguisticUnit,
      isRepeatable: false
    };
  }

  /**
   * Checks if a level 0 exercise can be generated for this word.
   */
  static canGenerateWordLevel0(): boolean {
    return true; // Always possible, eligibility checked in lesson generation
  }

  /**
   * Checks if a level 1 exercise can be generated for this word.
   */
  static canGenerateWordLevel1(word: WordData): boolean {
    return !!(word.translations && word.translations.length > 0);
  }

  /**
   * Checks if a level 2 exercise can be generated for this word.
   */
  static canGenerateWordLevel2(word: WordData): boolean {
    return !!(word.translations && word.translations.length > 0);
  }

  /**
   * Checks if a level 0 exercise can be generated for this sentence.
   * Only allows target language sentences (target → native translation).
   */
  static canGenerateSentenceLevel0(sentence: SentenceData): boolean {
    // Only generate for sentences that have translations
    if (!sentence.translations || sentence.translations.length === 0) {
      return false;
    }
    
    // For now, assume "apc" is target and "eng" is native
    // TODO: Get this from user language preferences
    const isTargetLanguage = sentence.language === 'apc';
    
    return isTargetLanguage;
  }
}
