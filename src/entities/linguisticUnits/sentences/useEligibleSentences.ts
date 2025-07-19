import type { SentenceData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import { sentenceService, progressService } from "@/entities/linguisticUnits";

/**
 * Composable for finding eligible sentences for free translation exercises.
 */
export function useEligibleSentences() {

  /**
   * Finds sentences that are eligible for free translation exercises.
   * Criteria from spec:
   * - Sentence has no associated LinguisticUnitProgressData (not seen before)
   * - At least 60% of its contained words are mastered (levels 0-5 not due)
   */
  async function findEligibleSentences(): Promise<SentenceData[]> {
    const sentences = await sentenceService.getAll();
    const progressData = await progressService.getAll();
    
    const eligibleSentences: SentenceData[] = [];

    for (const sentence of sentences) {
      // Check if sentence has been seen before
      const sentenceProgress = progressData.find((p: LinguisticUnitProgressData) => 
        p.language === sentence.language && 
        p.content === sentence.content && 
        p.type === 'sentence'
      );

      if (sentenceProgress) {
        // Sentence has been seen before - not eligible for level 0
        continue;
      }

      // Check if sentence has translations
      if (!sentence.translations || sentence.translations.length === 0) {
        continue;
      }

      // Check mastery of contained words (simplified for now)
      // TODO: Implement proper word mastery checking based on sentence.containsWords
      const isEligible = true; // For now, assume all sentences are eligible

      if (isEligible) {
        eligibleSentences.push(sentence);
      }
    }

    return eligibleSentences;
  }

  /**
   * Finds sentences that are close to being eligible (for future lessons).
   */
  async function findNearEligibleSentences(): Promise<SentenceData[]> {
    const sentences = await sentenceService.getAll();
    const progressData = await progressService.getAll();
    
    const nearEligible: SentenceData[] = [];

    for (const sentence of sentences) {
      // Check if sentence has been seen before
      const sentenceProgress = progressData.find((p: LinguisticUnitProgressData) => 
        p.language === sentence.language && 
        p.content === sentence.content && 
        p.type === 'sentence'
      );

      if (sentenceProgress) {
        continue; // Already seen
      }

      // Check if sentence has translations
      if (!sentence.translations || sentence.translations.length === 0) {
        continue;
      }

      // For now, consider all unseen sentences with translations as near eligible
      nearEligible.push(sentence);
    }

    return nearEligible;
  }

  /**
   * Calculates the average progress of words in a sentence.
   */
  function calculateWordProgress(sentence: SentenceData, progressData: LinguisticUnitProgressData[]): number {
    // Find words that appear in this sentence
    const sentenceWords = progressData.filter(p => 
      p.type === 'word' && 
      sentence.content.toLowerCase().includes(p.content.toLowerCase())
    );

    if (sentenceWords.length === 0) {
      return 0; // No words found
    }

    // Calculate average progress based on card states
    let totalProgress = 0;
    for (const wordProgress of sentenceWords) {
      const cardCount = Object.keys(wordProgress.cards).length;
      if (cardCount > 0) {
        totalProgress += cardCount / 10; // Normalize to 0-1 range
      }
    }

    return totalProgress / sentenceWords.length;
  }

  return {
    findEligibleSentences,
    findNearEligibleSentences,
    calculateWordProgress
  };
} 