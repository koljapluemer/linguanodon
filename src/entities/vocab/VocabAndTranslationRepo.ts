import { VocabStorage } from './vocab/VocabStorage';
import { TranslationStorage } from './translations/TranslationStorage';
import type { VocabAndTranslationRepoContract, VocabPaginationResult } from './VocabAndTranslationRepoContract';
import type { VocabData } from './vocab/VocabData';
import type { TranslationData } from './translations/TranslationData';
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';
import { pickRandom } from '@/shared/arrayUtils';
import { isUnseen, isSeen } from './vocab/vocabUtils';

export class VocabAndTranslationRepo implements VocabAndTranslationRepoContract {
  private vocabStorage = new VocabStorage();
  private translationStorage = new TranslationStorage();

  private ensureVocabFields(vocab: VocabData): VocabData {
    return {
      ...vocab,
      content: vocab.content || '',
      notes: vocab.notes || [],
      links: vocab.links || [],
      translations: vocab.translations || [],
      tasks: vocab.tasks || []
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

  async getVocabByUIDs(uids: string[]): Promise<VocabData[]> {
    const vocabPromises = uids.map(uid => this.vocabStorage.getById(uid));
    const vocabResults = await Promise.all(vocabPromises);
    return vocabResults
      .filter((vocab): vocab is VocabData => vocab !== undefined)
      .map(v => this.ensureVocabFields(v));
  }

  async getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined> {
    const vocab = await this.vocabStorage.getByLanguageAndContent(language, content);
    return vocab ? this.ensureVocabFields(vocab) : undefined;
  }

  async getRandomAlreadySeenDueVocab(count: number): Promise<VocabData[]> {
    const allVocab = await this.vocabStorage.getAll();
    
    const alreadySeenDueVocab = allVocab.filter(vocab => {
      // Must have been seen before (level >= 0)
      const hasBeenSeen = isSeen(vocab);
      // Must be due now
      const isDue = vocab.progress.due <= new Date();
      // Must not be excluded from practice
      const isNotExcluded = !vocab.doNotPractice;
      
      return hasBeenSeen && isDue && isNotExcluded;
    });
    
    return pickRandom(alreadySeenDueVocab, count).map(v => this.ensureVocabFields(v));
  }

  async getRandomUnseenVocab(count: number): Promise<VocabData[]> {
    const allVocab = await this.vocabStorage.getAll();
    
    const unseenVocab = allVocab.filter(vocab => {
      // Check for null/undefined progress (shouldn't happen but handle gracefully)
      if (!vocab.progress) {
        console.warn('Found vocab with null/undefined progress:', vocab.uid);
        return !vocab.doNotPractice; // Still filter by doNotPractice
      }
      
      // Never seen before (level === -1) and not excluded from practice
      const vocabIsUnseen = isUnseen(vocab);
      const isNotExcluded = !vocab.doNotPractice;
      
      return vocabIsUnseen && isNotExcluded;
    });
    
    return pickRandom(unseenVocab, count).map(v => this.ensureVocabFields(v));
  }

  async getDueOrUnseenVocabFromIds(uids: string[]): Promise<VocabData[]> {
    const vocabList = await this.getVocabByUIDs(uids);
    
    return vocabList.filter(vocab => {
      // Must not be excluded from practice
      if (vocab.doNotPractice) {
        return false;
      }
      
      // Check for null/undefined progress (shouldn't happen but handle gracefully)
      if (!vocab.progress) {
        console.warn('Found vocab with null/undefined progress:', vocab.uid);
        return true; // Consider unseen if no progress
      }
      
      // Unseen: never seen before (level === -1)
      const vocabIsUnseen = isUnseen(vocab);
      
      // Due: has been seen and is due now
      const isDue = isSeen(vocab) && vocab.progress.due <= new Date();
      
      return vocabIsUnseen || isDue;
    });
  }


  async scoreVocab(vocabId: string, rating: Rating): Promise<void> {
    console.log(`VocabRepo.scoreVocab: Starting - vocabId: ${vocabId}, rating: ${rating}`);
    const vocab = await this.vocabStorage.getById(vocabId);
    if (!vocab) {
      console.log(`VocabRepo.scoreVocab: Vocab not found for ID: ${vocabId}`);
      return;
    }
    console.log(`VocabRepo.scoreVocab: Found vocab - content: "${vocab.content}", current level: ${vocab.progress.level}, current reps: ${vocab.progress.reps}`);

    const scheduler = fsrs();
    const fsrsRating = rating;

    // Handle level -1 (new vocab)
    if (vocab.progress.level === -1) {
      vocab.progress = {
        ...createEmptyCard(),
        streak: 0,
        level: 0
      };
    }

    // Apply FSRS algorithm
    const now = new Date();
    const scheduling_cards = scheduler.repeat(vocab.progress, now);
    
    // Get the appropriate card based on rating using Rating enum (exclude Manual rating)
    const updatedCard = scheduling_cards[fsrsRating as Exclude<Rating, Rating.Manual>].card;

    // Update streak and level based on rating
    if (fsrsRating === Rating.Again || fsrsRating === Rating.Hard) {
      // Negative ratings: decrease streak (go negative) or reset positive streak to 0
      if (vocab.progress.streak > 0) {
        vocab.progress.streak = 0;
      } else {
        vocab.progress.streak--;
      }
    } else {
      // Positive ratings (Doable/Easy): reset negative streak to 0, then increment positive
      if (vocab.progress.streak < 0) {
        vocab.progress.streak = 0;
      } else {
        vocab.progress.streak++;
        // Level up at streak 1, reset streak
        if (vocab.progress.streak === 1 && vocab.progress.level < 4) {
          vocab.progress.level++;
          vocab.progress.streak = 0;
        }
      }
    }

    // Apply FSRS card updates
    vocab.progress = {
      ...vocab.progress,
      ...updatedCard
    };

    await this.vocabStorage.update(vocab);
    console.log(`VocabRepo.scoreVocab: Successfully updated vocab ${vocabId} - new level: ${vocab.progress.level}, new reps: ${vocab.progress.reps}, new due: ${vocab.progress.due}`);
  }

  async updateLastReview(vocabId: string): Promise<void> {
    console.log(`VocabRepo.updateLastReview: Starting - vocabId: ${vocabId}`);
    const vocab = await this.vocabStorage.getById(vocabId);
    if (!vocab) {
      console.log(`VocabRepo.updateLastReview: Vocab not found for ID: ${vocabId}`);
      return;
    }
    console.log(`VocabRepo.updateLastReview: Found vocab - content: "${vocab.content}", current level: ${vocab.progress.level}, current last_review: ${vocab.progress.last_review}`);

    // Initialize FSRS card for new vocab
    if (vocab.progress.level === -1) {
      console.log(`VocabRepo.updateLastReview: Initializing FSRS card for new vocab ${vocabId}`);
      vocab.progress = {
        ...createEmptyCard(),
        streak: 0,
        level: 0
      };
      console.log(`VocabRepo.updateLastReview: Initialized FSRS card - new level: ${vocab.progress.level}, new reps: ${vocab.progress.reps}`);
    }

    // Always update last review time
    const newLastReview = new Date();
    vocab.progress.last_review = newLastReview;
    await this.vocabStorage.update(vocab);
    console.log(`VocabRepo.updateLastReview: Successfully updated vocab ${vocabId} - level: ${vocab.progress.level}, new last_review: ${newLastReview}`);
  }

  async addPronunciationToVocab(_uid: string, _pronunciation: string): Promise<void> {
    // Pronunciation is now handled as notes - this method will be deprecated
    // The pronunciation task should create a note instead
    console.warn('addPronunciationToVocab is deprecated - pronunciation should be added as notes');
    // Suppress unused parameter warnings with void operator
    void _uid;
    void _pronunciation;
  }

  async hasPronunciation(_uid: string): Promise<boolean> {
    // Since pronunciation is now handled as notes, we'll check if there are pronunciation notes
    // For now, return false to indicate no direct pronunciation field
    void _uid; // Suppress unused parameter warning
    return false;
  }

  async getRandomVocabWithMissingPronunciation(): Promise<VocabData | null> {
    const allVocab = await this.vocabStorage.getAll();
    
    const withoutPronunciation = allVocab.filter(vocab => {
      // Since pronunciation is now handled as notes, we'll check for pronunciation notes
      // For now, assume all vocab needs pronunciation (to be refined later)
      const hasNoPronunciation = true; // TODO: Check if vocab has pronunciation notes
      const hasPriority = (vocab.priority ?? 1) >= 2;
      const isNotExcluded = !vocab.doNotPractice;
      
      // TODO: Update to use TaskRepo to check for pronunciation tasks
      const isTaskDue = true; // For now, always allow
      
      return hasNoPronunciation && hasPriority && isNotExcluded && isTaskDue;
    });
    
    if (withoutPronunciation.length === 0) return null;
    return pickRandom(withoutPronunciation, 1)[0];
  }

  async getTranslationsByIds(ids: string[]): Promise<TranslationData[]> {
    return await this.translationStorage.getByIds(ids);
  }

  async getTranslationByContent(content: string): Promise<TranslationData | undefined> {
    return await this.translationStorage.getByContent(content);
  }

  async getVocabPaginated(cursor?: string, limit: number = 20, searchQuery?: string): Promise<VocabPaginationResult> {
    const allVocab = await this.vocabStorage.getAll();
    
    // Apply search filter if provided
    let filteredVocab = allVocab;
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredVocab = allVocab.filter(vocab => 
        vocab.content?.toLowerCase().includes(query) ||
        vocab.language.toLowerCase().includes(query)
      );
    }

    // Sort by content for consistent cursor-based pagination
    filteredVocab.sort((a, b) => (a.content || '').localeCompare(b.content || ''));

    // Apply cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      startIndex = filteredVocab.findIndex(vocab => vocab.uid === cursor);
      if (startIndex === -1) startIndex = 0;
      else startIndex += 1; // Start after the cursor
    }

    const endIndex = startIndex + limit;
    const paginatedVocab = filteredVocab.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredVocab.length;
    const nextCursor = hasMore && paginatedVocab.length > 0 ? paginatedVocab[paginatedVocab.length - 1].uid : undefined;

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
      vocab.language.toLowerCase().includes(query)
    );
    
