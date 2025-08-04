import Dexie, { type Table } from 'dexie';
import type { LanguageData } from './LanguageData';

export class LanguageStorage extends Dexie {
  languages!: Table<LanguageData>;

  constructor() {
    super('LanguageStorage');
    this.version(1).stores({
      languages: 'code, name, isActive'
    });
  }

  async getAll(): Promise<LanguageData[]> {
    return await this.languages.toArray();
  }

  async getById(code: string): Promise<LanguageData | undefined> {
    return await this.languages.get(code);
  }

  async add(language: LanguageData): Promise<void> {
    await this.languages.put(language);
  }

  async update(language: LanguageData): Promise<void> {
    await this.languages.put(language);
  }

  async delete(code: string): Promise<void> {
    await this.languages.delete(code);
  }
}