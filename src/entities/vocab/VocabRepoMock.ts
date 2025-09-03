import type { VocabRepoContract, VocabPaginationResult } from './VocabRepoContract';
import type { VocabData } from './VocabData';
import type { Rating } from 'ts-fsrs';
import { createEmptyCard } from 'ts-fsrs';

export class VocabRepoMock implements VocabRepoContract {
  
  private createSampleVocab(overrides: Partial<VocabData> = {}): VocabData {
    return {
      uid: crypto.randomUUID(),
      language: 'en',
      content: 'sample word',
      length: 'word',
      priority: 1,
      doNotPractice: false,
      notes: [],
      translations: ['trans-1', 'trans-2'],
      links: [],
      progress: {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      },
      origins: ['user-added'],
      relatedVocab: [],
      notRelatedVocab: [],
      isPicturable: true,
      images: [],
      hasImage: false,
      sound: undefined,
      hasSound: false,
      ...overrides
    };
  }

  // Vocab operations
  async getVocab(): Promise<VocabData[]> {
    console.info('VocabRepoMock: getVocab() returning 3 sample vocab items');
    return [
      this.createSampleVocab({ content: 'hello', language: 'en' }),
      this.createSampleVocab({ content: 'world', language: 'en' }),
      this.createSampleVocab({ content: 'bonjour', language: 'fr' })
    ];
  }

  async getVocabByUID(uid: string): Promise<VocabData | undefined> {
    console.info(`VocabRepoMock: getVocabByUID(${uid}) returning sample vocab`);
    return this.createSampleVocab({ uid, content: 'sample vocab by uid' });
  }

