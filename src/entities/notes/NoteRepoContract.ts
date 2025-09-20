import type { NoteData } from './NoteData';

export interface NoteRepoContract {
  // Basic CRUD operations
  getNoteByUID(uid: string): Promise<NoteData | undefined>;
  getNotesByUIDs(uids: string[]): Promise<NoteData[]>;
  saveNote(note: Omit<NoteData, 'uid'>): Promise<NoteData>;
  updateNote(note: NoteData): Promise<void>;
  deleteNote(uid: string): Promise<void>;
  deleteNotes(uids: string[]): Promise<void>;

  // Remote import operations
  createNotesFromRemote(remoteNotes: { content: string; showBeforeExercise?: boolean }[]): Promise<string[]>;

  // Batch operations for performance
  createNotesFromRemoteBatch(remoteNotes: { id?: string; content: string; showBeforeExercice?: boolean; noteType?: string }[], onProgress?: (current: number, total: number) => void): Promise<Map<string, string>>;
}