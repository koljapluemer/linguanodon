import type { ImmersionContentRepoContract } from './ImmersionContentRepoContract';
import type { ImmersionContentData } from './ImmersionContentData';
import { ImmersionContentStorage } from './ImmersionContentStorage';

export class ImmersionContentRepo implements ImmersionContentRepoContract {
  private storage = new ImmersionContentStorage();

  async getAllImmersionContent(): Promise<ImmersionContentData[]> {
    return await this.storage.getAll();
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

  async saveImmersionContent(immersionContent: Omit<ImmersionContentData, 'uid' | 'tasks' | 'lastShownAt'>): Promise<ImmersionContentData> {
    const immersionContentData: ImmersionContentData = {
      uid: crypto.randomUUID(),
      language: immersionContent.language,
      title: immersionContent.title,
      content: immersionContent.content,
      link: immersionContent.link,
      priority: immersionContent.priority,
      neededVocab: immersionContent.neededVocab,
      notes: immersionContent.notes,
      extractedVocab: immersionContent.extractedVocab,
      extractedFactCards: immersionContent.extractedFactCards,
      origins: immersionContent.origins,
      tasks: []
    };

    console.log('ImmersionContentRepo: Attempting to save immersion content:', immersionContentData.title);
    
    try {
      await this.storage.add(immersionContentData);
      console.log('ImmersionContentRepo: Successfully saved immersion content:', immersionContentData.title, immersionContentData.uid);
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

    // Remove the vocab UID from the neededVocab array
    const updatedImmersionContent: ImmersionContentData = {
      ...immersionContent,
      neededVocab: immersionContent.neededVocab.filter(id => id !== vocabUid)
    };

    await this.storage.update(updatedImmersionContent);
  }

  async disconnectExtractedVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void> {
    const immersionContent = await this.storage.getByUID(immersionContentUid);
    if (!immersionContent) {
      throw new Error('Immersion content not found');
    }

    // Remove the vocab UID from the extractedVocab array
    const updatedImmersionContent: ImmersionContentData = {
      ...immersionContent,
      extractedVocab: immersionContent.extractedVocab.filter(id => id !== vocabUid)
    };

    await this.storage.update(updatedImmersionContent);
  }
}