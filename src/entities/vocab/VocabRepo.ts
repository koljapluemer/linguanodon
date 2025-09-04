import Dexie, { type Table } from 'dexie';
import type { VocabRepoContract, VocabPaginationResult } from './VocabRepoContract';
import type { VocabData, VocabImage, VocabSound } from './VocabData';
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';
import { pickRandom, shuffleArray } from '@/shared/utils/arrayUtils';
import { levenshteinDistance, isLengthWithinRange } from '@/shared/utils/stringUtils';
import { compressImage, compressImageFromUrl } from '@/shared/utils/imageUtils';
import { validateAudioFile, getAudioDuration, fetchAudioAsBlob } from '@/shared/utils/audioUtils';
import { toRaw } from 'vue';

// Utility functions
function isUnseen(vocab: VocabData): boolean {
  return vocab.progress.level === -1;
}


class VocabDatabase extends Dexie {
  vocab!: Table<VocabData>;

  constructor() {
    super('VocabDatabase');
    this.version(1).stores({
      vocab: 'uid, language, content, *origins, [language+content]'
    });
    this.version(2).stores({
      vocab: 'uid, language, content, *origins, [language+content], progress.due'
    });
    this.version(3).stores({
      vocab: 'uid, language, content, *origins, [language+content], progress.due, hasImage, hasSound'
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
      notRelatedVocab: vocab.notRelatedVocab || [],
      images: vocab.images || [],
      sound: vocab.sound || undefined
    };
  }

  async getVocab(): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab.toArray();
    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getVocabByUID(uid: string): Promise<VocabData | undefined> {
    const vocab = await vocabDb.vocab.get(uid);
    if (vocab) {
      return this.ensureVocabFields(vocab);
    }
    return undefined;
  }

  async getVocabByUIDs(uids: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab.where('uid').anyOf(uids).toArray();
    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined> {
    const vocab = await vocabDb.vocab.where({ language, content }).first();
    return vocab ? this.ensureVocabFields(vocab) : undefined;
  }

  async getRandomAlreadySeenDueVocab(count: number, languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab =>
        vocab.progress.level >= 0 &&
        vocab.progress.due <= new Date() &&
        !vocab.doNotPractice &&
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
      )
      .toArray();

    return pickRandom(vocab, count).map(v => this.ensureVocabFields(v));
  }

  async getRandomUnseenVocab(count: number, languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab => {
        if (!vocab.progress) {
          console.warn('Found vocab with null/undefined progress:', vocab.uid);
          return !vocab.doNotPractice && (!vocabBlockList || !vocabBlockList.includes(vocab.uid));
        }
        return isUnseen(vocab) && !vocab.doNotPractice && (!vocabBlockList || !vocabBlockList.includes(vocab.uid));
      })
      .toArray();

    return pickRandom(vocab, count).map(v => this.ensureVocabFields(v));
  }

