import type { NoteData } from './NoteData';

export interface NoteRepoContract {
  // Basic CRUD operations
  getNoteByUID(uid: string): Promise<NoteData | undefined>;
  getNotesByUIDs(uids: string[]): Promise<NoteData[]>;
  saveNote(note: Partial<NoteData>): Promise<NoteData>;
  updateNote(note: NoteData): Promise<void>;
  deleteNote(uid: string): Promise<void>;
  deleteNotes(uids: string[]): Promise<void>;
  
  // Remote import operations
  createNotesFromRemote(remoteNotes: { content: string; showBeforeExercise?: boolean }[]): Promise<string[]>;
}