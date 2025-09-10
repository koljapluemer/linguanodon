import Dexie, { type Table } from 'dexie';
import type { LanguageRepoContract } from './LanguageRepoContract';
import type { LanguageData } from './LanguageData';
import isoLangs from './isoLangs.json';

class LanguageDatabase extends Dexie {
  languages!: Table<LanguageData>;

  constructor() {
    super('LanguageStorage');
    this.version(1).stores({
      languages: 'code, name, isActive'
    });
  }
}

export class LanguageRepo implements LanguageRepoContract {
  private db = new LanguageDatabase();

  async getAll(): Promise<LanguageData[]> {
    return await this.db.languages.toArray();
  }

  async getActiveTargetLanguages(): Promise<LanguageData[]> {
    const all = await this.db.languages.toArray();
    return all.filter(lang => lang.isActive);
  }

  async getByCode(code: string): Promise<LanguageData | undefined> {
    return await this.db.languages.get(code);
  }

  async add(language: LanguageData): Promise<void> {
    // Merge emoji from isoLangs.json if available
    const isoLang = (isoLangs as { code: string; name: string; emoji?: string }[])
      .find(l => l.code === language.code);
    
    const languageWithEmoji: LanguageData = {
      ...language,
      emoji: isoLang?.emoji || language.emoji
    };

    await this.db.languages.put(languageWithEmoji);
  }

  async update(language: LanguageData): Promise<void> {
    await this.db.languages.put(language);
  }

  async delete(code: string): Promise<void> {
    await this.db.languages.delete(code);
  }

  async setActive(code: string, isActive: boolean): Promise<void> {
    const language = await this.getByCode(code);
    if (language) {
      await this.update({ ...language, isActive });
    }
  }

  async isValidLanguageCode(code: string): Promise<boolean> {
    return (isoLangs as { code: string; name: string }[])
      .some(lang => lang.code === code);
  }

  async getCount(): Promise<number> {
    const all = await this.getAll();
    return all.length;
  }

  async createLanguageFromCode(code: string): Promise<LanguageData> {
    const isoLang = (isoLangs as { code: string; name: string; emoji?: string }[])
      .find(l => l.code === code);
    
    if (!isoLang) {
      console.error(`Language code '${code}' not found in ISO language data`);
      throw new Error(`Unknown language code: ${code}`);
    }
    
    return {
      code,
      name: isoLang.name,
      emoji: isoLang.emoji,
      isActive: true
    };
  }
}