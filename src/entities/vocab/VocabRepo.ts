import Dexie, { type Table } from 'dexie';
import type { VocabRepoContract, VocabPaginationResult } from './VocabRepoContract';
import type { VocabData } from './vocab/VocabData';
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';
import { pickRandom, shuffleArray } from '@/shared/arrayUtils';
import { levenshteinDistance, isLengthWithinRange } from '@/shared/stringUtils';

// Utility functions
function isUnseen(vocab: VocabData): boolean {
  return vocab.progress.level === -1;
}

function isSeen(vocab: VocabData): boolean {
  return vocab.progress.level >= 0;
}

class VocabDatabase extends Dexie {
  vocab!: Table<VocabData>;

  constructor() {
    super('VocabDatabase');
    this.version(1).stores({
      vocab: 'uid, language, content, *origins, [language+content]'
    });
  }
}

const vocabDb = new VocabDatabase();

export class VocabRepo implements VocabRepoContract {

  private ensureVocabFields(vocab: VocabData): VocabData {
    return {
      ...vocab,
      content: vocab.content || '',
      length: vocab.length || 'not-specified',
      notes: vocab.notes || [],
      links: vocab.links || [],
      translations: vocab.translations || [],
      relatedVocab: vocab.relatedVocab || [],
      notRelatedVocab: vocab.notRelatedVocab || []
    };
  }

  async getVocab(): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab.toArray();
    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getVocabByUID(uid: string): Promise<VocabData | undefined> {
    const vocab = await vocabDb.vocab.get(uid);
    return vocab ? this.ensureVocabFields(vocab) : undefined;
  }

  async getVocabByUIDs(uids: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab.where('uid').anyOf(uids).toArray();
    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined> {
    const vocab = await vocabDb.vocab.where({ language, content }).first();
    return vocab ? this.ensureVocabFields(vocab) : undefined;
  }

  async getRandomAlreadySeenDueVocab(count: number): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .filter(vocab => 
        isSeen(vocab) &&
        vocab.progress.due <= new Date() &&
        !vocab.doNotPractice
      )
      .toArray();
    
    return pickRandom(vocab, count).map(v => this.ensureVocabFields(v));
  }

  async getRandomUnseenVocab(count: number): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .filter(vocab => {
        if (!vocab.progress) {
          console.warn('Found vocab with null/undefined progress:', vocab.uid);
          return !vocab.doNotPractice;
        }
        return isUnseen(vocab) && !vocab.doNotPractice;
      })
      .toArray();
    
    return pickRandom(vocab, count).map(v => this.ensureVocabFields(v));
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
    const vocab = await vocabDb.vocab.get(vocabId);
    if (!vocab) {
      return;
    }

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