  async getRandomUnseenSentenceVocab(count: number, languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab => {
        // Must be sentence type
        if (vocab.length !== 'sentence') {
          return false;
        }
        
        // Must have content and at least one translation
        if (!vocab.content || !vocab.translations || vocab.translations.length === 0) {
          return false;
        }

        if (!vocab.progress) {
          console.warn('Found vocab with null/undefined progress:', vocab.uid);
          return !vocab.doNotPractice && (!vocabBlockList || !vocabBlockList.includes(vocab.uid));
        }
        return isUnseen(vocab) && !vocab.doNotPractice && (!vocabBlockList || !vocabBlockList.includes(vocab.uid));
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
      const isDue = vocab.progress.level >= 0 && vocab.progress.due <= new Date();

      return vocabIsUnseen || isDue;
    });
  }

  async scoreVocab(vocabId: string, rating: Rating, setWrongVocabDueAgainImmediately?: boolean): Promise<void> {
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

    // If immediateDue is true and rating was low (Again/Hard), make it due now
    if (setWrongVocabDueAgainImmediately && (fsrsRating === Rating.Again || fsrsRating === Rating.Hard)) {
      vocab.progress.due = new Date();
    }

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

  async getRandomVocabWithMissingPronunciation(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .and(vocab => 
        vocab.length !== 'sentence' &&
        !vocab.doNotPractice &&
        (vocab.priority ?? 1) >= 2
      )
      .toArray();

    const withoutPronunciation = vocab.filter(vocab => {
      // Since pronunciation is now handled as notes, we'll check for pronunciation notes
      // For now, assume all vocab needs pronunciation (to be refined later)
      const hasNoPronunciation = true; // TODO: Check if vocab has pronunciation notes
      const isNotBlocked = !vocabBlockList || !vocabBlockList.includes(vocab.uid);
      return hasNoPronunciation && isNotBlocked;
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
      isPicturable: vocab.isPicturable,
      images: vocab.images || [],
      hasImage: (vocab.images && vocab.images.length > 0) || false,
      sound: vocab.sound,
      hasSound: !!vocab.sound,
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
    
    // Set hasImage and hasSound based on actual data
    vocab.hasImage = vocab.images && vocab.images.length > 0;
    vocab.hasSound = !!vocab.sound;
    
    await vocabDb.vocab.put(vocab);
  }

  async deleteVocab(id: string): Promise<void> {
    await vocabDb.vocab.delete(id);
  }

  async getDueVocabInLanguage(language: string, vocabBlockList?: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('language')
      .equals(language)
      .filter(vocab =>
        vocab.progress.level >= 0 &&
        vocab.progress.due <= new Date() &&
        !vocab.doNotPractice &&
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
      )
      .toArray();

    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getDueNonSentenceVocabInLanguage(language: string, vocabBlockList?: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('language')
      .equals(language)
      .filter(vocab =>
        vocab.progress.level >= 0 &&
        vocab.progress.due <= new Date() &&
        !vocab.doNotPractice &&
        vocab.length !== 'sentence' && // Exclude sentence-length vocab
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
      )
      .toArray();

    return vocab.map(v => this.ensureVocabFields(v));
  }

  async getDueNonSentenceVocabPairsInLanguage(language: string, minPairs: number = 2, vocabBlockList?: string[]): Promise<VocabData[]> {
    const vocab = await this.getDueNonSentenceVocabInLanguage(language, vocabBlockList);
    
    // Return at least enough vocab to form the minimum number of pairs
    // For form-sentence tasks, we need at least 2 vocab items
    return vocab.length >= minPairs ? vocab : [];
  }

  async getDueVocabInLanguages(languages: string[], setsToAvoid?: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    let query = vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab =>
        vocab.progress.level >= 0 &&
        vocab.progress.due <= new Date() &&
        !vocab.doNotPractice &&
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
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

  async getRandomUnseenVocabInLanguages(languages: string[], count: number, setsToAvoid?: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    let query = vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab =>
        isUnseen(vocab) &&
        !vocab.doNotPractice &&
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
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

  async getRandomUnseenVocabWithContentAndTranslations(languages: string[], count: number, setsToAvoid?: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    let query = vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab =>
        isUnseen(vocab) &&
        !vocab.doNotPractice &&
        !!vocab.content && // Must have content
        vocab.content.trim() !== '' && // Content must not be empty
        !!vocab.translations && // Must have translations array
        vocab.translations.length > 0 && // Must have at least one translation
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
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
    const now = new Date();
    const dueVocab = await vocabDb.vocab
      .where('language').equals(targetLanguage)
      .and(vocab => vocab.length !== 'sentence')
      .and(vocab => vocab.content !== correctVocabContent)
      .and(vocab => vocab.progress && vocab.progress.level >= 0)
      .and(vocab => vocab.progress.due && new Date(vocab.progress.due) <= now)
      .toArray();

    const idealCandidates = dueVocab.filter(vocab => {
      if (!vocab.content) return false;

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
    // Query all vocab excluding sentences and the correct answer
    const candidates = await vocabDb.vocab
      .where('language').equals(targetLanguage)
      .and(vocab => vocab.length !== 'sentence')
      .and(vocab => vocab.content !== correctVocabContent)
      .and(vocab => !!vocab.content)
      .toArray();

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
      .filter(v => v.progress.level >= 0 && v.progress.due && v.progress.due <= new Date());
  }

  async getRandomVocabWithNoTranslationsInLanguages(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(v => 
        !v.doNotPractice && 
        (!!v.content && (v.translations?.length ?? 0) === 0) &&
        (!vocabBlockList || !vocabBlockList.includes(v.uid))
      )
      .toArray();
    if (vocab.length === 0) return null;
    const ensured = vocab.map(v => this.ensureVocabFields(v));
    const shuffled = ensured.sort(() => Math.random() - 0.5);
    return shuffled[0];
  }

  async getVocabWithLowestDueDate(count: number, languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    // Use the indexed progress.due field for efficient sorting
    const vocab = await vocabDb.vocab
      .orderBy('progress.due')
      .filter(v =>
        languages.includes(v.language) &&
        !v.doNotPractice &&
        !!v.content &&
        v.translations &&
        v.translations.length > 0 &&
        v.progress.level >= 0 &&
        (!vocabBlockList || !vocabBlockList.includes(v.uid))
      )
      .limit(count)
      .toArray();

    return vocab.map(v => this.ensureVocabFields(v));
  }

  async updateVocabLastSeenAndDueDate(vocabIds: string[], dueDate: Date): Promise<void> {
    const now = new Date();

    for (const vocabId of vocabIds) {
      const vocab = await vocabDb.vocab.get(vocabId);
      if (!vocab) continue;

      // Update last_review to now and due date to specified time
      vocab.progress.last_review = now;
      vocab.progress.due = dueDate;

      await vocabDb.vocab.put(vocab);
    }
  }

  async getDueSentenceVocabWithMaxLevel(languages: string[], maxLevel: number, vocabBlockList?: string[]): Promise<VocabData[]> {
    const now = new Date();
    let query = vocabDb.vocab
      .where('language').anyOf(languages)
      .and(vocab => vocab.length === 'sentence')
      .and(vocab => vocab.progress.level >= 0)
      .and(vocab => vocab.progress.level <= maxLevel)
      .and(vocab => vocab.progress.due && new Date(vocab.progress.due) <= now);

    if (vocabBlockList && vocabBlockList.length > 0) {
      query = query.and(vocab => !vocabBlockList.includes(vocab.uid));
    }

    const results = await query.toArray();
    return results.map(vocab => this.ensureVocabFields(vocab));
  }

  // Image operations
  async addImageFromUrl(vocabId: string, imageUrl: string, alt?: string): Promise<void> {
    try {
      // Fetch and compress the image
      const compressedBlob = await compressImageFromUrl(imageUrl, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        format: 'jpeg'
      });

      const vocab = await vocabDb.vocab.get(vocabId);
      if (!vocab) throw new Error('Vocab not found');

      const vocabImage: VocabImage = {
        uid: crypto.randomUUID(),
        url: imageUrl,
        blob: compressedBlob,
        alt: alt,
        addedAt: new Date(),
        fileSize: compressedBlob.size,
        mimeType: compressedBlob.type,
        compressed: true
      };

      vocab.images = vocab.images || [];
      vocab.images.push(vocabImage);
      vocab.hasImage = true;

      await vocabDb.vocab.put(toRaw(vocab));
    } catch (error) {
      console.error('Failed to add image from URL:', error);
      throw error;
    }
  }

  async addImageFromFile(vocabId: string, file: File, alt?: string): Promise<void> {
    try {
      // Compress the uploaded file
      const compressedBlob = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        format: 'jpeg'
      });

      const vocab = await vocabDb.vocab.get(vocabId);
      if (!vocab) throw new Error('Vocab not found');

      const vocabImage: VocabImage = {
        uid: crypto.randomUUID(),
        blob: compressedBlob,
        alt: alt || file.name,
        addedAt: new Date(),
        fileSize: compressedBlob.size,
        mimeType: compressedBlob.type,
        originalFileName: file.name,
        compressed: true
      };

      vocab.images = vocab.images || [];
      vocab.images.push(vocabImage);
      vocab.hasImage = true;

      await vocabDb.vocab.put(toRaw(vocab));
    } catch (error) {
      console.error('Failed to add image from file:', error);
      throw error;
    }
  }

  async removeImageFromVocab(vocabId: string, imageId: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(vocabId);
    if (!vocab) return;

    vocab.images = vocab.images?.filter(img => img.uid !== imageId) || [];
    vocab.hasImage = vocab.images.length > 0;
    await vocabDb.vocab.put(toRaw(vocab));
  }

  async getVocabNeedingImages(languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab => {
        // Must have content
        if (!vocab.content || vocab.content.trim() === '') {
          return false;
        }
        
        // Must not be excluded from practice
        if (vocab.doNotPractice) {
          return false;
        }
        
        // Must not be in block list
        if (vocabBlockList && vocabBlockList.includes(vocab.uid)) {
          return false;
        }
        
        // Must be picturable (undefined means yes, false means no)
        if (vocab.isPicturable === false) {
          return false;
        }
        
        // Must not already have images
        if (vocab.images && vocab.images.length > 0) {
          return false;
        }
        
        return true;
      })
      .toArray();

    return vocab.map(v => this.ensureVocabFields(v));
  }

  async markVocabNotPicturable(vocabId: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(vocabId);
    if (!vocab) return;

    vocab.isPicturable = false;
    await vocabDb.vocab.put(toRaw(vocab));
  }

  // Sound operations
  async addSoundFromFile(vocabId: string, file: File): Promise<void> {
    // Validate the audio file
    const validationError = validateAudioFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const vocab = await vocabDb.vocab.get(vocabId);
    if (!vocab) throw new Error('Vocab not found');

    try {
      // Get audio duration
      const duration = await getAudioDuration(file);

      const vocabSound: VocabSound = {
        uid: crypto.randomUUID(),
        blob: file, // Store the file as a blob directly
        addedAt: new Date(),
        fileSize: file.size,
        mimeType: file.type,
        duration: duration,
        originalFileName: file.name
      };

      vocab.sound = vocabSound;
      vocab.hasSound = true;
      await vocabDb.vocab.put(toRaw(vocab));
    } catch (error) {
      console.error('Failed to add sound from file:', error);
      throw error;
    }
  }

  async addSoundFromUrl(vocabId: string, url: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(vocabId);
    if (!vocab) throw new Error('Vocab not found');

    try {
      // Fetch audio as blob
      const blob = await fetchAudioAsBlob(url);
      
      // Validate the fetched blob
      const file = new File([blob], 'audio', { type: blob.type });
      const validationError = validateAudioFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Get audio duration
      const duration = await getAudioDuration(blob);

      const vocabSound: VocabSound = {
        uid: crypto.randomUUID(),
        blob: blob,
        addedAt: new Date(),
        fileSize: blob.size,
        mimeType: blob.type,
        duration: duration,
        originalFileName: undefined
      };

      vocab.sound = vocabSound;
      vocab.hasSound = true;
      await vocabDb.vocab.put(toRaw(vocab));
    } catch (error) {
      console.error('Failed to add sound from URL:', error);
      throw error;
    }
  }

  async removeSoundFromVocab(vocabId: string): Promise<void> {
    const vocab = await vocabDb.vocab.get(vocabId);
    if (!vocab) return;

    vocab.sound = undefined;
    vocab.hasSound = false;
    await vocabDb.vocab.put(toRaw(vocab));
  }

  // Eyes and Ears operations
  async getRandomUnseenVocabWithSoundAndImages(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab => 
        vocab.hasSound === true &&
        vocab.hasImage === true &&
        vocab.progress.level === -1 &&
        !vocab.doNotPractice &&
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
      )
      .toArray();

    if (vocab.length === 0) return null;
    const ensured = vocab.map(v => this.ensureVocabFields(v));
    return pickRandom(ensured, 1)[0];
  }

  async getRandomDueVocabWithSoundAndImages(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab => 
        vocab.hasSound === true &&
        vocab.hasImage === true &&
        vocab.progress.level >= 0 &&
        vocab.progress.due <= new Date() &&
        !vocab.doNotPractice &&
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
      )
      .toArray();

    if (vocab.length === 0) return null;
    const ensured = vocab.map(v => this.ensureVocabFields(v));
    return pickRandom(ensured, 1)[0];
  }

  async getRandomVocabWithImages(language: string, excludeVocabUid: string, vocabBlockList?: string[]): Promise<VocabData | null> {
    const vocab = await vocabDb.vocab
      .where('language')
      .equals(language)
      .filter(vocab =>
        vocab.hasImage === true &&
        vocab.uid !== excludeVocabUid &&
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
      )
      .toArray();

    if (vocab.length === 0) return null;
    const ensured = vocab.map(v => this.ensureVocabFields(v));
    return pickRandom(ensured, 1)[0];
  }

  async getRandomUnseenSentenceVocabWithRelatedVocab(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    const vocab = await vocabDb.vocab
      .where('language')
      .anyOf(languages)
      .filter(vocab => 
        vocab.length === 'sentence' &&
        vocab.progress.level === -1 &&
        vocab.relatedVocab && vocab.relatedVocab.length >= 1 &&
        !vocab.doNotPractice &&
        (!vocabBlockList || !vocabBlockList.includes(vocab.uid))
      )
      .toArray();

    if (vocab.length === 0) return null;
    const ensured = vocab.map(v => this.ensureVocabFields(v));
    return pickRandom(ensured, 1)[0];
  }
}