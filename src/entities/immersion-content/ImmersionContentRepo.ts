import Dexie, { type Table } from 'dexie';
import type { ImmersionContentRepoContract } from './ImmersionContentRepoContract';
import type { ImmersionContentData } from './ImmersionContentData';

class ImmersionContentDatabase extends Dexie {
  immersionContent!: Table<ImmersionContentData>;

  constructor() {
    super('ImmersionContentDatabase');
    this.version(1).stores({
      immersionContent: 'uid, language'
    });
  }
}

export class ImmersionContentRepo implements ImmersionContentRepoContract {
  private db = new ImmersionContentDatabase();

  async getAllImmersionContent(setsToAvoid?: string[]): Promise<ImmersionContentData[]> {
    const allContent = await this.db.immersionContent.toArray();
    
    // Deterministically filter out content from avoided sets if specified
    if (setsToAvoid && setsToAvoid.length > 0) {
      return allContent.filter(content =>
        !content.origins.some(origin => setsToAvoid.includes(origin))
      );
    }
    
    return allContent;
  }

  async getImmersionContentById(uid: string): Promise<ImmersionContentData | undefined> {
    return await this.db.immersionContent.get(uid);
  }

  async getImmersionContentByTitleAndLanguage(title: string, language: string): Promise<ImmersionContentData | undefined> {
    const allImmersionContent = await this.db.immersionContent.toArray();
    return allImmersionContent.find(content => 
      content.title === title && content.language === language
    );
  }

  async getRandomDueImmersionContent(): Promise<ImmersionContentData | null> {
    const allImmersionContent = await this.db.immersionContent.toArray();
    
    if (allImmersionContent.length === 0) {
      return null;
    }
    
    // Pick a random immersion content item
    const randomIndex = Math.floor(Math.random() * allImmersionContent.length);
    return allImmersionContent[randomIndex];
  }

  async saveImmersionContent(immersionContent: Omit<ImmersionContentData, 'uid' | 'lastShownAt'>): Promise<ImmersionContentData> {
    const immersionContentData: ImmersionContentData = {
      uid: crypto.randomUUID(),
      language: immersionContent.language,
      title: immersionContent.title,
      content: immersionContent.content,
      link: immersionContent.link,
      priority: immersionContent.priority,
      vocab: immersionContent.vocab || [],
      factCards: immersionContent.factCards || [],
      notes: immersionContent.notes,
      origins: immersionContent.origins,
      finishedExtracting: immersionContent.finishedExtracting ?? false
    };

    
    try {
      await this.db.immersionContent.add(immersionContentData);
      return immersionContentData;
    } catch (error) {
      console.error('ImmersionContentRepo: Failed to save immersion content:', error);
      throw error;
    }
  }

  async updateImmersionContent(immersionContent: ImmersionContentData): Promise<void> {
    await this.db.immersionContent.put(immersionContent);
  }

  async deleteImmersionContent(uid: string): Promise<void> {
    await this.db.immersionContent.delete(uid);
  }

  async disconnectNeededVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void> {
    const immersionContent = await this.db.immersionContent.get(immersionContentUid);
    if (!immersionContent) {
      throw new Error('Immersion content not found');
    }

    // Remove the vocab UID from the vocab array
    const updatedImmersionContent: ImmersionContentData = {
      ...immersionContent,
      vocab: immersionContent.vocab.filter((id: string) => id !== vocabUid)
    };

    await this.db.immersionContent.put(updatedImmersionContent);
  }

  async disconnectExtractedVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void> {
    const immersionContent = await this.db.immersionContent.get(immersionContentUid);
    if (!immersionContent) {
      throw new Error('Immersion content not found');
    }

    // Remove the vocab UID from the factCards array  
    const updatedImmersionContent: ImmersionContentData = {
      ...immersionContent,
      factCards: immersionContent.factCards.filter((id: string) => id !== vocabUid)
    };

    await this.db.immersionContent.put(updatedImmersionContent);
  }
}