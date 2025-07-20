import type { WordData, SentenceData } from "@/entities/linguisticUnits";
import type { Exercise } from "../Exercise";
import type { ExerciseGenerationContext } from "./ExerciseGeneratorInterface";
import { wordService, sentenceService } from "@/entities/linguisticUnits";

/**
 * Exercise generator for finding and creating missing translation exercises.
 * Finds linguistic units that are missing translations in user's languages.
 */
export class MissingTranslationExerciseGenerator {
  
  /**
   * Find words missing translations and generate exercises.
   * For native language words: missing translations in ANY target language
   * For target language words: missing translations in ALL native languages
   */
  static async findMissingTranslationExercises(
    context: ExerciseGenerationContext
  ): Promise<Exercise[]> {
    const exercises: Exercise[] = [];
    
    // Get all words
    const allWords = await wordService.getAll();
    
    for (const word of allWords) {
      const exercise = await this.createMissingTranslationExerciseForWord(word, context);
      if (exercise) {
        exercises.push(exercise);
      }
    }
    
    // Get all sentences
    const allSentences = await sentenceService.getAll();
    
    for (const sentence of allSentences) {
      const exercise = await this.createMissingTranslationExerciseForSentence(sentence, context);
      if (exercise) {
        exercises.push(exercise);
      }
    }
    
    return exercises;
  }
  
  /**
   * Create missing translation exercise for a word.
   */
  private static async createMissingTranslationExerciseForWord(
    word: WordData,
    context: ExerciseGenerationContext
  ): Promise<Exercise | null> {
    const isTargetLanguage = context.targetLanguages.includes(word.language);
    const isNativeLanguage = context.nativeLanguages.includes(word.language);
    
    if (!isTargetLanguage && !isNativeLanguage) {
      return null; // Word is not in user's languages
    }
    
    let missingLanguages: string[] = [];
    
    if (isTargetLanguage) {
      // For target language words: check if missing translations in ALL native languages
      const existingNativeTranslations = word.translations
        ?.filter(t => context.nativeLanguages.includes(t.language))
        .map(t => t.language) || [];
      
      missingLanguages = context.nativeLanguages.filter(
        nativeLang => !existingNativeTranslations.includes(nativeLang)
      );
      
      if (missingLanguages.length === 0) {
        return null; // Has translations in all native languages
      }
    } else {
      // For native language words: check if missing translations in ANY target language
      const existingTargetTranslations = word.translations
        ?.filter(t => context.targetLanguages.includes(t.language))
        .map(t => t.language) || [];
      
      missingLanguages = context.targetLanguages.filter(
        targetLang => !existingTargetTranslations.includes(targetLang)
      );
      
      if (missingLanguages.length === 0) {
        return null; // Has translations in all target languages
      }
    }
    
    // Create exercise
    const exercise: Exercise = {
      id: `missing-translation-word-${word.language}-${word.content}`,
      type: 'missing-translation',
      level: 0,
      linguisticUnit: {
        type: 'word',
        language: word.language,
        content: word.content,
        translations: word.translations,
        notes: word.notes
      },
      isRepeatable: false,
      missingLanguages,
      prompt: isTargetLanguage 
        ? `Add a translation for "${word.content}" in one of your native languages`
        : `Add a translation for "${word.content}" in one of your target languages`
    };
    
    return exercise;
  }
  
  /**
   * Create missing translation exercise for a sentence.
   */
  private static async createMissingTranslationExerciseForSentence(
    sentence: SentenceData,
    context: ExerciseGenerationContext
  ): Promise<Exercise | null> {
    const isTargetLanguage = context.targetLanguages.includes(sentence.language);
    const isNativeLanguage = context.nativeLanguages.includes(sentence.language);
    
    if (!isTargetLanguage && !isNativeLanguage) {
      return null; // Sentence is not in user's languages
    }
    
    let missingLanguages: string[] = [];
    
    if (isTargetLanguage) {
      // For target language sentences: check if missing translations in ALL native languages
      const existingNativeTranslations = sentence.translations
        ?.filter(t => context.nativeLanguages.includes(t.language))
        .map(t => t.language) || [];
      
      missingLanguages = context.nativeLanguages.filter(
        nativeLang => !existingNativeTranslations.includes(nativeLang)
      );
      
      if (missingLanguages.length === 0) {
        return null; // Has translations in all native languages
      }
    } else {
      // For native language sentences: check if missing translations in ANY target language
      const existingTargetTranslations = sentence.translations
        ?.filter(t => context.targetLanguages.includes(t.language))
        .map(t => t.language) || [];
      
      missingLanguages = context.targetLanguages.filter(
        targetLang => !existingTargetTranslations.includes(targetLang)
      );
      
      if (missingLanguages.length === 0) {
        return null; // Has translations in all target languages
      }
    }
    
    // Create exercise
    const exercise: Exercise = {
      id: `missing-translation-sentence-${sentence.language}-${sentence.content}`,
      type: 'missing-translation',
      level: 0,
      linguisticUnit: {
        type: 'sentence',
        language: sentence.language,
        content: sentence.content,
        translations: sentence.translations,
        notes: sentence.notes
      },
      isRepeatable: false,
      missingLanguages,
      prompt: isTargetLanguage 
        ? `Add a translation for "${sentence.content}" in one of your native languages`
        : `Add a translation for "${sentence.content}" in one of your target languages`
    };
    
    return exercise;
  }
} 