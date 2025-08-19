import type { ImmersionContentData } from './ImmersionContentData';

export interface ImmersionContentRepoContract {
  getAllImmersionContent(setsToAvoid?: string[]): Promise<ImmersionContentData[]>;
  getImmersionContentById(uid: string): Promise<ImmersionContentData | undefined>;
  getImmersionContentByTitleAndLanguage(title: string, language: string): Promise<ImmersionContentData | undefined>;
  getRandomDueImmersionContent(): Promise<ImmersionContentData | null>;
  saveImmersionContent(immersionContent: Omit<ImmersionContentData, 'uid' | 'tasks' | 'lastShownAt'>): Promise<ImmersionContentData>;
  updateImmersionContent(immersionContent: ImmersionContentData): Promise<void>;
  deleteImmersionContent(uid: string): Promise<void>;
  disconnectNeededVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void>;
  disconnectExtractedVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void>;
}