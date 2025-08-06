import Dexie, { type Table } from 'dexie';
import type { ExampleData } from './ExampleData';

class ExampleDatabase extends Dexie {
  examples!: Table<ExampleData>;

  constructor() {
    super('ExampleDatabase');
    this.version(1).stores({
      examples: 'uid, language, isUserCreated'
    });
  }
}

const db = new ExampleDatabase();

export class ExampleStorage {
  async getAll(): Promise<ExampleData[]> {
    return await db.examples.toArray();
  }

  async getById(uid: string): Promise<ExampleData | undefined> {
    return await db.examples.get(uid);
  }

  async add(example: ExampleData): Promise<void> {
    await db.examples.add(example);
  }

  async update(example: ExampleData): Promise<void> {
    await db.examples.put(example);
  }

  async delete(uid: string): Promise<void> {
    await db.examples.delete(uid);
  }

  async count(): Promise<number> {
    return await db.examples.count();
  }

}