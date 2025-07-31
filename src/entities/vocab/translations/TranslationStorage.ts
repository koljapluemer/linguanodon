import Dexie, { type Table } from 'dexie';
import type { TranslationData } from './TranslationData';
import demoData from '@/shared/demo-data/demo.json';


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
    await this.ensureDemoData();
    return await db.translations.toArray();
  }

  async getById(uid: string): Promise<TranslationData | undefined> {
    await this.ensureDemoData();
    return await db.translations.get(uid);
  }

  async getByIds(uids: string[]): Promise<TranslationData[]> {
    await this.ensureDemoData();
    return await db.translations.where('uid').anyOf(uids).toArray();
  }

  async add(translation: TranslationData): Promise<string> {
    await this.ensureDemoData();
    
    // Check for duplicate content
    const existing = await db.translations.where('content').equals(translation.content).first();
    if (existing) {
      throw new Error(`Translation with content "${translation.content}" already exists`);
    }
    
    await db.translations.add(translation);
    return translation.uid;
  }

  async getByContent(content: string): Promise<TranslationData | undefined> {
    await this.ensureDemoData();
    return await db.translations.where('content').equals(content).first();
  }

  async update(translation: TranslationData): Promise<void> {
    await db.translations.put(translation);
  }

  async delete(uid: string): Promise<void> {
    await db.translations.delete(uid);
  }

  private async ensureDemoData(): Promise<void> {
    const count = await db.translations.count();
    if (count === 0) {
      await db.translations.bulkAdd(demoData.translations);
    }
  }
}