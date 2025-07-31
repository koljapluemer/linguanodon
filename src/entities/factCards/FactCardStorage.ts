import Dexie, { type Table } from 'dexie';
import type { FactCardData } from './FactCardData';
import demoData from '@/shared/demo-data/demo.json';

class FactCardDatabase extends Dexie {
  factCards!: Table<FactCardData>;

  constructor() {
    super('FactCardDatabase');
    this.version(1).stores({
      factCards: 'uid, language'
    });
  }
}

const db = new FactCardDatabase();

export class FactCardStorage {
  async getAll(): Promise<FactCardData[]> {
    await this.ensureDemoData();
    return await db.factCards.toArray();
  }

  async getByUID(uid: string): Promise<FactCardData | undefined> {
    await this.ensureDemoData();
    return await db.factCards.get(uid);
  }

  async add(factCard: FactCardData): Promise<void> {
    await db.factCards.add(factCard);
  }

  async update(factCard: FactCardData): Promise<void> {
    await db.factCards.put(factCard);
  }

  async delete(uid: string): Promise<void> {
    await db.factCards.delete(uid);
  }

  async count(): Promise<number> {
    return await db.factCards.count();
  }

  private async ensureDemoData(): Promise<void> {
    const count = await db.factCards.count();
    if (count === 0 && demoData.factCards) {
      // Convert string dates to Date objects for ts-fsrs compatibility
      const factCardsWithDateObjects = demoData.factCards.map(factCard => ({
        ...factCard,
        progress: {
          ...factCard.progress,
          due: new Date(factCard.progress.due),
          last_review: factCard.progress.last_review ? new Date(factCard.progress.last_review) : undefined
        }
      })) as unknown as FactCardData[];
      await db.factCards.bulkAdd(factCardsWithDateObjects);
    }
  }
}