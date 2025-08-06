import Dexie, { type Table } from 'dexie';
import type { VocabData } from './VocabData';


class VocabDatabase extends Dexie {
  vocab!: Table<VocabData>;

  constructor() {
    super('VocabDatabase');
    this.version(1).stores({
      vocab: 'uid, language, content'
    });
  }
}

const db = new VocabDatabase();

export class VocabStorage {
  
  async getAll(): Promise<VocabData[]> {
    return await db.vocab.toArray();
  }

  async getById(uid: string): Promise<VocabData | undefined> {
    return await db.vocab.get(uid);
  }

  async getByLanguageAndContent(language: string, content: string): Promise<VocabData | undefined> {
    return await db.vocab.where({ language, content }).first();
  }

  async add(vocab: VocabData): Promise<string> {
    await db.vocab.add(vocab);
    return vocab.uid;
  }

  async update(vocab: VocabData): Promise<void> {
    await db.vocab.put(vocab);
  }

  async delete(uid: string): Promise<void> {
    await db.vocab.delete(uid);
  }

  async count(): Promise<number> {
    return await db.vocab.count();
  }

}