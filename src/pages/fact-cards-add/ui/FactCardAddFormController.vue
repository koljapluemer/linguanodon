<template>
  <div>
    <FactCardAddFormRenderer
      :form-data="state.formData"
      :loading="state.loading"
      :saving="state.saving"
      :error="state.error"
      @field-change="handleFieldChange"
      @save="save"
      @save-and-add-another="saveAndAddAnother"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { toRaw } from 'vue';
import FactCardAddFormRenderer from './FactCardAddFormRenderer.vue';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';

interface FactCardFormData {
  language: string;
  front: string;
  back: string;
}

interface FactCardFormState {
  formData: FactCardFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

function formDataToFactCardData(formData: FactCardFormData): Omit<FactCardData, 'progress'> {
  return {
    uid: crypto.randomUUID(),
    language: formData.language,
    front: formData.front,
    back: formData.back,
    notes: [],
    links: [],
    priority: 1,
    doNotPractice: false,
    origins: ['user-added'],
  };
}

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
    back: ''
  },
  loading: false,
  saving: false,
  error: null
});

const isValid = computed(() => {
  return state.value.formData.language.trim() !== '' && 
         state.value.formData.front.trim() !== '' &&
         state.value.formData.back.trim() !== '';
});

function serializeFormData(formData: FactCardFormData): FactCardFormData {
  return JSON.parse(JSON.stringify(formData));
}

async function saveInternal(): Promise<string> {
  if (!factCardRepo) throw new Error('FactCardRepo not available');

  const serializedFormData = serializeFormData(state.value.formData);
  const savedFactCard = await factCardRepo.saveFactCard(toRaw(formDataToFactCardData(serializedFormData)));
  return savedFactCard.uid;
}

async function save(): Promise<boolean> {
  if (!isValid.value || !factCardRepo) {
    state.value.error = 'Please fill in required fields';
    return false;
  }

  state.value.saving = true;
  state.value.error = null;

  try {
    const factCardId = await saveInternal();
    emit('fact-card-saved', factCardId);
    return true;
  } catch (error) {
    state.value.error = error instanceof Error ? error.message : 'Failed to save fact card';
    return false;
  } finally {
    state.value.saving = false;
  }
}

async function saveAndAddAnother(): Promise<boolean> {
  if (!isValid.value || !factCardRepo) {
    state.value.error = 'Please fill in required fields';
    return false;
  }

  state.value.saving = true;
  state.value.error = null;

  try {
    await saveInternal();
    
    // Save the current language to preserve it
    const currentLanguage = state.value.formData.language;
    
    // Clear form data but keep the language
    state.value.formData = {
      language: currentLanguage,
      front: '',
      back: ''
    };
    
    return true;
  } catch (error) {
    state.value.error = error instanceof Error ? error.message : 'Failed to save fact card';
    return false;
  } finally {
    state.value.saving = false;
  }
}

function handleFieldChange() {
  // For add form, we don't auto-save on field changes
}
</script>