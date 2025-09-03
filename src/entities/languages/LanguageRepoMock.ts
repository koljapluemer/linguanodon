import type { LanguageRepoContract } from './LanguageRepoContract';
import type { LanguageData } from './LanguageData';

export class LanguageRepoMock implements LanguageRepoContract {
  
  private _createSampleLanguage(overrides: Partial<LanguageData> = {}): LanguageData {
    return {
      code: 'en',
      name: 'English',
      emoji: '🇺🇸',
      isActive: true,
      ...overrides
    };
  }

  private getLanguageByCode(code: string): LanguageData {
    const languageMap: Record<string, LanguageData> = {
      'en': { code: 'en', name: 'English', emoji: '🇺🇸', isActive: true },
      'fr': { code: 'fr', name: 'French', emoji: '🇫🇷', isActive: true },
      'es': { code: 'es', name: 'Spanish', emoji: '🇪🇸', isActive: true },
      'de': { code: 'de', name: 'German', emoji: '🇩🇪', isActive: false },
      'it': { code: 'it', name: 'Italian', emoji: '🇮🇹', isActive: true },
      'pt': { code: 'pt', name: 'Portuguese', emoji: '🇵🇹', isActive: false },
      'ja': { code: 'ja', name: 'Japanese', emoji: '🇯🇵', isActive: true },
      'ko': { code: 'ko', name: 'Korean', emoji: '🇰🇷', isActive: false },
      'zh': { code: 'zh', name: 'Chinese', emoji: '🇨🇳', isActive: true },
      'ar': { code: 'ar', name: 'Arabic', emoji: '🇸🇦', isActive: false }
    };

    return languageMap[code] || { code, name: `Language ${code.toUpperCase()}`, isActive: false };
  }

  // Get operations
  async getAll(): Promise<LanguageData[]> {
    console.info('LanguageRepoMock: getAll() - returning 10 sample languages');
    return [
      'en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar'
    ].map(code => this.getLanguageByCode(code));
  }

  async getActiveTargetLanguages(): Promise<LanguageData[]> {
    console.info('LanguageRepoMock: getActiveTargetLanguages() - returning 5 active languages');
    return [
      this.getLanguageByCode('en'),
      this.getLanguageByCode('fr'),
      this.getLanguageByCode('es'),
      this.getLanguageByCode('it'),
      this.getLanguageByCode('ja'),
      this.getLanguageByCode('zh')
    ];
  }

  async getByCode(code: string): Promise<LanguageData | undefined> {
    console.info(`LanguageRepoMock: getByCode(${code}) - returning language data`);
    if (['en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar'].includes(code)) {
      return this.getLanguageByCode(code);
    }
    return undefined;
  }

  // CRUD operations
  async add(language: LanguageData): Promise<void> {
    console.info(`LanguageRepoMock: add(${language.code}: ${language.name}) - would add new language`);
  }

  async update(language: LanguageData): Promise<void> {
    console.info(`LanguageRepoMock: update(${language.code}: ${language.name}, active: ${language.isActive}) - would update language`);
  }

  async delete(code: string): Promise<void> {
    console.info(`LanguageRepoMock: delete(${code}) - would delete language`);
  }

  // Status operations
  async setActive(code: string, isActive: boolean): Promise<void> {
    console.info(`LanguageRepoMock: setActive(${code}, ${isActive}) - would set language active status`);
  }

  // Validation
  async isValidLanguageCode(code: string): Promise<boolean> {
    const isValid = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar'].includes(code);
    console.info(`LanguageRepoMock: isValidLanguageCode(${code}) - returning ${isValid}`);
    return isValid;
  }

  // Count
  async getCount(): Promise<number> {
    console.info('LanguageRepoMock: getCount() - returning 10');
    return 10;
  }

  // Language creation from codes
  async createLanguageFromCode(code: string): Promise<LanguageData> {
    console.info(`LanguageRepoMock: createLanguageFromCode(${code}) - creating language from code`);
    return this.getLanguageByCode(code);
  }
}