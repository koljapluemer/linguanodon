<template>
  <div>
    <FactCardEditFormRenderer
      :form-data="state.formData"
      :loading="state.loading"
      :saving="state.saving"
      :error="state.error"
      :is-editing="state.isEditing"
      :loaded-fact-card-data="loadedFactCardData"
      @field-change="handleFieldChange"
      @add-note="addNote"
      @update-note="updateNote"
      @remove-note="removeNote"
      @add-link="addLink"
      @update-link="updateLink"
      @remove-link="removeLink"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import { toRaw } from 'vue';
import FactCardEditFormRenderer from './FactCardEditFormRenderer.vue';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { Link } from '@/shared/links/Link';

interface FactCardFormData {
  id?: string;
  language: string;
  front: string;
  back: string;
  notes: NoteData[];
  links: Link[];
  priority?: number;
  doNotPractice?: boolean;
}

interface FactCardFormState {
  formData: FactCardFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
}

function factCardDataToFormData(factCard: FactCardData, notes: NoteData[] = []): FactCardFormData {
  return {
    id: factCard.uid,
    language: factCard.language,
    front: factCard.front || '',
    back: factCard.back || '',
    notes: notes,
    links: factCard.links ? [...factCard.links] : [],
    priority: factCard.priority,
    doNotPractice: factCard.doNotPractice
  };
}

function formDataToFactCardData(formData: FactCardFormData, existingFactCard?: FactCardData): Omit<FactCardData, 'progress'> | FactCardData {
  const baseData: Omit<FactCardData, 'progress'> = {
    uid: formData.id || crypto.randomUUID(),
    language: formData.language,
    front: formData.front,
    back: formData.back,
    notes: formData.notes.map(note => note.uid),
    links: formData.links,
    priority: formData.priority ?? 1,
    doNotPractice: formData.doNotPractice,
    origins: existingFactCard?.origins ?? ['user-added']
  };

  if (existingFactCard) {
    return {
      ...baseData,
      progress: existingFactCard.progress
    };
  }

  return baseData;
}

const props = defineProps<{
  factCardId?: string;
}>();

const emit = defineEmits<{
  'fact-card-saved': [factCardId: string];
}>();

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
    links: [],
    priority: undefined,
    doNotPractice: undefined
  },
  loading: false,
  saving: false,
  error: null,
  isEditing: !!props.factCardId
});

const loadedFactCardData = ref<FactCardData | null>(null);
const loadedNotes = ref<NoteData[]>([]);

const isValid = computed(() => {
  return state.value.formData.language.trim() !== '' && 
         state.value.formData.front.trim() !== '' &&
         state.value.formData.back.trim() !== '';
});

function serializeFormData(formData: FactCardFormData): FactCardFormData {
  return JSON.parse(JSON.stringify(formData));
}

async function loadFactCard() {
  if (!props.factCardId || !factCardRepo) return;

  state.value.loading = true;
  state.value.error = null;

  try {
    const factCard = await factCardRepo.getFactCardByUID(props.factCardId);
    if (factCard) {
      loadedFactCardData.value = factCard;
      
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

  let finalFactCardId = props.factCardId;
  
  if (state.value.isEditing && props.factCardId) {
    const existingFactCard = await factCardRepo.getFactCardByUID(props.factCardId);
    if (!existingFactCard) {
      throw new Error('Fact card not found');
    }

    const updatedFactCard = {
      ...existingFactCard,
      ...formDataToFactCardData(serializedFormData, existingFactCard)
    };
    
    await factCardRepo.updateFactCard(toRaw(updatedFactCard));
    finalFactCardId = updatedFactCard.uid;
  } else {
    const savedFactCard = await factCardRepo.saveFactCard(toRaw(formDataToFactCardData(serializedFormData)));
    finalFactCardId = savedFactCard.uid;
  }

  if (finalFactCardId) {
    emit('fact-card-saved', finalFactCardId);
  }

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

onMounted(() => {
  if (props.factCardId) {
    loadFactCard();
  }
});
</script>