    await vocabDb.vocab.put(vocab);
  }

  async updateLastReview(vocabId: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(vocabId);
    if (!vocab) {
      return;
    }

    // Initialize FSRS card for new vocab
    if (vocab.progress.level === -1) {
      vocab.progress = {
        ...createEmptyCard(),
        streak: 0,
        level: 0
      };
    }

    // Always update last review time
    const newLastReview = new Date();
    vocab.progress.last_review = newLastReview;
    await vocabDb.vocab.put(vocab);
  }

  async addPronunciationToVocab(_uid: string, _pronunciation: string): Promise<void> {
    // Pronunciation is now handled as notes - this method will be deprecated
    // The pronunciation task should create a note instead
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
    const allVocab = await vocabDb.vocab.toArray();
    
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

  async getVocabPaginated(cursor?: string, limit: number = 20, searchQuery?: string): Promise<VocabPaginationResult> {
    const allVocab = await vocabDb.vocab.toArray();
    
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
      return await vocabDb.vocab.count();
    }

    const allVocab = await vocabDb.vocab.toArray();
    const query = searchQuery.toLowerCase().trim();
    const filteredVocab = allVocab.filter(vocab => 
      vocab.content?.toLowerCase().includes(query) ||
      vocab.language.toLowerCase().includes(query)
    );
    
    return filteredVocab.length;
  }

  async saveVocab(vocab: Omit<VocabData, 'uid' | 'progress'>): Promise<VocabData> {
    const newVocab: VocabData = {
      uid: crypto.randomUUID(),
      language: vocab.language,
      content: vocab.content,
      length: vocab.length,
      priority: vocab.priority,
      doNotPractice: vocab.doNotPractice,
      notes: vocab.notes,
      translations: vocab.translations,
      links: vocab.links,
      origins: vocab.origins,
      relatedVocab: vocab.relatedVocab || [],
      notRelatedVocab: vocab.notRelatedVocab || [],
      progress: {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      }
    };

    await vocabDb.vocab.add(newVocab);
    return newVocab;
  }

  async updateVocab(vocab: VocabData): Promise<void> {
    await vocabDb.vocab.put(vocab);
  }

  async deleteVocab(id: string): Promise<void> {
    await vocabDb.vocab.delete(id);
  }

  async getDueVocabInLanguage(language: string): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('language')
      .equals(language)
      .filter(vocab => 
        isSeen(vocab) &&
        vocab.progress.due <= new Date() &&
        !vocab.doNotPractice
      )
      .toArray();
    
    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getDueVocabInLanguages(languages: string[], setsToAvoid?: string[]): Promise<VocabData[]> {
    let query = vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab => 
        isSeen(vocab) &&
        vocab.progress.due <= new Date() &&
        !vocab.doNotPractice
      );

    // Database-level filtering for set avoidance
    if (setsToAvoid && setsToAvoid.length > 0) {
      query = query.filter(vocab => 
        !vocab.origins.some(origin => setsToAvoid.includes(origin))
      );
    }
    
    const vocab = await query.toArray();
    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getRandomUnseenVocabInLanguages(languages: string[], count: number, setsToAvoid?: string[]): Promise<VocabData[]> {
    let query = vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab => 
        isUnseen(vocab) &&
        !vocab.doNotPractice
      );

    // Database-level filtering for set avoidance
    if (setsToAvoid && setsToAvoid.length > 0) {
      query = query.filter(vocab => 
        !vocab.origins.some(origin => setsToAvoid.includes(origin))
      );
    }
    
    const vocab = await query.toArray();
    const ensuredVocab = vocab.map(v => this.ensureVocabFields(v));
    
    // Shuffle and return requested count
    const shuffled = ensuredVocab.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  async addRelatedVocab(uid: string, relatedVocabUid: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(uid);
    if (!vocab) return;
    
    const relatedVocab = vocab.relatedVocab || [];
    if (!relatedVocab.includes(relatedVocabUid)) {
      relatedVocab.push(relatedVocabUid);
      vocab.relatedVocab = relatedVocab;
      await vocabDb.vocab.put(vocab);
    }
  }

  async removeRelatedVocab(uid: string, relatedVocabUid: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(uid);
    if (!vocab) return;
    
    const relatedVocab = vocab.relatedVocab || [];
    const index = relatedVocab.indexOf(relatedVocabUid);
    if (index > -1) {
      relatedVocab.splice(index, 1);
      vocab.relatedVocab = relatedVocab;
      await vocabDb.vocab.put(vocab);
    }
  }

  async addNotRelatedVocab(uid: string, notRelatedVocabUid: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(uid);
    if (!vocab) return;
    
    const notRelatedVocab = vocab.notRelatedVocab || [];
    if (!notRelatedVocab.includes(notRelatedVocabUid)) {
      notRelatedVocab.push(notRelatedVocabUid);
      vocab.notRelatedVocab = notRelatedVocab;
      await vocabDb.vocab.put(vocab);
    }
  }

  async removeNotRelatedVocab(uid: string, notRelatedVocabUid: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(uid);
    if (!vocab) return;
    
    const notRelatedVocab = vocab.notRelatedVocab || [];
    const index = notRelatedVocab.indexOf(notRelatedVocabUid);
    if (index > -1) {
      notRelatedVocab.splice(index, 1);
      vocab.notRelatedVocab = notRelatedVocab;
      await vocabDb.vocab.put(vocab);
    }
  }

  async findVocabByTranslationUids(language: string, translationUids: string[]): Promise<VocabData | undefined> {
    if (translationUids.length === 0) return undefined;
    
    const vocab = await vocabDb.vocab
      .where('language')
      .equals(language)
      .filter(vocab => {
        // Check if ALL translation UIDs are present in this vocab's translations
        return translationUids.every(uid => vocab.translations.includes(uid));
      })
      .first();
      
    return vocab ? this.ensureVocabFields(vocab) : undefined;
  }

  private async findIdealWrongVocab(targetLanguage: string, correctVocabContent: string): Promise<string | null> {
    const dueVocab = await this.getDueVocabInLanguage(targetLanguage);
    
    const idealCandidates = dueVocab.filter(vocab => {
      if (!vocab.content || vocab.content === correctVocabContent) return false;
      
      if (!isLengthWithinRange(vocab.content, correctVocabContent.length, 3)) {
        return false;
      }
      
      return levenshteinDistance(vocab.content, correctVocabContent) > 2;
    });
    
    if (idealCandidates.length > 0) {
      const shuffled = shuffleArray(idealCandidates);
      return shuffled[0].content!;
    }
    
    return null;
  }

  private async getFallbackWrongVocab(targetLanguage: string, correctVocabContent: string): Promise<string | null> {
    const allVocab = await vocabDb.vocab
      .where('language')
      .equals(targetLanguage)
      .toArray();
    
    const candidates = allVocab.filter(vocab => 
      vocab.content && vocab.content !== correctVocabContent
    );
    
    if (candidates.length > 0) {
      const shuffled = shuffleArray(candidates);
      return shuffled[0].content!;
    }
    
    return null;
  }

  async generateWrongVocabs(targetLanguage: string, correctVocabContent: string, count: number): Promise<string[]> {
    const wrongAnswers: string[] = [];
    const usedAnswers = new Set([correctVocabContent]);
    
    for (let i = 0; i < count; i++) {
      const idealWrong = await this.findIdealWrongVocab(targetLanguage, correctVocabContent);
      if (idealWrong && !usedAnswers.has(idealWrong)) {
        wrongAnswers.push(idealWrong);
        usedAnswers.add(idealWrong);
      }
    }
    
    while (wrongAnswers.length < count) {
      const fallbackWrong = await this.getFallbackWrongVocab(targetLanguage, correctVocabContent);
      if (fallbackWrong && !usedAnswers.has(fallbackWrong)) {
        wrongAnswers.push(fallbackWrong);
        usedAnswers.add(fallbackWrong);
      } else {
        break;
      }
    }
    
    return wrongAnswers;
  }

  async getUnseenVocabByIds(vocabIds: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('uid')
      .anyOf(vocabIds)
      .toArray();
    
    return vocab
      .map(v => this.ensureVocabFields(v))
      .filter(v => isUnseen(v));
  }

  async getDueVocabByIds(vocabIds: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('uid')
      .anyOf(vocabIds)
      .toArray();
    
    return vocab
      .map(v => this.ensureVocabFields(v))
      .filter(v => isSeen(v) && v.progress.due && v.progress.due <= new Date());
  }
}