    return filteredVocab.length;
  }

  async saveVocab(vocab: Omit<VocabData, 'uid' | 'progress' | 'tasks'>): Promise<VocabData> {
    const newVocab: VocabData = {
      uid: crypto.randomUUID(),
      language: vocab.language,
      content: vocab.content,
      priority: vocab.priority,
      doNotPractice: vocab.doNotPractice,
      notes: vocab.notes,
      translations: vocab.translations,
      links: vocab.links,
      origins: vocab.origins,
      tasks: [],
      progress: {
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

  // Distractor generation methods
  async getDueVocabInLanguage(language: string): Promise<VocabData[]> {
    const allVocab = await this.vocabStorage.getAll();
    
    return allVocab.filter(vocab => 
      vocab.language === language &&
      isSeen(vocab) &&
      vocab.progress.due <= new Date() &&
      !vocab.doNotPractice
    ).map(v => this.ensureVocabFields(v));
  }

  async getAllTranslationsInLanguage(language: string): Promise<TranslationData[]> {
    // Get all vocab in the language, then collect their translations
    const allVocab = await this.vocabStorage.getAll();
    const vocabInLanguage = allVocab.filter(vocab => vocab.language === language);
    
    const allTranslationIds = vocabInLanguage.flatMap(vocab => vocab.translations);
    const uniqueTranslationIds = [...new Set(allTranslationIds)];
    
    return await this.translationStorage.getByIds(uniqueTranslationIds);
  }

  async findVocabByTranslationContent(translationContent: string): Promise<VocabData[]> {
    // Find all translations with this content
    const allTranslations = await this.translationStorage.getAll();
    const matchingTranslations = allTranslations.filter(t => t.content === translationContent);
    
    if (matchingTranslations.length === 0) return [];
    
    // Find all vocab that use these translations
    const allVocab = await this.vocabStorage.getAll();
    const matchingTranslationIds = new Set(matchingTranslations.map(t => t.uid));
    
    return allVocab
      .filter(vocab => vocab.translations.some(id => matchingTranslationIds.has(id)))
      .map(v => this.ensureVocabFields(v));
  }

  async saveTranslation(translation: Omit<TranslationData, 'uid'>): Promise<TranslationData> {
    const translationToSave: TranslationData = {
      uid: crypto.randomUUID(),
      content: translation.content,
      notes: translation.notes
    };
    
    return await this.translationStorage.save(translationToSave);
  }

  async updateTranslation(translation: TranslationData): Promise<void> {
    await this.translationStorage.update(translation);
  }

  async deleteTranslations(ids: string[]): Promise<void> {
    await this.translationStorage.deleteByIds(ids);
  }

  async getDueVocabInLanguages(languages: string[]): Promise<VocabData[]> {
    const allVocab = await this.vocabStorage.getAll();
    
    return allVocab.filter(vocab => 
      languages.includes(vocab.language) &&
      isSeen(vocab) &&
      vocab.progress.due <= new Date() &&
      !vocab.doNotPractice
    ).map(v => this.ensureVocabFields(v));
  }

  async getRandomUnseenVocabInLanguages(languages: string[], count: number): Promise<VocabData[]> {
    const allVocab = await this.vocabStorage.getAll();
    
    const unseenVocab = allVocab.filter(vocab => 
      languages.includes(vocab.language) &&
      isUnseen(vocab) &&
      !vocab.doNotPractice
    ).map(v => this.ensureVocabFields(v));
    
    // Shuffle and return requested count
    const shuffled = unseenVocab.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

}