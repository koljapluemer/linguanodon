import Dexie, { type Table } from 'dexie';
import type { ImmersionContentData } from './ImmersionContentData';
import demoData from '@/shared/demo-data/italian-basic.json';

class ImmersionContentDatabase extends Dexie {
  immersionContent!: Table<ImmersionContentData>;

  constructor() {
    super('ImmersionContentDatabase');
    this.version(1).stores({
      immersionContent: 'uid, language, priority, taskType'
    });
  }
}

const db = new ImmersionContentDatabase();

export class ImmersionContentStorage {
  
  async getAll(): Promise<ImmersionContentData[]> {
    await this.ensureDemoData();
    return await db.immersionContent.toArray();
  }

  async getById(uid: string): Promise<ImmersionContentData | undefined> {
    await this.ensureDemoData();
    return await db.immersionContent.get(uid);
  }

  async getDueContent(): Promise<ImmersionContentData[]> {
    await this.ensureDemoData();
    const now = new Date();
    
    return await db.immersionContent
      .filter(content => {
        // New content (never shown)
        if (!content.lastShownAt) return true;
        
        // Content user wants to do again and is past next show time
        if (content.wantToDoAgain && content.nextShownEarliestAt) {
          return now >= content.nextShownEarliestAt;
        }
        
        return false;
      })
      .toArray();
  }

  async add(content: ImmersionContentData): Promise<string> {
    await db.immersionContent.add(content);
    return content.uid;
  }

  async update(content: ImmersionContentData): Promise<void> {
    await db.immersionContent.put(content);
  }

  async delete(uid: string): Promise<void> {
    await db.immersionContent.delete(uid);
  }

  private async ensureDemoData(): Promise<void> {
    const count = await db.immersionContent.count();
    if (count === 0) {
      await db.immersionContent.bulkAdd(demoData.immersionContent);
    }
  }
}