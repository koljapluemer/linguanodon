import type { NoteRepoContract } from './NoteRepoContract';
import type { NoteData } from './NoteData';

export class NoteRepoMock implements NoteRepoContract {
  
  private createSampleNote(overrides: Partial<NoteData> = {}): NoteData {
    return {
      uid: crypto.randomUUID(),
      content: 'Sample note content',
      showBeforeExercise: false,
      noteType: 'general',
      ...overrides
    };
  }

  // Basic CRUD operations
  async getNoteByUID(uid: string): Promise<NoteData | undefined> {
    console.info(`NoteRepoMock: getNoteByUID(${uid}) - returning sample note`);
    return this.createSampleNote({
      uid,
      content: `Note content for ${uid.slice(0, 8)}`,
      noteType: 'memo'
    });
  }

  async getNotesByUIDs(uids: string[]): Promise<NoteData[]> {
    console.info(`NoteRepoMock: getNotesByUIDs([${uids.join(', ')}]) - returning ${uids.length} notes`);
    return uids.map((uid, index) => this.createSampleNote({
      uid,
      content: `Note ${index + 1}: ${uid.slice(0, 8)}`,
      showBeforeExercise: index % 2 === 0, // Alternate true/false
      noteType: index % 3 === 0 ? 'pronunciation' : index % 3 === 1 ? 'grammar' : 'context'
    }));
  }

  async saveNote(note: Omit<NoteData, 'uid'>): Promise<NoteData> {
    console.info(`NoteRepoMock: saveNote("${note.content.slice(0, 30)}...") - would save new note`);
    return this.createSampleNote({
      ...note,
      uid: crypto.randomUUID()
    });
  }

  async updateNote(note: NoteData): Promise<void> {
    console.info(`NoteRepoMock: updateNote(${note.uid}: "${note.content.slice(0, 30)}...") - would update note`);
  }

  async deleteNote(uid: string): Promise<void> {
    console.info(`NoteRepoMock: deleteNote(${uid}) - would delete note`);
  }

  async deleteNotes(uids: string[]): Promise<void> {
    console.info(`NoteRepoMock: deleteNotes([${uids.join(', ')}]) - would delete ${uids.length} notes`);
  }

  // Remote import operations
  async createNotesFromRemote(remoteNotes: { content: string; showBeforeExercise?: boolean }[]): Promise<string[]> {
    console.info(`NoteRepoMock: createNotesFromRemote(${remoteNotes.length} notes) - would create notes from remote data`);
    const createdUids = remoteNotes.map(() => crypto.randomUUID());
    
    // Log details of what would be created
    remoteNotes.forEach((remoteNote, index) => {
      console.info(`  - Note ${index + 1}: "${remoteNote.content.slice(0, 50)}..." (showBeforeExercise: ${remoteNote.showBeforeExercise})`);
    });
    
    return createdUids;
  }
}