import { NoteStorage } from './NoteStorage';
import type { NoteRepoContract } from './NoteRepoContract';
import type { NoteData } from './NoteData';

export class NoteRepo implements NoteRepoContract {
  private storage = new NoteStorage();

  private ensureNoteFields(note: NoteData): NoteData {
    return {
      ...note,
      content: note.content || '',
      showBeforeExercise: note.showBeforeExercise ?? false
    };
  }

  async getNoteByUID(uid: string): Promise<NoteData | undefined> {
    const note = await this.storage.getById(uid);
    return note ? this.ensureNoteFields(note) : undefined;
  }

  async getNotesByUIDs(uids: string[]): Promise<NoteData[]> {
    const notes = await this.storage.getByIds(uids);
    return notes.map(note => this.ensureNoteFields(note));
  }

  async saveNote(note: Omit<NoteData, 'uid'>): Promise<NoteData> {
    const newNote: NoteData = {
      uid: crypto.randomUUID(),
      content: note.content,
      showBeforeExercise: note.showBeforeExercise ?? false
    };

    await this.storage.add(newNote);
    return newNote;
  }

  async updateNote(note: NoteData): Promise<void> {
    await this.storage.update(note);
  }

  async deleteNote(uid: string): Promise<void> {
    await this.storage.delete(uid);
  }

  async deleteNotes(uids: string[]): Promise<void> {
    await this.storage.deleteMultiple(uids);
  }

  async createNotesFromRemote(remoteNotes: { content: string; showBeforeExercise?: boolean }[]): Promise<string[]> {
    const noteUids: string[] = [];
    
    for (const remoteNote of remoteNotes) {
      const noteData: Omit<NoteData, 'uid'> = {
        content: remoteNote.content,
        showBeforeExercise: remoteNote.showBeforeExercise
      };
      const savedNote = await this.saveNote(noteData);
      noteUids.push(savedNote.uid);
    }
    
    return noteUids;
  }
}