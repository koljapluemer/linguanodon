import Dexie, { type Table } from 'dexie';
import type { TranslationData } from './TranslationData';


class TranslationDatabase extends Dexie {
  translations!: Table<TranslationData>;

  constructor() {
    super('TranslationDatabase');
    this.version(1).stores({
      translations: 'uid, content'
    });
  }
}

const db = new TranslationDatabase();

export class TranslationStorage {
  
  async getAll(): Promise<TranslationData[]> {
    return await db.translations.toArray();
  }

  async getById(uid: string): Promise<TranslationData | undefined> {
    return await db.translations.get(uid);
  }

  async getByIds(uids: string[]): Promise<TranslationData[]> {
    return await db.translations.where('uid').anyOf(uids).toArray();
  }

  async add(translation: TranslationData): Promise<string> {
    // Check for duplicate content
    const existing = await db.translations.where('content').equals(translation.content).first();
    if (existing) {
      throw new Error(`Translation with content "${translation.content}" already exists`);
    }
    
    await db.translations.add(translation);
    return translation.uid;
  }

  async getByContent(content: string): Promise<TranslationData | undefined> {
    return await db.translations.where('content').equals(content).first();
  }

  async update(translation: TranslationData): Promise<void> {
    await db.translations.put(translation);
  }

  async delete(uid: string): Promise<void> {
    await db.translations.delete(uid);
  }

  async save(translation: TranslationData): Promise<TranslationData> {
    await db.translations.put(translation);
    return translation;
  }

  async deleteByIds(uids: string[]): Promise<void> {
    await db.translations.where('uid').anyOf(uids).delete();
  }

}