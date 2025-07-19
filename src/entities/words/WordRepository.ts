import type { WordData } from "./WordData";

// Repository interface for accessing and managing WordData entities.
export interface WordRepository {
  getAll(): Promise<WordData[]>;
  getById(language: string, content: string): Promise<WordData | undefined>;
  add(word: WordData): Promise<void>;
  update(word: WordData): Promise<void>;
  delete(language: string, content: string): Promise<void>;
} 