import { ref, computed, inject } from 'vue';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { VocabFormState, VocabFormData } from './types';
import { vocabDataToFormData, formDataToVocabData } from './types';

export function useVocabForm(vocabId?: string, emit?: (event: 'vocab-saved', vocabId: string) => void) {
  const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
  const noteRepo = inject<NoteRepoContract>('noteRepo');
  if (!vocabRepo) {
    throw new Error('VocabRepo not provided');
  }
  if (!noteRepo) {
    throw new Error('NoteRepo not provided');
  }

  const state = ref<VocabFormState>({
    formData: {
      language: '',
      content: '',
      translations: [],
      priority: undefined,
      doNotPractice: undefined,
      notes: [],
      links: []
    },
    loading: false,
    saving: false,
    error: null,
    isEditing: !!vocabId
  });

  const loadedVocabData = ref<VocabData | null>(null);
  const loadedNotes = ref<NoteData[]>([]);
  const loadedTranslations = ref<TranslationData[]>([]);

  const isValid = computed(() => {
    return state.value.formData.language.trim() !== '' && 
           state.value.formData.content.trim() !== '';
  });


  // Helper function to serialize form data and avoid proxy issues
  function serializeFormData(formData: VocabFormData): VocabFormData {
    return JSON.parse(JSON.stringify(formData));
  }

  async function loadVocab() {
    if (!vocabId || !vocabRepo) return;

    state.value.loading = true;
    state.value.error = null;

    try {
      const vocab = await vocabRepo.getVocabByUID(vocabId);
      if (vocab) {
        loadedVocabData.value = vocab;
        
        // Load notes if vocab has note IDs
        if (vocab.notes && vocab.notes.length > 0 && noteRepo) {
          try {
            const notes = await noteRepo.getNotesByUIDs(vocab.notes);
            loadedNotes.value = notes;
          } catch (error) {
            console.error('Failed to load notes:', error);
            // Continue without notes if they fail to load
            loadedNotes.value = [];
          }
        } else {
          loadedNotes.value = [];
        }

        // Load translations if vocab has translation IDs
        if (vocab.translations && vocab.translations.length > 0) {
          try {
            const translations = await vocabRepo.getTranslationsByIds(vocab.translations);
            loadedTranslations.value = translations;
          } catch (error) {
            console.error('Failed to load translations:', error);
            // Continue without translations if they fail to load
            loadedTranslations.value = [];
          }
        } else {
          loadedTranslations.value = [];
        }
        
        state.value.formData = vocabDataToFormData(vocab, loadedNotes.value, loadedTranslations.value);
      } else {
        state.value.error = 'Vocab not found';
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to load vocab';
    } finally {
      state.value.loading = false;
    }
  }

  async function saveInternal(): Promise<void> {
    if (!vocabRepo) throw new Error('VocabRepo not available');
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

    // Save/update translations
    for (const translation of serializedFormData.translations) {
      if (translation.uid && loadedTranslations.value.find(t => t.uid === translation.uid)) {
        // Update existing translation
        await vocabRepo.updateTranslation(translation);
      } else if (!translation.uid || !loadedTranslations.value.find(t => t.uid === translation.uid)) {
        // Create new translation
        const savedTranslation = await vocabRepo.saveTranslation(translation);
        // Update the translation in form data with the saved UID
        const translationIndex = serializedFormData.translations.findIndex(t => t === translation);
        if (translationIndex >= 0) {
          serializedFormData.translations[translationIndex] = savedTranslation;
        }
      }
    }

    // Delete translations that were removed from the form
    const currentTranslationUIDs = serializedFormData.translations.map(t => t.uid);
    const translationsToDelete = loadedTranslations.value.filter(t => !currentTranslationUIDs.includes(t.uid));
    if (translationsToDelete.length > 0) {
      await vocabRepo.deleteTranslations(translationsToDelete.map(t => t.uid));
    }

    let finalVocabId = vocabId;
    
    if (state.value.isEditing && vocabId) {
      // Get existing vocab for update
      const existingVocab = await vocabRepo.getVocabByUID(vocabId);
      if (!existingVocab) {
        throw new Error('Vocab not found');
      }

      const updatedVocab = {
        ...existingVocab,
        ...formDataToVocabData(serializedFormData, existingVocab)
      };
      
      await vocabRepo.updateVocab(updatedVocab);
      finalVocabId = updatedVocab.uid;
    } else {
      // Create new vocab
      const savedVocab = await vocabRepo.saveVocab(formDataToVocabData(serializedFormData));
      finalVocabId = savedVocab.uid;
    }

    // Emit vocab-saved event
    if (emit && finalVocabId) {
      emit('vocab-saved', finalVocabId);
    }

    // Update loaded notes and translations to match current state
    loadedNotes.value = [...serializedFormData.notes];
    loadedTranslations.value = [...serializedFormData.translations];
  }

  async function save(): Promise<boolean> {
    if (!isValid.value || !vocabRepo) {
      state.value.error = 'Please fill in required fields';
      return false;
    }

    state.value.saving = true;
    state.value.error = null;

    try {
      await saveInternal();
      return true;
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to save vocab';
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

  function addLink() {
    state.value.formData.links.push({
      label: '',
      url: ''
    });
  }

  function removeLink(index: number) {
    state.value.formData.links.splice(index, 1);
  }

  function reset() {
    state.value.formData = {
      language: '',
      content: '',
      translations: [],
      priority: undefined,
      doNotPractice: undefined,
      notes: [],
      links: []
    };
    state.value.error = null;
  }

  return {
    state: computed(() => state.value),
    loadedVocabData: computed(() => loadedVocabData.value),
    loadedNotes: computed(() => loadedNotes.value),
    loadedTranslations: computed(() => loadedTranslations.value),
    isValid,
    loadVocab,
    save,
    addNote,
    updateNote,
    removeNote,
    addLink,
    removeLink,
    reset
  };
}