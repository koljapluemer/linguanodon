import type { ImmersionContentData } from './ImmersionContentData';

export interface ImmersionContentRepoContract {
  getAllImmersionContent(): Promise<ImmersionContentData[]>;
  getImmersionContentById(uid: string): Promise<ImmersionContentData | undefined>;
  getRandomDueImmersionContent(): Promise<ImmersionContentData | null>;
  saveImmersionContent(content: Partial<ImmersionContentData>): Promise<ImmersionContentData>;
  updateImmersionContent(content: ImmersionContentData): Promise<void>;
  deleteImmersionContent(uid: string): Promise<void>;
}