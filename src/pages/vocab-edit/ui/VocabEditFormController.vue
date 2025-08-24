<template>
  <div>
    <VocabFormMetaRenderer
      :form-data="state.formData"
      :loading="state.loading"
      :saving="state.saving"
      :error="state.error"
      :is-editing="state.isEditing"
      :loaded-vocab-data="loadedVocabData"
      @field-change="handleFieldChange"
      @add-note="addNote"
      @update-note="updateNote"
      @remove-note="removeNote"
      @add-link="addLink"
      @remove-link="removeLink"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import { toRaw } from 'vue';
import VocabFormMetaRenderer from './VocabFormMetaRenderer.vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Length } from '@/shared/Length';

interface VocabFormData {
  id?: string;
  language: string;
  content: string;
  length: keyof typeof Length;
  translations: TranslationData[];
  priority?: number;
  doNotPractice?: boolean;
  notes: NoteData[];
  links: Array<{
    label: string;
    url: string;
  }>;
}

interface VocabFormState {
  formData: VocabFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
}

function vocabDataToFormData(vocab: VocabData, notes: NoteData[] = [], translations: TranslationData[] = []): VocabFormData {
  return {
    id: vocab.uid,
    language: vocab.language,
    content: vocab.content || '',
    length: vocab.length,
    translations: translations,
    priority: vocab.priority,
    doNotPractice: vocab.doNotPractice,
    notes: notes,
    links: vocab.links ? [...vocab.links] : []
  };
}

function formDataToVocabData(formData: VocabFormData, existingVocab?: VocabData): Omit<VocabData, 'progress' | 'tasks'> | VocabData {
  const baseData: Omit<VocabData, 'progress' | 'tasks'> = {
    uid: formData.id || crypto.randomUUID(),
    language: formData.language,
    content: formData.content,
    length: formData.length,
    translations: formData.translations.map(translation => translation.uid),
    priority: formData.priority,
    doNotPractice: formData.doNotPractice,
    notes: formData.notes.map(note => note.uid),
    links: formData.links,
    origins: existingVocab?.origins || ['user-added'],
    relatedVocab: existingVocab?.relatedVocab || [],
    notRelatedVocab: existingVocab?.notRelatedVocab || []
  };

  // For updates, include existing progress and tasks
  if (existingVocab) {
    return {
      ...baseData,
      tasks: existingVocab.tasks,
      progress: existingVocab.progress
    };
  }

  return baseData;
}

const props = defineProps<{
  vocabId?: string;
}>();

const emit = defineEmits<{
  'vocab-saved': [vocabId: string];
}>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const translationRepo = inject<TranslationRepoContract>('translationRepo');
const noteRepo = inject<NoteRepoContract>('noteRepo');
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}
if (!translationRepo) {
  throw new Error('TranslationRepo not provided');
}
if (!noteRepo) {
  throw new Error('NoteRepo not provided');
}

const state = ref<VocabFormState>({
  formData: {
    language: '',
    content: '',
    length: 'not-specified',
    translations: [],
    priority: undefined,
    doNotPractice: undefined,
    notes: [],
    links: []
  },
  loading: false,
  saving: false,
  error: null,
  isEditing: !!props.vocabId
});

const loadedVocabData = ref<VocabData | null>(null);
const loadedNotes = ref<NoteData[]>([]);
const loadedTranslations = ref<TranslationData[]>([]);

const isValid = computed(() => {
  return state.value.formData.language.trim() !== '' && 
         state.value.formData.content.trim() !== '';
});

function serializeFormData(formData: VocabFormData): VocabFormData {
  return JSON.parse(JSON.stringify(formData));
}

async function loadVocab() {
  if (!props.vocabId || !vocabRepo) return;

  state.value.loading = true;
  state.value.error = null;

  try {
    const vocab = await vocabRepo.getVocabByUID(props.vocabId);
    if (vocab) {
      loadedVocabData.value = vocab;
      
      if (vocab.notes && vocab.notes.length > 0 && noteRepo) {
        try {
          const notes = await noteRepo.getNotesByUIDs(vocab.notes);
          loadedNotes.value = notes;
        } catch (error) {
          console.error('Failed to load notes:', error);
          loadedNotes.value = [];
        }
      } else {
        loadedNotes.value = [];
      }

      if (vocab.translations && vocab.translations.length > 0 && translationRepo) {
        try {
          const translations = await translationRepo.getTranslationsByIds(vocab.translations);
          loadedTranslations.value = translations;
        } catch (error) {
          console.error('Failed to load translations:', error);
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
  if (!translationRepo) throw new Error('TranslationRepo not available');
  if (!noteRepo) throw new Error('NoteRepo not available');

  const serializedFormData = serializeFormData(state.value.formData);

  for (const note of serializedFormData.notes) {
    if (note.uid && loadedNotes.value.find(n => n.uid === note.uid)) {
      await noteRepo.updateNote(toRaw(note));
    } else if (!note.uid || !loadedNotes.value.find(n => n.uid === note.uid)) {
      const savedNote = await noteRepo.saveNote(toRaw(note));
      const noteIndex = serializedFormData.notes.findIndex(n => n === note);
      if (noteIndex >= 0) {
        serializedFormData.notes[noteIndex] = savedNote;
      }
    }
  }

  const currentNoteUIDs = serializedFormData.notes.map(n => n.uid);
  const notesToDelete = loadedNotes.value.filter(n => !currentNoteUIDs.includes(n.uid));
  if (notesToDelete.length > 0) {
    await noteRepo.deleteNotes(notesToDelete.map(n => n.uid));
  }

  for (const translation of serializedFormData.translations) {
    if (translation.uid && loadedTranslations.value.find(t => t.uid === translation.uid)) {
      await translationRepo.updateTranslation(toRaw(translation));
    } else if (!translation.uid || !loadedTranslations.value.find(t => t.uid === translation.uid)) {
      const savedTranslation = await translationRepo.saveTranslation(toRaw(translation));
      const translationIndex = serializedFormData.translations.findIndex(t => t === translation);
      if (translationIndex >= 0) {
        serializedFormData.translations[translationIndex] = savedTranslation;
      }
    }
  }

  const currentTranslationUIDs = serializedFormData.translations.map(t => t.uid);
  const translationsToDelete = loadedTranslations.value.filter(t => !currentTranslationUIDs.includes(t.uid));
  if (translationsToDelete.length > 0) {
    await translationRepo.deleteTranslations(translationsToDelete.map(t => t.uid));
  }

  let finalVocabId = props.vocabId;
  
  if (state.value.isEditing && props.vocabId) {
    const existingVocab = await vocabRepo.getVocabByUID(props.vocabId);
    if (!existingVocab) {
      throw new Error('Vocab not found');
    }

    const updatedVocab = {
      ...existingVocab,
      ...formDataToVocabData(serializedFormData, existingVocab)
    };
    
    await vocabRepo.updateVocab(toRaw(updatedVocab));
    finalVocabId = updatedVocab.uid;
  } else {
    const savedVocab = await vocabRepo.saveVocab(toRaw(formDataToVocabData(serializedFormData)));
    finalVocabId = savedVocab.uid;
  }

  if (finalVocabId) {
    emit('vocab-saved', finalVocabId);
  }

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

async function handleFieldChange() {
  if (state.value.isEditing) {
    await save();
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

onMounted(() => {
  if (props.vocabId) {
    loadVocab();
  }
});
</script>