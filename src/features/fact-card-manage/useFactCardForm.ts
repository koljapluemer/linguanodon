import { ref, computed, inject, watch } from 'vue';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { FactCardFormState, FactCardFormData } from './types';
import { factCardDataToFormData, formDataToFactCardData } from './types';

export function useFactCardForm(factCardUID?: string) {
  const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
  const noteRepo = inject<NoteRepoContract>('noteRepo');
  if (!factCardRepo) {
    throw new Error('FactCardRepo not provided');
  }
  if (!noteRepo) {
    throw new Error('NoteRepo not provided');
  }

  const state = ref<FactCardFormState>({
    formData: {
      language: '',
      front: '',
      back: '',
      notes: [],
      priority: undefined,
      doNotPractice: undefined
    },
    loading: false,
    saving: false,
    error: null,
    isEditing: !!factCardUID
  });

  const loadedFactCardData = ref<FactCardData | null>(null);
  const loadedNotes = ref<NoteData[]>([]);

  const isValid = computed(() => {
    return state.value.formData.language.trim() !== '' && 
           state.value.formData.front.trim() !== '' &&
           state.value.formData.back.trim() !== '';
  });

  // Auto-save functionality
  let autoSaveTimeout: number | null = null;

  function scheduleAutoSave() {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Auto-save after 1 second of inactivity
    autoSaveTimeout = window.setTimeout(() => {
      if (state.value.isEditing && isValid.value && !state.value.saving) {
        autoSave();
      }
    }, 1000);
  }

  async function autoSave() {
    if (!state.value.isEditing || !factCardUID || !isValid.value) return;

    try {
      state.value.saving = true;
      await saveInternal();
    } catch (error) {
      console.warn('Auto-save failed:', error);
    } finally {
      state.value.saving = false;
    }
  }

  // Watch for form changes to trigger auto-save
  watch(
    () => state.value.formData,
    () => {
      if (state.value.isEditing) {
        scheduleAutoSave();
      }
    },
    { deep: true }
  );

  // Helper function to serialize form data and avoid proxy issues
  function serializeFormData(formData: FactCardFormData): FactCardFormData {
    return JSON.parse(JSON.stringify(formData));
  }

  async function loadFactCard() {
    if (!factCardUID || !factCardRepo) return;

    state.value.loading = true;
    state.value.error = null;

    try {
      const factCard = await factCardRepo.getFactCardByUID(factCardUID);
      if (factCard) {
        loadedFactCardData.value = factCard;
        
        // Load notes if fact card has note IDs
        if (factCard.notes && factCard.notes.length > 0 && noteRepo) {
          try {
            const notes = await noteRepo.getNotesByUIDs(factCard.notes);
            loadedNotes.value = notes;
          } catch (error) {
            console.error('Failed to load notes:', error);
            loadedNotes.value = [];
          }
        } else {
          loadedNotes.value = [];
        }
        
        state.value.formData = factCardDataToFormData(factCard, loadedNotes.value);
      } else {
        state.value.error = 'Fact card not found';
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to load fact card';
    } finally {
      state.value.loading = false;
    }
  }

  async function saveInternal(): Promise<void> {
    if (!factCardRepo) throw new Error('FactCardRepo not available');
    if (!noteRepo) throw new Error('NoteRepo not available');

    // Serialize form data to avoid proxy issues
    const serializedFormData = serializeFormData(state.value.formData);

    // Save/update notes first
    for (const note of serializedFormData.notes) {
      if (note.uid && loadedNotes.value.find(n => n.uid === note.uid)) {
        // Update existing note
        await noteRepo.updateNote(note);
      } else if (!note.uid || !loadedNotes.value.find(n => n.uid === note.uid)) {
        // Create new note
        const savedNote = await noteRepo.saveNote(note);
        // Update the note in form data with the saved UID
        const noteIndex = serializedFormData.notes.findIndex(n => n === note);
        if (noteIndex >= 0) {
          serializedFormData.notes[noteIndex] = savedNote;
        }
      }
    }

    // Delete notes that were removed from the form
    const currentNoteUIDs = serializedFormData.notes.map(n => n.uid);
    const notesToDelete = loadedNotes.value.filter(n => !currentNoteUIDs.includes(n.uid));
    if (notesToDelete.length > 0) {
      await noteRepo.deleteNotes(notesToDelete.map(n => n.uid));
    }

    if (state.value.isEditing && factCardUID) {
      // Get existing fact card for update
      const existingFactCard = await factCardRepo.getFactCardByUID(factCardUID);
      if (!existingFactCard) {
        throw new Error('Fact card not found');
      }

      const updatedFactCard = {
        ...existingFactCard,
        ...formDataToFactCardData(serializedFormData, existingFactCard)
      };
      
      await factCardRepo.updateFactCard(updatedFactCard);
    } else {
      // Create new fact card
      await factCardRepo.saveFactCard(formDataToFactCardData(serializedFormData));
    }

    // Update loaded notes to match current state
    loadedNotes.value = [...serializedFormData.notes];
  }

  async function save(): Promise<boolean> {
    if (!isValid.value || !factCardRepo) {
      state.value.error = 'Please fill in required fields';
      return false;
    }

    state.value.saving = true;
    state.value.error = null;

    try {
      await saveInternal();
      return true;
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to save fact card';
      return false;
    } finally {
      state.value.saving = false;
    }
  }

  function addNote() {
    const newNote: NoteData = {
      uid: crypto.randomUUID(),
      content: '',
      showBeforeExercise: false
    };
    state.value.formData.notes.push(newNote);
  }

  function updateNote(updatedNote: NoteData) {
    const index = state.value.formData.notes.findIndex(n => n.uid === updatedNote.uid);
    if (index >= 0) {
      state.value.formData.notes[index] = updatedNote;
    }
  }

  function removeNote(uid: string) {
    const index = state.value.formData.notes.findIndex(n => n.uid === uid);
    if (index >= 0) {
      state.value.formData.notes.splice(index, 1);
    }
  }

  function reset() {
    state.value.formData = {
      language: '',
      front: '',
      back: '',
      notes: [],
      priority: undefined,
      doNotPractice: undefined
    };
    state.value.error = null;
  }

  return {
    state: computed(() => state.value),
    loadedFactCardData: computed(() => loadedFactCardData.value),
    loadedNotes: computed(() => loadedNotes.value),
    isValid,
    loadFactCard,
    save,
    addNote,
    updateNote,
    removeNote,
    reset
  };
}