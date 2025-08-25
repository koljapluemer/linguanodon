import Dexie, { type Table } from 'dexie';
import type { TranslationRepoContract } from './TranslationRepoContract';
import type { TranslationData } from './TranslationData';
import { levenshteinDistance, isLengthWithinRange } from '@/shared/stringUtils';
import { shuffleArray } from '@/shared/arrayUtils';

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

  async saveOrGetExistingTranslation(translation: Omit<TranslationData, 'uid' | 'origins'>): Promise<TranslationData> {
    // Check if a translation with this content already exists
    const existing = await this.getTranslationByContent(translation.content);
    
    if (existing) {
      // Update the existing translation with new data if needed
      const updated: TranslationData = {
        ...existing,
        priority: translation.priority,
        notes: translation.notes
      };
      
      await this.updateTranslation(updated);
      return updated;
    } else {
      // Create new translation
      return await this.saveTranslation(translation);
    }
  }

  async updateTranslation(translation: TranslationData): Promise<void> {
    await translationDb.translations.put(translation);
  }

  async deleteTranslations(ids: string[]): Promise<void> {
    await translationDb.translations.where('uid').anyOf(ids).delete();
  }

  async findTranslationsByContent(content: string): Promise<TranslationData[]> {
    return await translationDb.translations.where('content').equals(content).toArray();
  }

  private async findIdealWrongTranslation(correctTranslationContent: string): Promise<string | null> {
    const allTranslations = await translationDb.translations.toArray();
    
    const idealCandidates = allTranslations.filter(translation => {
      if (translation.content === correctTranslationContent) return false;
      
      if (!isLengthWithinRange(translation.content, correctTranslationContent.length, 3)) {
        return false;
      }
      
      return levenshteinDistance(translation.content, correctTranslationContent) > 2;
    });
    
    if (idealCandidates.length > 0) {
      const shuffled = shuffleArray(idealCandidates);
      return shuffled[0].content;
    }
    
    return null;
  }

  private async getFallbackWrongTranslation(correctTranslationContent: string): Promise<string | null> {
    const allTranslations = await translationDb.translations.toArray();
    
    const candidates = allTranslations.filter(translation => 
      translation.content !== correctTranslationContent
    );
    
    if (candidates.length > 0) {
      const shuffled = shuffleArray(candidates);
      return shuffled[0].content;
    }
    
    return null;
  }

  async generateWrongTranslations(correctTranslationContent: string, count: number): Promise<string[]> {
    const wrongAnswers: string[] = [];
    const usedAnswers = new Set([correctTranslationContent]);
    
    for (let i = 0; i < count; i++) {
      const idealWrong = await this.findIdealWrongTranslation(correctTranslationContent);
      if (idealWrong && !usedAnswers.has(idealWrong)) {
        wrongAnswers.push(idealWrong);
        usedAnswers.add(idealWrong);
      }
    }
    
    while (wrongAnswers.length < count) {
      const fallbackWrong = await this.getFallbackWrongTranslation(correctTranslationContent);
      if (fallbackWrong && !usedAnswers.has(fallbackWrong)) {
        wrongAnswers.push(fallbackWrong);
        usedAnswers.add(fallbackWrong);
      } else {
        break;
      }
    }
    
    return wrongAnswers;
  }
}