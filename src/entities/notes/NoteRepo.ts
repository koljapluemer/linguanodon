import Dexie, { type Table } from 'dexie';
import type { NoteRepoContract } from './NoteRepoContract';
import type { NoteData } from './NoteData';

class NoteDatabase extends Dexie {
  notes!: Table<NoteData>;

  constructor() {
    super('NoteDatabase');
    this.version(1).stores({
      notes: 'uid'
    });
  }
}

export class NoteRepo implements NoteRepoContract {
  private db = new NoteDatabase();

  private ensureNoteFields(note: NoteData): NoteData {
    return {
      ...note,
      content: note.content || '',
      showBeforeExercise: note.showBeforeExercise ?? false,
      noteType: note.noteType
    };
  }

  async getNoteByUID(uid: string): Promise<NoteData | undefined> {
    const note = await this.db.notes.get(uid);
    return note ? this.ensureNoteFields(note) : undefined;
  }

  async getNotesByUIDs(uids: string[]): Promise<NoteData[]> {
    const notes = await this.db.notes.where('uid').anyOf(uids).toArray();
    return notes.map(note => this.ensureNoteFields(note));
  }

  async saveNote(note: Omit<NoteData, 'uid'>): Promise<NoteData> {
    const newNote: NoteData = {
      uid: crypto.randomUUID(),
      content: note.content,
      showBeforeExercise: note.showBeforeExercise ?? false,
      noteType: note.noteType
    };

    await this.db.notes.add(newNote);
    return newNote;
  }

  async updateNote(note: NoteData): Promise<void> {
    await this.db.notes.put(note);
  }

  async deleteNote(uid: string): Promise<void> {
    await this.db.notes.delete(uid);
  }

  async deleteNotes(uids: string[]): Promise<void> {
    await this.db.notes.where('uid').anyOf(uids).delete();
  }

  async createNotesFromRemote(remoteNotes: { content: string; showBeforeExercise?: boolean; noteType?: string }[]): Promise<string[]> {
    const noteUids: string[] = [];

    for (const remoteNote of remoteNotes) {
      const noteData: Omit<NoteData, 'uid'> = {
        content: remoteNote.content,
        showBeforeExercise: remoteNote.showBeforeExercise,
        noteType: remoteNote.noteType
      };
      const savedNote = await this.saveNote(noteData);
      noteUids.push(savedNote.uid);
    }

    return noteUids;
  }


  async createNotesFromRemoteBatch(remoteNotes: { id?: string; content: string; showBeforeExercice?: boolean; noteType?: string }[], onProgress?: (current: number, total: number) => void): Promise<Map<string, string>> {
    if (remoteNotes.length === 0) {
      onProgress?.(0, 0);
      return new Map();
    }

    const newNotes: NoteData[] = [];
    const remoteIdToLocalUid = new Map<string, string>();

    // Process all remote notes - create a new note for each one
    for (let i = 0; i < remoteNotes.length; i++) {
      const remoteNote = remoteNotes[i];
      onProgress?.(i, remoteNotes.length);

      const localNote: NoteData = {
        uid: crypto.randomUUID(),
        content: remoteNote.content,
        showBeforeExercise: remoteNote.showBeforeExercice ?? false,
        noteType: remoteNote.noteType
      };

      newNotes.push(localNote);

      if (remoteNote.id) {
        remoteIdToLocalUid.set(remoteNote.id, localNote.uid);
      }
    }

    // Bulk insert all notes
    if (newNotes.length > 0) {
      await this.db.transaction('rw', this.db.notes, async () => {
        await this.db.notes.bulkAdd(newNotes);
      });
    }

    onProgress?.(remoteNotes.length, remoteNotes.length);
    return remoteIdToLocalUid;
  }
}