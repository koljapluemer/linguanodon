import Dexie, { type Table } from 'dexie';
import type { TranslationData } from './TranslationData';
import demoData from '@/shared/demo-data/italian-basic.json';

class TranslationDatabase extends Dexie {
  translations!: Table<TranslationData>;

  constructor() {
    super('TranslationDatabase');
    this.version(1).stores({
      translations: 'id, content'
    });
  }
}

const db = new TranslationDatabase();

export class TranslationStorage {
  
  async getAll(): Promise<TranslationData[]> {
    await this.ensureDemoData();
    return await db.translations.toArray();
  }

  async getById(id: string): Promise<TranslationData | undefined> {
    await this.ensureDemoData();
    return await db.translations.get(id);
  }

  async getByIds(ids: string[]): Promise<TranslationData[]> {
    await this.ensureDemoData();
    return await db.translations.where('id').anyOf(ids).toArray();
  }

  async add(translation: TranslationData): Promise<string> {
    await db.translations.add(translation);
    return translation.id;
  }

  async update(translation: TranslationData): Promise<void> {
    await db.translations.put(translation);
  }

  async delete(id: string): Promise<void> {
    await db.translations.delete(id);
  }

  private async ensureDemoData(): Promise<void> {
    const count = await db.translations.count();
    if (count === 0) {
      await db.translations.bulkAdd(demoData.translations);
    }
  }
}