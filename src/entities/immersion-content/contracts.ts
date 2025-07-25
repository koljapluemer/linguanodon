import type { ImmersionContentData } from './ImmersionContentData';

export interface ImmersionContentServiceContract {
  getAll(): Promise<ImmersionContentData[]>;
  getById(uid: string): Promise<ImmersionContentData | null>;
  add(content: ImmersionContentData): Promise<void>;
  update(content: ImmersionContentData): Promise<void>;
  delete(uid: string): Promise<void>;
  getRandom(): Promise<ImmersionContentData | null>;
} 