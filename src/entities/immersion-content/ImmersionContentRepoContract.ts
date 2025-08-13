import type { ImmersionContentData } from './ImmersionContentData';

export interface ImmersionContentRepoContract {
  getAllImmersionContent(): Promise<ImmersionContentData[]>;
  getImmersionContentById(uid: string): Promise<ImmersionContentData | undefined>;
  getRandomDueImmersionContent(): Promise<ImmersionContentData | null>;
  saveImmersionContent(immersionContent: Partial<ImmersionContentData>): Promise<ImmersionContentData>;
  updateImmersionContent(immersionContent: ImmersionContentData): Promise<void>;
  deleteImmersionContent(uid: string): Promise<void>;
  disconnectNeededVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void>;
  disconnectExtractedVocabFromImmersionContent(immersionContentUid: string, vocabUid: string): Promise<void>;
}