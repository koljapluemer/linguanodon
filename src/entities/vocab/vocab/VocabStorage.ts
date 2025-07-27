import Dexie, { type Table } from 'dexie';
import type { VocabData } from './VocabData';
import { createEmptyCard } from 'ts-fsrs';
import demoData from '@/shared/demo-data/load_this.json';


class VocabDatabase extends Dexie {
  vocab!: Table<VocabData>;

  constructor() {
    super('VocabDatabase');
    this.version(1).stores({
      vocab: 'id, language, content, pronunciation'
    });
  }
}

const db = new VocabDatabase();

export class VocabStorage {
  
  async getAll(): Promise<VocabData[]> {
    await this.ensureDemoData();
    return await db.vocab.toArray();
  }

  async getById(id: string): Promise<VocabData | undefined> {
    await this.ensureDemoData();
    return await db.vocab.get(id);
  }

  async getByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined> {
    await this.ensureDemoData();
    return await db.vocab.where({ language, content }).first();
  }

  async add(vocab: VocabData): Promise<string> {
    await db.vocab.add(vocab);
    return vocab.id;
  }

  async update(vocab: VocabData): Promise<void> {
    await db.vocab.put(vocab);
  }

  async delete(id: string): Promise<void> {
    await db.vocab.delete(id);
  }

  async count(): Promise<number> {
    return await db.vocab.count();
  }

  private async ensureDemoData(): Promise<void> {
    const count = await db.vocab.count();
    if (count === 0) {
      const vocabWithProgress = demoData.vocab.map(vocab => ({
        ...vocab,
        content: vocab.content || '',
        pronunciation: (vocab as { pronunciation?: string }).pronunciation || '',
        notes: (vocab as { notes?: Array<{ content: string; showBeforeExercise: boolean }> }).notes || [],
        progress: {
          ...createEmptyCard(),
          streak: 0,
          level: -1
        }
      }));
      
      await db.vocab.bulkAdd(vocabWithProgress);
    }
  }
}