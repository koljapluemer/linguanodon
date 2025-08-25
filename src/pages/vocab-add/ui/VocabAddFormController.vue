<template>
  <div>
    <VocabAddFormMetaRenderer
      :form-data="state.formData"
      :loading="state.loading"
      :saving="state.saving"
      :error="state.error"
      @field-change="handleFieldChange"
      @add-note="addNote"
      @update-note="updateNote"
      @remove-note="removeNote"
      @add-link="addLink"
      @remove-link="removeLink"
      @save="save"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { toRaw } from 'vue';
import VocabAddFormMetaRenderer from './VocabAddFormMetaRenderer.vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Link } from '@/shared/links/Link';
import type { Length } from '@/shared/Length';

interface VocabFormData {
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
}

function formDataToVocabData(formData: VocabFormData): Omit<VocabData, 'progress' | 'tasks'> {
  return {
    uid: crypto.randomUUID(),
    language: formData.language,
    content: formData.content,
    length: formData.length,
    translations: formData.translations.map(translation => translation.uid),
    priority: formData.priority,
    doNotPractice: formData.doNotPractice,
    notes: formData.notes.map(note => note.uid),
    links: formData.links,
    origins: ['user-added'],
    relatedVocab: [],
    notRelatedVocab: []
  };
}

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
  error: null
});

const isValid = computed(() => {
  return state.value.formData.language.trim() !== '' && 
         state.value.formData.content.trim() !== '';
});

function serializeFormData(formData: VocabFormData): VocabFormData {
  return JSON.parse(JSON.stringify(formData));
}

async function saveInternal(): Promise<void> {
  if (!vocabRepo) throw new Error('VocabRepo not available');
  if (!translationRepo) throw new Error('TranslationRepo not available');
  if (!noteRepo) throw new Error('NoteRepo not available');

  const serializedFormData = serializeFormData(state.value.formData);

  for (const note of serializedFormData.notes) {
    const savedNote = await noteRepo.saveNote(toRaw(note));
    const noteIndex = serializedFormData.notes.findIndex(n => n === note);
    if (noteIndex >= 0) {
      serializedFormData.notes[noteIndex] = savedNote;
    }
  }

  for (const translation of serializedFormData.translations) {
    const savedTranslation = await translationRepo.saveTranslation(toRaw(translation));
    const translationIndex = serializedFormData.translations.findIndex(t => t === translation);
    if (translationIndex >= 0) {
      serializedFormData.translations[translationIndex] = savedTranslation;
    }
  }

  const savedVocab = await vocabRepo.saveVocab(toRaw(formDataToVocabData(serializedFormData)));
  emit('vocab-saved', savedVocab.uid);
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

function handleFieldChange() {
  // For add form, we don't auto-save on field changes
}

function addNote(note: NoteData) {
  const newNote: NoteData = {
    ...note,
    uid: crypto.randomUUID()
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

function addLink(link: Link) {
  state.value.formData.links.push(link);
}

function removeLink(index: number) {
  state.value.formData.links.splice(index, 1);
}
</script>