import type { ImmersionContentRepoContract } from './ImmersionContentRepoContract';
import type { ImmersionContentData } from './ImmersionContentData';
import { ImmersionContentStorage } from './ImmersionContentStorage';

export class ImmersionContentRepo implements ImmersionContentRepoContract {
  private storage = new ImmersionContentStorage();

  async getAllImmersionContent(setsToAvoid?: string[]): Promise<ImmersionContentData[]> {
    const allContent = await this.storage.getAll();
    
    // Deterministically filter out content from avoided sets if specified
    if (setsToAvoid && setsToAvoid.length > 0) {
      return allContent.filter(content =>
        !content.origins.some(origin => setsToAvoid.includes(origin))
      );
    }
    
    return allContent;
  }

  async getImmersionContentById(uid: string): Promise<ImmersionContentData | undefined> {
    return await this.storage.getByUID(uid);
  }

  async getImmersionContentByTitleAndLanguage(title: string, language: string): Promise<ImmersionContentData | undefined> {
    const allImmersionContent = await this.storage.getAll();
    return allImmersionContent.find(content => 
      content.title === title && content.language === language
    );
  }

  async getRandomDueImmersionContent(): Promise<ImmersionContentData | null> {
    const allImmersionContent = await this.storage.getAll();
    
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
      await this.storage.add(immersionContentData);
      return immersionContentData;
    } catch (error) {
      console.error('ImmersionContentRepo: Failed to save immersion content:', error);
      throw error;
    }
  }

  async updateImmersionContent(immersionContent: ImmersionContentData): Promise<void> {
    await this.storage.update(immersionContent);
  }

  async deleteImmersionContent(uid: string): Promise<void> {
    await this.storage.delete(uid);
  }

  async disconnectNeededVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void> {
    const immersionContent = await this.storage.getByUID(immersionContentUid);
    if (!immersionContent) {
      throw new Error('Immersion content not found');
    }

    // Remove the vocab UID from the vocab array
    const updatedImmersionContent: ImmersionContentData = {
      ...immersionContent,
      vocab: immersionContent.vocab.filter((id: string) => id !== vocabUid)
    };

    await this.storage.update(updatedImmersionContent);
  }

  async disconnectExtractedVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void> {
    const immersionContent = await this.storage.getByUID(immersionContentUid);
    if (!immersionContent) {
      throw new Error('Immersion content not found');
    }

    // Remove the vocab UID from the factCards array  
    const updatedImmersionContent: ImmersionContentData = {
      ...immersionContent,
      factCards: immersionContent.factCards.filter((id: string) => id !== vocabUid)
    };

    await this.storage.update(updatedImmersionContent);
  }
}