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
      @update-link="updateLink"
      @remove-link="removeLink"
      @add-translation="addTranslation"
      @update-translation="updateTranslation"
      @remove-translation="removeTranslation"
      @update-related-vocab="updateRelatedVocab"
      @update-picturable="updatePicturable"
      @update-images="updateImages"
      @update-sounds="updateSounds"
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
import type { VocabData, VocabImage, VocabSound } from '@/entities/vocab/VocabData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Link } from '@/shared/links/Link';

interface VocabFormData {
  id?: string;
  language: string;
  content: string;
  consideredCharacter?: boolean;
  consideredSentence?: boolean;
  consideredWord?: boolean;
  translations: TranslationData[];
  priority?: number;
  doNotPractice?: boolean;
  notes: NoteData[];
  links: Link[];
  relatedVocab?: string[];
  isPicturable?: boolean;
  images?: VocabImage[];
  sounds?: VocabSound[];
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
    consideredCharacter: vocab.consideredCharacter ?? false,
    consideredSentence: vocab.consideredSentence ?? false,
    consideredWord: vocab.consideredWord ?? true,
    translations: translations,
    priority: vocab.priority,
    doNotPractice: vocab.doNotPractice,
    notes: notes,
    links: vocab.links ? [...vocab.links] : [],
    relatedVocab: vocab.relatedVocab ? [...vocab.relatedVocab] : [],
    isPicturable: vocab.isPicturable,
    images: vocab.images ? [...vocab.images] : [],
    sounds: vocab.sounds ? [...vocab.sounds] : []
  };
}

function formDataToVocabData(formData: VocabFormData, existingVocab?: VocabData): Omit<VocabData, 'progress' | 'tasks'> | VocabData {
  const baseData: Omit<VocabData, 'progress' | 'tasks'> = {
    uid: formData.id || crypto.randomUUID(),
    language: formData.language,
    content: formData.content,
    consideredCharacter: formData.consideredCharacter,
    consideredSentence: formData.consideredSentence,
    consideredWord: formData.consideredWord,
    translations: formData.translations.map(translation => translation.uid),
    priority: formData.priority,
    doNotPractice: formData.doNotPractice,
    notes: formData.notes.map(note => note.uid),
    links: formData.links,
    origins: existingVocab?.origins || ['user-added'],
    relatedVocab: formData.relatedVocab || [],
    notRelatedVocab: existingVocab?.notRelatedVocab || [],
    isPicturable: formData.isPicturable,
    images: formData.images || [],
    sounds: formData.sounds || []
  };

  // For updates, include existing progress
  if (existingVocab) {
    return {
      ...baseData,
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
    consideredCharacter: false,
    consideredSentence: false,
    consideredWord: true,
    translations: [],
    priority: undefined,
    doNotPractice: undefined,
    notes: [],
    links: [],
    relatedVocab: []
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
  // Clean serialization - strips ALL Vue reactivity (and Blobs, but we handle those separately)
  return JSON.parse(JSON.stringify(toRaw(formData)));
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

  // Extract Blobs before serialization (with toRaw to remove Vue reactivity)
  const originalImages = state.value.formData.images ? state.value.formData.images.map(img => toRaw(img)) : [];
  const originalSounds = state.value.formData.sounds ? state.value.formData.sounds.map(sound => toRaw(sound)) : [];
  
  const serializedFormData = serializeFormData(state.value.formData);
  
  // Restore Blobs to serialized data
  serializedFormData.images = originalImages;
  serializedFormData.sounds = originalSounds;
  
  console.log('🔧 EDIT: serializedFormData after Blob restoration:', {
    images: serializedFormData.images?.map(img => ({ uid: img.uid, hasBlob: !!img.blob, blobType: img.blob?.type, blobSize: img.blob?.size })),
    sounds: serializedFormData.sounds?.map(sound => ({ uid: sound.uid, hasBlob: !!sound.blob, blobType: sound.blob?.type, blobSize: sound.blob?.size }))
  });

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

    const formDataConverted = formDataToVocabData(serializedFormData, existingVocab);
    
    const updatedVocab = {
      ...existingVocab,
      ...formDataConverted
    };
    
    console.log('🔧 EDIT: Final updatedVocab being passed to updateVocab:', {
      uid: updatedVocab.uid,
      images: updatedVocab.images?.map(img => ({ uid: img.uid, hasBlob: !!img.blob, blobType: img.blob?.type, blobSize: img.blob?.size })),
      sounds: updatedVocab.sounds?.map(sound => ({ uid: sound.uid, hasBlob: !!sound.blob, blobType: sound.blob?.type, blobSize: sound.blob?.size }))
    });
    
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
    handleFieldChange();
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

function updateLink(index: number, link: Link) {
  state.value.formData.links[index] = link;
}

async function removeLink(index: number) {
  state.value.formData.links.splice(index, 1);
  await handleFieldChange();
}

function addTranslation(translation: TranslationData) {
  state.value.formData.translations.push(translation);
  handleFieldChange();
}

function updateTranslation(updatedTranslation: TranslationData) {
  const index = state.value.formData.translations.findIndex(t => t.uid === updatedTranslation.uid);
  if (index >= 0) {
    state.value.formData.translations[index] = updatedTranslation;
    handleFieldChange();
  }
}

async function removeTranslation(uid: string) {
  const index = state.value.formData.translations.findIndex(t => t.uid === uid);
  if (index >= 0) {
    state.value.formData.translations.splice(index, 1);
    await handleFieldChange();
  }
}

async function updateRelatedVocab(vocabIds: string[]) {
  state.value.formData.relatedVocab = vocabIds;
  await handleFieldChange();
}

async function updatePicturable(isPicturable: boolean) {
  state.value.formData.isPicturable = isPicturable;
  await handleFieldChange();
}

async function updateImages(images: VocabImage[]) {
  state.value.formData.images = [...images];
  await handleFieldChange();
}

async function updateSounds(sounds: VocabSound[]) {
  state.value.formData.sounds = sounds;
  await handleFieldChange();
}

onMounted(() => {
  if (props.vocabId) {
    loadVocab();
  }
});
</script>