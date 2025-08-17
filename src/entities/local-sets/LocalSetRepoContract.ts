import type { LocalSetData } from './LocalSetData';

export interface LocalSetRepoContract {
  getAllLocalSets(): Promise<LocalSetData[]>;
  getLocalSetById(uid: string): Promise<LocalSetData | undefined>;
  getLocalSetByName(name: string): Promise<LocalSetData | undefined>;
  getLocalSetsByLanguage(language: string): Promise<LocalSetData[]>;
  saveLocalSet(localSet: Omit<LocalSetData, 'uid'>): Promise<LocalSetData>;
  updateLocalSet(localSet: LocalSetData): Promise<void>;
  deleteLocalSet(uid: string): Promise<void>;
  isRemoteSetDownloaded(name: string): Promise<boolean>;
}