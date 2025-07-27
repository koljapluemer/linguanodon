import Dexie, { type Table } from 'dexie';
import type { ExampleData } from './ExampleData';
import demoData from '@/shared/demo-data/load_this.json';

class ExampleDatabase extends Dexie {
  examples!: Table<ExampleData>;

  constructor() {
    super('ExampleDatabase');
    this.version(1).stores({
      examples: 'id, language, isUserCreated'
    });
  }
}

const db = new ExampleDatabase();

export class ExampleStorage {
  async getAll(): Promise<ExampleData[]> {
    await this.ensureDemoData();
    return await db.examples.toArray();
  }

  async getById(id: string): Promise<ExampleData | undefined> {
    await this.ensureDemoData();
    return await db.examples.get(id);
  }

  async add(example: ExampleData): Promise<void> {
    await db.examples.add(example);
  }

  async update(example: ExampleData): Promise<void> {
    await db.examples.put(example);
  }

  async delete(id: string): Promise<void> {
    await db.examples.delete(id);
  }

  async count(): Promise<number> {
    return await db.examples.count();
  }

  private async ensureDemoData(): Promise<void> {
    const count = await db.examples.count();
    if (count === 0) {
      await db.examples.bulkAdd(demoData.examples);
    }
  }
}