import type { ImmersionContentData } from './ImmersionContentData';

export interface ImmersionContentRepoContract {
  getAllImmersionContent(): Promise<ImmersionContentData[]>;
  getImmersionContentById(uid: string): Promise<ImmersionContentData | undefined>;
  getRandomDueImmersionContent(): Promise<ImmersionContentData | null>;
  updateImmersionContent(content: ImmersionContentData): Promise<void>;
}