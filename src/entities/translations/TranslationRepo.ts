import Dexie, { type Table } from 'dexie';
import type { TranslationRepoContract } from './TranslationRepoContract';
import type { TranslationData } from './TranslationData';

class TranslationDatabase extends Dexie {
  translations!: Table<TranslationData>;

  constructor() {
    super('TranslationDatabase');
    this.version(1).stores({
      translations: 'uid, content, *origins'
    });
  }
}

const translationDb = new TranslationDatabase();

export class TranslationRepo implements TranslationRepoContract {
  
  async getTranslationsByIds(ids: string[]): Promise<TranslationData[]> {
    return await translationDb.translations.where('uid').anyOf(ids).toArray();
  }

  async getTranslationByContent(content: string): Promise<TranslationData | undefined> {
    return await translationDb.translations.where('content').equals(content).first();
  }

  async saveTranslation(translation: Omit<TranslationData, 'uid' | 'origins'>): Promise<TranslationData> {
    const translationToSave: TranslationData = {
      uid: crypto.randomUUID(),
      content: translation.content,
      priority: translation.priority,
      notes: translation.notes,
      origins: []
    };
    
    await translationDb.translations.add(translationToSave);
    return translationToSave;
  }

  async updateTranslation(translation: TranslationData): Promise<void> {
    await translationDb.translations.put(translation);
  }

  async deleteTranslations(ids: string[]): Promise<void> {
    await translationDb.translations.where('uid').anyOf(ids).delete();
  }

  async getAllTranslationsInLanguage(_language: string): Promise<TranslationData[]> {
    // This method would need vocab context to work properly
    // For now, return empty array as this functionality should be in a feature
    console.warn('getAllTranslationsInLanguage called on TranslationRepo - this needs vocab context');
    return [];
  }

  async findTranslationsByContent(content: string): Promise<TranslationData[]> {
    return await translationDb.translations.where('content').equals(content).toArray();
  }
}