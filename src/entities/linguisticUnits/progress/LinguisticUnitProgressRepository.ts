import type { LinguisticUnitProgressData } from "./LinguisticUnitProgressData";

export interface LinguisticUnitProgressRepository {
  get(language: string, content: string, type: 'word' | 'sentence'): Promise<LinguisticUnitProgressData | undefined>;
  upsert(progress: LinguisticUnitProgressData): Promise<void>;
  getAll(): Promise<LinguisticUnitProgressData[]>;
  clear(): Promise<void>;
} 