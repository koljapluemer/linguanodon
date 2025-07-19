import { inject } from "vue";
import { wordRepoKey, linguisticUnitProgressRepoKey } from "@/shared/injectionKeys";
import type { WordData } from "@/entities/linguisticUnits/words/WordData";
import { fsrs } from "ts-fsrs";

/**
 * Composable for finding due words based on FSRS progress.
 */
export function useDueWords() {
  const wordRepo = inject(wordRepoKey);
  const linguisticUnitProgressRepo = inject(linguisticUnitProgressRepoKey);

  if (!wordRepo || !linguisticUnitProgressRepo) {
    throw new Error("Required repositories not provided!");
  }

  /**
   * Finds words that are due for practice at a specific level.
   */
  async function findDueWords(level: number): Promise<WordData[]> {
    const words = await wordRepo!.getAll();
    const progressData = await linguisticUnitProgressRepo!.getAll();
    
    const dueWords: WordData[] = [];
    const now = new Date();
    const scheduler = fsrs();

    for (const word of words) {
      const progress = progressData.find(p => 
        p.language === word.language && 
        p.content === word.content && 
        p.type === 'word'
      );

      if (!progress) {
        // New word - always due for level 0
        if (level === 0) {
          dueWords.push(word);
        }
        continue;
      }

      const card = progress.cards[level];
      if (!card) {
        // No card for this level - word is due
        dueWords.push(word);
        continue;
      }

      // Check if card is due - we just want to check if it's due, so we use a dummy rating
      const { card: updatedCard } = scheduler.next(card, now, 1);
      if (updatedCard.due <= now) {
        dueWords.push(word);
      }
    }

    return dueWords;
  }

  /**
   * Finds words that can generate exercises for a specific level.
   */
  async function findEligibleWords(level: number): Promise<WordData[]> {
    const words = await wordRepo!.getAll();
    
    return words.filter(word => {
      // Check if word has translations for the level
      if (!word.translations || word.translations.length === 0) {
        return false;
      }

      // Level-specific eligibility checks
      switch (level) {
        case 0:
          return true; // All words with translations can have level 0
        case 1:
        case 2:
          return word.translations.length >= 1; // Need at least one translation
        default:
          return false; // Higher levels not implemented yet
      }
    });
  }

  /**
   * Finds words that are both due and eligible for a specific level.
   */
  async function findDueAndEligibleWords(level: number): Promise<WordData[]> {
    const [dueWords, eligibleWords] = await Promise.all([
      findDueWords(level),
      findEligibleWords(level)
    ]);

    // Find intersection
    return dueWords.filter(dueWord => 
      eligibleWords.some(eligibleWord => 
        eligibleWord.language === dueWord.language && 
        eligibleWord.content === dueWord.content
      )
    );
  }

  return {
    findDueWords,
    findEligibleWords,
    findDueAndEligibleWords
  };
} 