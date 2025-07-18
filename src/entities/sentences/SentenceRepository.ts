import type { SentenceData } from "./SentenceData";

// Repository interface for accessing and managing SentenceData entities.
export interface SentenceRepository {
  getAll(): Promise<SentenceData[]>;
  getById(language: string, content: string): Promise<SentenceData | undefined>;
  add(sentence: SentenceData): Promise<void>;
  update(sentence: SentenceData): Promise<void>;
  delete(language: string, content: string): Promise<void>;
} 