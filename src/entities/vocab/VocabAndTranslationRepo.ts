import { VocabStorage } from './vocab/VocabStorage';
import { TranslationStorage } from './translations/TranslationStorage';
import type { VocabAndTranslationRepoContract } from './VocabAndTranslationRepoContract';
import type { VocabData } from './vocab/VocabData';
import type { TranslationData } from './translations/TranslationData';
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';
import { pickRandom } from '@/shared/arrayUtils';

export class VocabAndTranslationRepo implements VocabAndTranslationRepoContract {
  private vocabStorage = new VocabStorage();
  private translationStorage = new TranslationStorage();

  async getVocab(): Promise<VocabData[]> {
    return await this.vocabStorage.getAll();
  }

  async getVocabByUID(uid: string): Promise<VocabData | undefined> {
    return await this.vocabStorage.getById(uid);
  }

  async getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined> {
    return await this.vocabStorage.getByLanguageAndContent(language, content);
  }

  async getRandomDueVocab(count: number): Promise<VocabData[]> {
    const allVocab = await this.vocabStorage.getAll();
    const now = new Date();
    
    const dueVocab = allVocab.filter(vocab => {
      // Level -1 vocab is always due (new)
      if (vocab.progress.level === -1) return true;
      
      // Check if FSRS card is due
      return vocab.progress.due <= now;
    });
    
    return pickRandom(dueVocab, count);
  }

  async calculateMasteryLevelForVocab(id: string): Promise<number> {
    const vocab = await this.vocabStorage.getById(id);
    if (!vocab) return 0;
    
    // Map level -1 to 4 -> 0 to 100%
    const level = vocab.progress.level;
    if (level === -1) return 0;
    return Math.round((level / 4) * 100);
  }

  async scoreVocab(vocabId: string, rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): Promise<void> {
    const vocab = await this.vocabStorage.getById(vocabId);
    if (!vocab) return;

    const scheduler = fsrs();
    const now = new Date();
    
    // Map UI rating to FSRS rating
    const fsrsRating = rating === 'Impossible' ? Rating.Again : 
                      rating === 'Hard' ? Rating.Hard : 
                      rating === 'Doable' ? Rating.Good : Rating.Easy;

    // Handle level -1 (new vocab)
    if (vocab.progress.level === -1) {
      vocab.progress = {
        ...createEmptyCard(),
        streak: 0,
        level: 0
      };
    }

    // Apply FSRS algorithm
    const scheduling_cards = scheduler.repeat(vocab.progress, now);
    const updatedCard = scheduling_cards[fsrsRating].card;

    // Update streak and level
    if (fsrsRating === Rating.Again) {
      vocab.progress.streak = 0;
    } else {
      vocab.progress.streak++;
      // Level up at streak 1, reset streak
      if (vocab.progress.streak === 1 && vocab.progress.level < 4) {
        vocab.progress.level++;
        vocab.progress.streak = 0;
      }
    }

    // Apply FSRS card updates
    vocab.progress = {
      ...vocab.progress,
      ...updatedCard
    };

    await this.vocabStorage.update(vocab);
  }

  async addPronunciationToVocab(uid: string, pronunciation: string): Promise<void> {
    const vocab = await this.vocabStorage.getById(uid);
    if (!vocab) return;
    
    vocab.pronunciation = pronunciation;
    await this.vocabStorage.update(vocab);
  }

  async hasPronunciation(uid: string): Promise<boolean> {
    const vocab = await this.vocabStorage.getById(uid);
    return !!(vocab?.pronunciation && vocab.pronunciation.trim().length > 0);
  }

  async getRandomVocabWithMissingPronunciation(): Promise<VocabData | null> {
    const allVocab = await this.vocabStorage.getAll();
    const withoutPronunciation = allVocab.filter(vocab => 
      !vocab.pronunciation || vocab.pronunciation.trim().length === 0
    );
    
    if (withoutPronunciation.length === 0) return null;
    return pickRandom(withoutPronunciation, 1)[0];
  }

  async getTranslationsByIds(ids: string[]): Promise<TranslationData[]> {
    return await this.translationStorage.getByIds(ids);
  }
}