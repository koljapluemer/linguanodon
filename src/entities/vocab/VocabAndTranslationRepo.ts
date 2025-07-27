import { VocabStorage } from './vocab/VocabStorage';
import { TranslationStorage } from './translations/TranslationStorage';
import type { VocabAndTranslationRepoContract, VocabPaginationResult } from './VocabAndTranslationRepoContract';
import type { VocabData } from './vocab/VocabData';
import type { TranslationData } from './translations/TranslationData';
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';
import { pickRandom } from '@/shared/arrayUtils';

export class VocabAndTranslationRepo implements VocabAndTranslationRepoContract {
  private vocabStorage = new VocabStorage();
  private translationStorage = new TranslationStorage();

  private ensureVocabFields(vocab: VocabData): VocabData {
    return {
      ...vocab,
      content: vocab.content || '',
      pronunciation: vocab.pronunciation || '',
      notes: vocab.notes || [],
      links: vocab.links || [],
      translations: vocab.translations || [],
      associatedTasks: vocab.associatedTasks || []
    };
  }

  async getVocab(): Promise<VocabData[]> {
    const vocab = await this.vocabStorage.getAll();
    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getVocabByUID(uid: string): Promise<VocabData | undefined> {
    const vocab = await this.vocabStorage.getById(uid);
    return vocab ? this.ensureVocabFields(vocab) : undefined;
  }

  async getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined> {
    const vocab = await this.vocabStorage.getByLanguageAndContent(language, content);
    return vocab ? this.ensureVocabFields(vocab) : undefined;
  }

  async getRandomAlreadySeenDueVocab(count: number): Promise<VocabData[]> {
    const allVocab = await this.vocabStorage.getAll();
    const now = new Date();
    
    const alreadySeenDueVocab = allVocab.filter(vocab => {
      // Must have been practiced before (reps > 0)
      const hasBeenPracticed = vocab.progress.reps > 0;
      // Must be due now
      const isDue = vocab.progress.due <= now;
      // Must not be excluded from practice
      const isNotExcluded = !vocab.doNotPractice;
      
      return hasBeenPracticed && isDue && isNotExcluded;
    });
    
    console.info(`Found ${alreadySeenDueVocab.length} already-seen due vocab items`);
    return pickRandom(alreadySeenDueVocab, count).map(v => this.ensureVocabFields(v));
  }

  async getRandomUnseenVocab(count: number): Promise<VocabData[]> {
    const allVocab = await this.vocabStorage.getAll();
    
    const unseenVocab = allVocab.filter(vocab => {
      // Check for null/undefined progress (shouldn't happen but handle gracefully)
      if (!vocab.progress) {
        console.warn('Found vocab with null/undefined progress:', vocab.id);
        return !vocab.doNotPractice; // Still filter by doNotPractice
      }
      
      // Never practiced before (reps === 0) and not excluded from practice
      const isUnseen = vocab.progress.reps === 0;
      const isNotExcluded = !vocab.doNotPractice;
      
      return isUnseen && isNotExcluded;
    });
    
    console.info(`Found ${unseenVocab.length} unseen vocab items`);
    return pickRandom(unseenVocab, count).map(v => this.ensureVocabFields(v));
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
    const now = new Date();
    
    const withoutPronunciation = allVocab.filter(vocab => {
      const hasNoPronunciation = !vocab.pronunciation || vocab.pronunciation.trim().length === 0;
      const hasPriority = (vocab.priority ?? 1) >= 2;
      const isNotExcluded = !vocab.doNotPractice;
      
      // Check if there's a pronunciation task that's not yet due
      const pronunciationTask = vocab.associatedTasks.find(task => task.taskType === 'add-pronunciation');
      const isTaskDue = !pronunciationTask || 
                       !pronunciationTask.nextShownEarliestAt || 
                       pronunciationTask.nextShownEarliestAt <= now;
      
      return hasNoPronunciation && hasPriority && isNotExcluded && isTaskDue;
    });
    
    if (withoutPronunciation.length === 0) return null;
    return pickRandom(withoutPronunciation, 1)[0];
  }

  async getTranslationsByIds(ids: string[]): Promise<TranslationData[]> {
    return await this.translationStorage.getByIds(ids);
  }

  async getVocabPaginated(cursor?: string, limit: number = 20, searchQuery?: string): Promise<VocabPaginationResult> {
    const allVocab = await this.vocabStorage.getAll();
    
    // Apply search filter if provided
    let filteredVocab = allVocab;
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredVocab = allVocab.filter(vocab => 
        vocab.content?.toLowerCase().includes(query) ||
        vocab.language.toLowerCase().includes(query) ||
        vocab.pronunciation?.toLowerCase().includes(query) ||
        (vocab.notes && vocab.notes.some(note => note.content.toLowerCase().includes(query)))
      );
    }

    // Sort by content for consistent cursor-based pagination
    filteredVocab.sort((a, b) => (a.content || '').localeCompare(b.content || ''));

    // Apply cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      startIndex = filteredVocab.findIndex(vocab => vocab.id === cursor);
      if (startIndex === -1) startIndex = 0;
      else startIndex += 1; // Start after the cursor
    }

    const endIndex = startIndex + limit;
    const paginatedVocab = filteredVocab.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredVocab.length;
    const nextCursor = hasMore && paginatedVocab.length > 0 ? paginatedVocab[paginatedVocab.length - 1].id : undefined;

    return {
      vocab: paginatedVocab.map(v => this.ensureVocabFields(v)),
      nextCursor,
      hasMore
    };
  }

  async getTotalVocabCount(searchQuery?: string): Promise<number> {
    if (!searchQuery || !searchQuery.trim()) {
      return await this.vocabStorage.count();
    }

    const allVocab = await this.vocabStorage.getAll();
    const query = searchQuery.toLowerCase().trim();
    const filteredVocab = allVocab.filter(vocab => 
      vocab.content?.toLowerCase().includes(query) ||
      vocab.language.toLowerCase().includes(query) ||
      vocab.pronunciation?.toLowerCase().includes(query) ||
      (vocab.notes && vocab.notes.some(note => note.content.toLowerCase().includes(query)))
    );
    
    return filteredVocab.length;
  }

  async saveVocab(vocab: Partial<VocabData>): Promise<VocabData> {
    const newVocab: VocabData = {
      id: vocab.id || crypto.randomUUID(),
      language: vocab.language || '',
      content: vocab.content || '',
      pronunciation: vocab.pronunciation || '',
      notes: vocab.notes || [],
      translations: vocab.translations || [],
      links: vocab.links || [],
      associatedTasks: vocab.associatedTasks || [],
      progress: vocab.progress || {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      }
    };

    await this.vocabStorage.add(newVocab);
    return newVocab;
  }

  async updateVocab(vocab: VocabData): Promise<void> {
    await this.vocabStorage.update(vocab);
  }

  async deleteVocab(id: string): Promise<void> {
    await this.vocabStorage.delete(id);
  }
}