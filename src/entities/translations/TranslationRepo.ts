import Dexie, { type Table } from 'dexie';
import type { TranslationRepoContract } from './TranslationRepoContract';
import type { TranslationData } from './TranslationData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
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

  private async findIdealWrongTranslation(
    targetVocab: VocabData,
    correctTranslations: TranslationData[],
    correctAnswer: string,
    vocabRepo: VocabRepoContract
  ): Promise<string | null> {
    const dueVocab = await vocabRepo.getDueVocabInLanguage(targetVocab.language);
    
    const candidateTranslations: TranslationData[] = [];
    
    for (const vocab of dueVocab) {
      if (vocab.uid === targetVocab.uid) continue;
      
      const vocabTranslations = await this.getTranslationsByIds(vocab.translations);
      candidateTranslations.push(...vocabTranslations);
    }
    
    const idealCandidates = candidateTranslations.filter(translation => {
      if (!isLengthWithinRange(translation.content, correctAnswer.length, 3)) {
        return false;
      }
      
      const minDistance = Math.min(
        ...correctTranslations.map(ct => levenshteinDistance(translation.content, ct.content))
      );
      
      return minDistance > 2;
    });
    
    if (idealCandidates.length > 0) {
      const shuffled = shuffleArray(idealCandidates);
      return shuffled[0].content;
    }
    
    return null;
  }

  private async getFallbackWrongTranslation(
    targetVocab: VocabData,
    correctTranslations: TranslationData[]
  ): Promise<string | null> {
    const allTranslations = await this.getAllTranslationsInLanguage(targetVocab.language);
    const correctContents = new Set(correctTranslations.map(t => t.content));
    
    const candidates = allTranslations.filter(t => !correctContents.has(t.content));
    
    if (candidates.length > 0) {
      const shuffled = shuffleArray(candidates);
      return shuffled[0].content;
    }
    
    return null;
  }

  async generateWrongTranslations(
    targetVocab: VocabData,
    correctTranslations: TranslationData[],
    correctAnswer: string,
    count: number,
    vocabRepo: VocabRepoContract
  ): Promise<string[]> {
    const wrongAnswers: string[] = [];
    const usedAnswers = new Set([correctAnswer]);
    
    for (let i = 0; i < count; i++) {
      const idealWrong = await this.findIdealWrongTranslation(
        targetVocab, 
        correctTranslations, 
        correctAnswer, 
        vocabRepo
      );
      if (idealWrong && !usedAnswers.has(idealWrong)) {
        wrongAnswers.push(idealWrong);
        usedAnswers.add(idealWrong);
      }
    }
    
    while (wrongAnswers.length < count) {
      const fallbackWrong = await this.getFallbackWrongTranslation(targetVocab, correctTranslations);
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