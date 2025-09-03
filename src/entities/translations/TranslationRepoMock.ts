import type { TranslationRepoContract } from './TranslationRepoContract';
import type { TranslationData } from './TranslationData';

export class TranslationRepoMock implements TranslationRepoContract {
  
  private createSampleTranslation(overrides: Partial<TranslationData> = {}): TranslationData {
    return {
      uid: crypto.randomUUID(),
      content: 'sample translation',
      priority: 1,
      notes: [],
      origins: ['user-added'],
      ...overrides
    };
  }

  // Basic CRUD operations
  async getTranslationsByIds(ids: string[]): Promise<TranslationData[]> {
    console.info(`TranslationRepoMock: getTranslationsByIds([${ids.join(', ')}]) - returning ${ids.length} translations`);
    return ids.map(id => this.createSampleTranslation({ 
      uid: id, 
      content: `translation-${id.slice(0, 8)}` 
    }));
  }

  async getTranslationByContent(content: string): Promise<TranslationData | undefined> {
    console.info(`TranslationRepoMock: getTranslationByContent("${content}") - returning matching translation`);
    return this.createSampleTranslation({ content });
  }

  async saveTranslation(translation: Omit<TranslationData, 'uid' | 'origins'>): Promise<TranslationData> {
    console.info(`TranslationRepoMock: saveTranslation("${translation.content}") - would save new translation`);
    return this.createSampleTranslation({
      ...translation,
      uid: crypto.randomUUID(),
      origins: ['user-added']
    });
  }

  async updateTranslation(translation: TranslationData): Promise<void> {
    console.info(`TranslationRepoMock: updateTranslation(${translation.uid}: "${translation.content}") - would update translation`);
  }

  async deleteTranslations(ids: string[]): Promise<void> {
    console.info(`TranslationRepoMock: deleteTranslations([${ids.join(', ')}]) - would delete ${ids.length} translations`);
  }

  // Query operations
  async findTranslationsByContent(content: string): Promise<TranslationData[]> {
    console.info(`TranslationRepoMock: findTranslationsByContent("${content}") - returning 2 matching translations`);
    return [
      this.createSampleTranslation({ content: `${content} (exact match)` }),
      this.createSampleTranslation({ content: `${content} variation` })
    ];
  }

  // Distractor generation operations
  async generateWrongTranslations(correctTranslationContent: string, count: number): Promise<string[]> {
    console.info(`TranslationRepoMock: generateWrongTranslations("${correctTranslationContent}", ${count}) - generating ${count} wrong translations`);
    return Array.from({ length: count }, (_, i) => `wrong translation ${i + 1}`);
  }
}