import { LanguageStorage } from './LanguageStorage';
import type { LanguageRepoContract } from './LanguageRepoContract';
import type { LanguageData } from './LanguageData';
import isoLangs from './isoLangs.json';

export class LanguageRepo implements LanguageRepoContract {
  private storage = new LanguageStorage();

  async getAll(): Promise<LanguageData[]> {
    return await this.storage.getAll();
  }

  async getActiveTargetLanguages(): Promise<LanguageData[]> {
    const all = await this.storage.getAll();
    return all.filter(lang => lang.isActive);
  }

  async getByCode(code: string): Promise<LanguageData | undefined> {
    return await this.storage.getById(code);
  }

  async add(language: LanguageData): Promise<void> {
    // Merge emoji from isoLangs.json if available
    const isoLang = (isoLangs as { code: string; name: string; emoji?: string }[])
      .find(l => l.code === language.code);
    
    const languageWithEmoji: LanguageData = {
      ...language,
      emoji: isoLang?.emoji || language.emoji
    };

    await this.storage.add(languageWithEmoji);
  }

  async update(language: LanguageData): Promise<void> {
    await this.storage.update(language);
  }

  async delete(code: string): Promise<void> {
    await this.storage.deleteLanguage(code);
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
}