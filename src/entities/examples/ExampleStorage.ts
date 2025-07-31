import Dexie, { type Table } from 'dexie';
import type { ExampleData } from './ExampleData';
import demoData from '@/shared/demo-data/demo.json';

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
    await this.ensureDemoData();
    return await db.examples.toArray();
  }

  async getById(uid: string): Promise<ExampleData | undefined> {
    await this.ensureDemoData();
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

  private async ensureDemoData(): Promise<void> {
    const count = await db.examples.count();
    if (count === 0) {
      // Convert numeric dates to Date objects for ts-fsrs compatibility
      const examplesWithDateObjects = demoData.examples.map(example => ({
        ...example,
        progress: {
          ...example.progress,
          due: new Date(example.progress.due)
        }
      })) as unknown as ExampleData[];
      await db.examples.bulkAdd(examplesWithDateObjects);
    }
  }
}