  async getVocabByUIDs(uids: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getVocabByUIDs([${uids.join(', ')}]) returning ${uids.length} sample vocab items`);
    return uids.map(uid => this.createSampleVocab({ uid, content: `vocab-${uid.slice(0, 8)}` }));
  }

  async getVocabByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined> {
    console.info(`VocabRepoMock: getVocabByLanguageAndContent(${language}, ${content}) returning sample vocab`);
    return this.createSampleVocab({ language, content });
  }

  async getRandomAlreadySeenDueVocab(count: number, languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getRandomAlreadySeenDueVocab(${count}, [${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) returning ${count} due vocab`);
    return Array.from({ length: count }, (_, i) => 
      this.createSampleVocab({ 
        content: `due-vocab-${i}`,
        language: languages[0] || 'en',
        progress: { ...createEmptyCard(), streak: 2, level: 1, due: new Date(Date.now() - 1000 * 60 * 60) }
      })
    );
  }

  async getRandomUnseenVocab(count: number, languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getRandomUnseenVocab(${count}, [${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) returning ${count} unseen vocab`);
    return Array.from({ length: count }, (_, i) => 
      this.createSampleVocab({ 
        content: `unseen-vocab-${i}`,
        language: languages[0] || 'en'
      })
    );
  }

  async getRandomUnseenSentenceVocab(count: number, languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getRandomUnseenSentenceVocab(${count}, [${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) returning ${count} unseen sentence vocab`);
    return Array.from({ length: count }, (_, i) => 
      this.createSampleVocab({ 
        content: `This is sentence number ${i + 1}`,
        language: languages[0] || 'en',
        length: 'sentence'
      })
    );
  }

  async getDueSentenceVocabWithMaxLevel(languages: string[], maxLevel: number, vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getDueSentenceVocabWithMaxLevel([${languages.join(', ')}], ${maxLevel}, ${vocabBlockList ? '[blocked]' : 'no-blocks'}) returning 2 due sentence vocab`);
    return [
      this.createSampleVocab({ 
        content: 'This is a due sentence',
        language: languages[0] || 'en',
        length: 'sentence',
        progress: { ...createEmptyCard(), streak: 1, level: Math.min(maxLevel, 2), due: new Date(Date.now() - 1000 * 60 * 60) }
      }),
      this.createSampleVocab({ 
        content: 'Another due sentence',
        language: languages[0] || 'en',
        length: 'sentence',
        progress: { ...createEmptyCard(), streak: 0, level: Math.min(maxLevel, 1), due: new Date(Date.now() - 1000 * 60 * 30) }
      })
    ];
  }

  async getDueOrUnseenVocabFromIds(uids: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getDueOrUnseenVocabFromIds([${uids.join(', ')}]) returning ${uids.length} due/unseen vocab`);
    return uids.map((uid, i) => 
      this.createSampleVocab({ 
        uid,
        content: `vocab-${i}`,
        progress: i % 2 === 0 
          ? { ...createEmptyCard(), streak: 0, level: -1 } // unseen
          : { ...createEmptyCard(), streak: 1, level: 1, due: new Date(Date.now() - 1000 * 60 * 60) } // due
      })
    );
  }

  // Pagination operations
  async getVocabPaginated(cursor?: string, limit: number = 20, searchQuery?: string): Promise<VocabPaginationResult> {
    console.info(`VocabRepoMock: getVocabPaginated(cursor: ${cursor}, limit: ${limit}, search: ${searchQuery}) returning paginated results`);
    const vocab = Array.from({ length: Math.min(limit, 5) }, (_, i) => 
      this.createSampleVocab({ content: `paginated-vocab-${i}${searchQuery ? '-' + searchQuery : ''}` })
    );
    return {
      vocab,
      nextCursor: vocab.length > 0 ? vocab[vocab.length - 1].uid : undefined,
      hasMore: false
    };
  }

  async getTotalVocabCount(searchQuery?: string): Promise<number> {
    console.info(`VocabRepoMock: getTotalVocabCount(search: ${searchQuery}) returning total count`);
    return searchQuery ? 50 : 1000;
  }

  // CRUD operations
  async saveVocab(vocab: Omit<VocabData, 'uid' | 'progress'>): Promise<VocabData> {
    console.info(`VocabRepoMock: saveVocab(${vocab.content}) - would save new vocab`);
    return this.createSampleVocab({
      ...vocab,
      uid: crypto.randomUUID()
    });
  }

  async updateVocab(vocab: VocabData): Promise<void> {
    console.info(`VocabRepoMock: updateVocab(${vocab.uid}: ${vocab.content}) - would update vocab`);
  }

  async deleteVocab(id: string): Promise<void> {
    console.info(`VocabRepoMock: deleteVocab(${id}) - would delete vocab`);
  }

  // Progress operations
  async scoreVocab(vocabId: string, rating: Rating): Promise<void> {
    console.info(`VocabRepoMock: scoreVocab(${vocabId}, ${rating}) - would score vocab with rating`);
  }

  async updateLastReview(vocabId: string): Promise<void> {
    console.info(`VocabRepoMock: updateLastReview(${vocabId}) - would update last review time`);
  }

  // Pronunciation operations
  async addPronunciationToVocab(uid: string, pronunciation: string): Promise<void> {
    console.info(`VocabRepoMock: addPronunciationToVocab(${uid}, ${pronunciation}) - would add pronunciation`);
  }

  async hasPronunciation(uid: string): Promise<boolean> {
    console.info(`VocabRepoMock: hasPronunciation(${uid}) - returning false`);
    return false;
  }

  async getRandomVocabWithMissingPronunciation(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    console.info(`VocabRepoMock: getRandomVocabWithMissingPronunciation([${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning vocab needing pronunciation`);
    return this.createSampleVocab({ 
      content: 'needs pronunciation',
      language: languages[0] || 'en'
    });
  }

  // Related vocab operations
  async addRelatedVocab(uid: string, relatedVocabUid: string): Promise<void> {
    console.info(`VocabRepoMock: addRelatedVocab(${uid}, ${relatedVocabUid}) - would add related vocab`);
  }

  async removeRelatedVocab(uid: string, relatedVocabUid: string): Promise<void> {
    console.info(`VocabRepoMock: removeRelatedVocab(${uid}, ${relatedVocabUid}) - would remove related vocab`);
  }

  async addNotRelatedVocab(uid: string, notRelatedVocabUid: string): Promise<void> {
    console.info(`VocabRepoMock: addNotRelatedVocab(${uid}, ${notRelatedVocabUid}) - would add not-related vocab`);
  }

  async removeNotRelatedVocab(uid: string, notRelatedVocabUid: string): Promise<void> {
    console.info(`VocabRepoMock: removeNotRelatedVocab(${uid}, ${notRelatedVocabUid}) - would remove not-related vocab`);
  }

  // Query operations for distractor generation
  async getDueVocabInLanguage(language: string, vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getDueVocabInLanguage(${language}, ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning 3 due vocab`);
    return Array.from({ length: 3 }, (_, i) => 
      this.createSampleVocab({ 
        content: `due-${language}-vocab-${i}`,
        language,
        progress: { ...createEmptyCard(), streak: 1, level: 1, due: new Date(Date.now() - 1000 * 60 * 60) }
      })
    );
  }

  async getDueVocabInLanguages(languages: string[], setsToAvoid?: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getDueVocabInLanguages([${languages.join(', ')}], ${setsToAvoid ? '[avoided-sets]' : 'no-avoided-sets'}, ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning 3 due vocab`);
    return Array.from({ length: 3 }, (_, i) => 
      this.createSampleVocab({ 
        content: `due-multi-lang-vocab-${i}`,
        language: languages[i % languages.length] || 'en',
        progress: { ...createEmptyCard(), streak: 1, level: 1, due: new Date(Date.now() - 1000 * 60 * 60) }
      })
    );
  }

  async getRandomUnseenVocabInLanguages(languages: string[], count: number, setsToAvoid?: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getRandomUnseenVocabInLanguages([${languages.join(', ')}], ${count}, ${setsToAvoid ? '[avoided-sets]' : 'no-avoided-sets'}, ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning ${count} unseen vocab`);
    return Array.from({ length: count }, (_, i) => 
      this.createSampleVocab({ 
        content: `unseen-multi-lang-vocab-${i}`,
        language: languages[i % languages.length] || 'en'
      })
    );
  }

  async getRandomUnseenVocabWithContentAndTranslations(languages: string[], count: number, setsToAvoid?: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getRandomUnseenVocabWithContentAndTranslations([${languages.join(', ')}], ${count}, ${setsToAvoid ? '[avoided-sets]' : 'no-avoided-sets'}, ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning ${count} complete vocab`);
    return Array.from({ length: count }, (_, i) => 
      this.createSampleVocab({ 
        content: `complete-vocab-${i}`,
        language: languages[i % languages.length] || 'en',
        translations: [`translation-${i}-1`, `translation-${i}-2`] // Ensure translations exist
      })
    );
  }

  async findVocabByTranslationUids(language: string, translationUids: string[]): Promise<VocabData | undefined> {
    console.info(`VocabRepoMock: findVocabByTranslationUids(${language}, [${translationUids.join(', ')}]) - returning vocab with these translations`);
    return this.createSampleVocab({ 
      language,
      content: 'vocab with translations',
      translations: translationUids
    });
  }

  async getRandomVocabWithNoTranslationsInLanguages(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    console.info(`VocabRepoMock: getRandomVocabWithNoTranslationsInLanguages([${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning vocab without translations`);
    return this.createSampleVocab({ 
      content: 'untranslated vocab',
      language: languages[0] || 'en',
      translations: []
    });
  }

  // Distractor generation operations
  async generateWrongVocabs(targetLanguage: string, correctVocabContent: string, count: number): Promise<string[]> {
    console.info(`VocabRepoMock: generateWrongVocabs(${targetLanguage}, ${correctVocabContent}, ${count}) - generating ${count} wrong answers`);
    return Array.from({ length: count }, (_, i) => `wrong-answer-${i}`);
  }

  // Goal-based vocab operations
  async getUnseenVocabByIds(vocabIds: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getUnseenVocabByIds([${vocabIds.join(', ')}]) - returning ${vocabIds.length} unseen vocab`);
    return vocabIds.map(uid => this.createSampleVocab({ uid, content: `unseen-${uid.slice(0, 8)}` }));
  }

  async getDueVocabByIds(vocabIds: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getDueVocabByIds([${vocabIds.join(', ')}]) - returning ${vocabIds.length} due vocab`);
    return vocabIds.map(uid => 
      this.createSampleVocab({ 
        uid, 
        content: `due-${uid.slice(0, 8)}`,
        progress: { ...createEmptyCard(), streak: 1, level: 1, due: new Date(Date.now() - 1000 * 60 * 60) }
      })
    );
  }

  // Backup task operations
  async getVocabWithLowestDueDate(count: number, languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getVocabWithLowestDueDate(${count}, [${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning ${count} oldest due vocab`);
    return Array.from({ length: count }, (_, i) => 
      this.createSampleVocab({ 
        content: `oldest-due-${i}`,
        language: languages[0] || 'en',
        progress: { ...createEmptyCard(), streak: 1, level: 1, due: new Date(Date.now() - 1000 * 60 * 60 * (24 + i)) }
      })
    );
  }

  async updateVocabLastSeenAndDueDate(vocabIds: string[], dueDate: Date): Promise<void> {
    console.info(`VocabRepoMock: updateVocabLastSeenAndDueDate([${vocabIds.length} items], ${dueDate.toISOString()}) - would update last seen and due dates`);
  }

  // Image operations
  async addImageFromUrl(vocabId: string, imageUrl: string, alt?: string): Promise<void> {
    console.info(`VocabRepoMock: addImageFromUrl(${vocabId}, ${imageUrl}, ${alt}) - would add image from URL`);
  }

  async addImageFromFile(vocabId: string, file: File, alt?: string): Promise<void> {
    console.info(`VocabRepoMock: addImageFromFile(${vocabId}, ${file.name}, ${alt}) - would add image from file`);
  }

  async removeImageFromVocab(vocabId: string, imageId: string): Promise<void> {
    console.info(`VocabRepoMock: removeImageFromVocab(${vocabId}, ${imageId}) - would remove image`);
  }

  async getVocabNeedingImages(languages: string[], vocabBlockList?: string[]): Promise<VocabData[]> {
    console.info(`VocabRepoMock: getVocabNeedingImages([${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning 2 vocab needing images`);
    return [
      this.createSampleVocab({ 
        content: 'needs image 1',
        language: languages[0] || 'en',
        hasImage: false,
        images: []
      }),
      this.createSampleVocab({ 
        content: 'needs image 2',
        language: languages[0] || 'en',
        hasImage: false,
        images: []
      })
    ];
  }

  async markVocabNotPicturable(vocabId: string): Promise<void> {
    console.info(`VocabRepoMock: markVocabNotPicturable(${vocabId}) - would mark vocab as not picturable`);
  }

  // Sound operations
  async addSoundFromFile(vocabId: string, file: File): Promise<void> {
    console.info(`VocabRepoMock: addSoundFromFile(${vocabId}, ${file.name}) - would add sound from file`);
  }

  async addSoundFromUrl(vocabId: string, url: string): Promise<void> {
    console.info(`VocabRepoMock: addSoundFromUrl(${vocabId}, ${url}) - would add sound from URL`);
  }

  async removeSoundFromVocab(vocabId: string): Promise<void> {
    console.info(`VocabRepoMock: removeSoundFromVocab(${vocabId}) - would remove sound`);
  }

  // Eyes and Ears operations
  async getRandomUnseenVocabWithSoundAndImages(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    console.info(`VocabRepoMock: getRandomUnseenVocabWithSoundAndImages([${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning vocab with sound and images`);
    return this.createSampleVocab({ 
      content: 'unseen with media',
      language: languages[0] || 'en',
      hasSound: true,
      hasImage: true,
      images: [{ uid: 'img-1', addedAt: new Date() } as any],
      sound: { uid: 'sound-1', addedAt: new Date() } as any
    });
  }

  async getRandomDueVocabWithSoundAndImages(languages: string[], vocabBlockList?: string[]): Promise<VocabData | null> {
    console.info(`VocabRepoMock: getRandomDueVocabWithSoundAndImages([${languages.join(', ')}], ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning due vocab with sound and images`);
    return this.createSampleVocab({ 
      content: 'due with media',
      language: languages[0] || 'en',
      hasSound: true,
      hasImage: true,
      images: [{ uid: 'img-1', addedAt: new Date() } as any],
      sound: { uid: 'sound-1', addedAt: new Date() } as any,
      progress: { ...createEmptyCard(), streak: 1, level: 1, due: new Date(Date.now() - 1000 * 60 * 60) }
    });
  }

  async getRandomVocabWithImages(language: string, excludeVocabUid: string, vocabBlockList?: string[]): Promise<VocabData | null> {
    console.info(`VocabRepoMock: getRandomVocabWithImages(${language}, exclude: ${excludeVocabUid}, ${vocabBlockList ? '[blocked]' : 'no-blocks'}) - returning vocab with images`);
    return this.createSampleVocab({ 
      content: 'vocab with images',
      language,
      hasImage: true,
      images: [{ uid: 'img-1', addedAt: new Date() } as any]
    });
  }
}