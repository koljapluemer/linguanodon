import Dexie, { type Table } from 'dexie';
import type { FactCardData } from './FactCardData';

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
    return await db.factCards.toArray();
  }

  async getByUID(uid: string): Promise<FactCardData | undefined> {
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

}