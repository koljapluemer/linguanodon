import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import { levenshteinDistance, isLengthWithinRange } from '@/shared/stringUtils';
import { shuffleArray } from '@/shared/arrayUtils';

export class DistractorGenerator {
  constructor(private vocabRepo: VocabAndTranslationRepoContract) {}

  /**
   * Find ideal wrong translation for vocab-to-translation exercises
   */
  async findIdealWrongTranslation(
    targetVocab: VocabData,
    correctTranslations: TranslationData[],
    correctAnswer: string
  ): Promise<string | null> {
    const dueVocab = await this.vocabRepo.getDueVocabInLanguage(targetVocab.language);
    
    // Get candidate wrong translations
    const candidateTranslations: TranslationData[] = [];
    
    for (const vocab of dueVocab) {
      if (vocab.uid === targetVocab.uid) continue; // Skip target vocab
      
      const vocabTranslations = await this.vocabRepo.getTranslationsByIds(vocab.translations);
      candidateTranslations.push(...vocabTranslations);
    }
    
    // Filter for ideal candidates
    const idealCandidates = candidateTranslations.filter(translation => {
      // Must be within length range (±3)
      if (!isLengthWithinRange(translation.content, correctAnswer.length, 3)) {
        return false;
      }
      
      // Must have distance > 2 from all correct translations
      const minDistance = Math.min(
        ...correctTranslations.map(ct => levenshteinDistance(translation.content, ct.content))
      );
      
      return minDistance > 2;
    });
    
    if (idealCandidates.length > 0) {
      const shuffled = shuffleArray(idealCandidates);
      return shuffled[0].content;
    }
    
    return null;
  }

  /**
   * Find ideal wrong vocab content for translation-to-vocab exercises
   */
  async findIdealWrongVocab(
    targetLanguage: string,
    correctVocabContent: string
  ): Promise<string | null> {
    const dueVocab = await this.vocabRepo.getDueVocabInLanguage(targetLanguage);
    
    // Filter for ideal candidates
    const idealCandidates = dueVocab.filter(vocab => {
      if (!vocab.content || vocab.content === correctVocabContent) return false;
      
      // Must be within length range (±3)
      if (!isLengthWithinRange(vocab.content, correctVocabContent.length, 3)) {
        return false;
      }
      
      // Must have distance > 2
      return levenshteinDistance(vocab.content, correctVocabContent) > 2;
    });
    
    if (idealCandidates.length > 0) {
      const shuffled = shuffleArray(idealCandidates);
      return shuffled[0].content!;
    }
    
    return null;
  }

  /**
   * Get fallback wrong translation (any from same language)
   */
  async getFallbackWrongTranslation(
    targetVocab: VocabData,
    correctTranslations: TranslationData[]
  ): Promise<string | null> {
    const allTranslations = await this.vocabRepo.getAllTranslationsInLanguage(targetVocab.language);
    const correctContents = new Set(correctTranslations.map(t => t.content));
    
    const candidates = allTranslations.filter(t => !correctContents.has(t.content));
    
    if (candidates.length > 0) {
      const shuffled = shuffleArray(candidates);
      return shuffled[0].content;
    }
    
    return null;
  }

  /**
   * Get fallback wrong vocab content (any from same language)
   */
  async getFallbackWrongVocab(
    targetLanguage: string,
    correctVocabContent: string
  ): Promise<string | null> {
    const dueVocab = await this.vocabRepo.getDueVocabInLanguage(targetLanguage);
    
    const candidates = dueVocab.filter(vocab => 
      vocab.content && vocab.content !== correctVocabContent
    );
    
    if (candidates.length > 0) {
      const shuffled = shuffleArray(candidates);
      return shuffled[0].content!;
    }
    
    return null;
  }

  /**
   * Generate wrong answers for vocab-to-translation choice exercises
   */
  async generateWrongTranslations(
    targetVocab: VocabData,
    correctTranslations: TranslationData[],
    correctAnswer: string,
    count: number
  ): Promise<string[]> {
    const wrongAnswers: string[] = [];
    const usedAnswers = new Set([correctAnswer]);
    
    // Try to find ideal wrong answers first
    for (let i = 0; i < count; i++) {
      const idealWrong = await this.findIdealWrongTranslation(targetVocab, correctTranslations, correctAnswer);
      if (idealWrong && !usedAnswers.has(idealWrong)) {
        wrongAnswers.push(idealWrong);
        usedAnswers.add(idealWrong);
      }
    }
    
    // Fill remaining with fallback answers
    while (wrongAnswers.length < count) {
      const fallbackWrong = await this.getFallbackWrongTranslation(targetVocab, correctTranslations);
      if (fallbackWrong && !usedAnswers.has(fallbackWrong)) {
        wrongAnswers.push(fallbackWrong);
        usedAnswers.add(fallbackWrong);
      } else {
        break; // No more candidates available
      }
    }
    
    return wrongAnswers;
  }

  /**
   * Generate wrong answers for translation-to-vocab choice exercises
   */
  async generateWrongVocabs(
    targetLanguage: string,
    correctVocabContent: string,
    count: number
  ): Promise<string[]> {
    const wrongAnswers: string[] = [];
    const usedAnswers = new Set([correctVocabContent]);
    
    // Try to find ideal wrong answers first
    for (let i = 0; i < count; i++) {
      const idealWrong = await this.findIdealWrongVocab(targetLanguage, correctVocabContent);
      if (idealWrong && !usedAnswers.has(idealWrong)) {
        wrongAnswers.push(idealWrong);
        usedAnswers.add(idealWrong);
      }
    }
    
    // Fill remaining with fallback answers
    while (wrongAnswers.length < count) {
      const fallbackWrong = await this.getFallbackWrongVocab(targetLanguage, correctVocabContent);
      if (fallbackWrong && !usedAnswers.has(fallbackWrong)) {
        wrongAnswers.push(fallbackWrong);
        usedAnswers.add(fallbackWrong);
      } else {
        break; // No more candidates available
      }
    }
    
    return wrongAnswers;
  }
}