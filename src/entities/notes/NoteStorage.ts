import Dexie, { type Table } from 'dexie';
import type { NoteData } from './NoteData';
import demoData from '@/shared/demo-data/demo.json';

class NoteDatabase extends Dexie {
  notes!: Table<NoteData>;

  constructor() {
    super('NoteDatabase');
    this.version(1).stores({
      notes: 'uid'
    });
  }
}

const db = new NoteDatabase();

export class NoteStorage {
  async getById(uid: string): Promise<NoteData | undefined> {
    await this.ensureDemoData();
    return await db.notes.get(uid);
  }

  async getByIds(uids: string[]): Promise<NoteData[]> {
    await this.ensureDemoData();
    return await db.notes.where('uid').anyOf(uids).toArray();
  }

  async add(note: NoteData): Promise<void> {
    await db.notes.add(note);
  }

  async update(note: NoteData): Promise<void> {
    await db.notes.put(note);
  }

  async delete(uid: string): Promise<void> {
    await db.notes.delete(uid);
  }

  async deleteMultiple(uids: string[]): Promise<void> {
    await db.notes.where('uid').anyOf(uids).delete();
  }

  async count(): Promise<number> {
    return await db.notes.count();
  }

  private async ensureDemoData(): Promise<void> {
    const count = await db.notes.count();
    if (count === 0 && demoData.notes) {
      await db.notes.bulkAdd(demoData.notes);
    }
  }
}