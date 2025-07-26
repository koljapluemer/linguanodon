import type { ImmersionContentData } from './ImmersionContentData';

export interface ImmersionContentRepository {
  getAll(): Promise<ImmersionContentData[]>;
  getById(uid: string): Promise<ImmersionContentData | undefined>;
  add(content: ImmersionContentData): Promise<void>;
  update(content: ImmersionContentData): Promise<void>;
  delete(uid: string): Promise<void>;
  getRandom(): Promise<ImmersionContentData | undefined>;
} 