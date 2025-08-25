<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading vocab...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <div v-else>
      <!-- Toggle for Basic/All Data -->
      <div class="flex items-center justify-end mb-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <span class="text-sm">Show all data</span>
          <input
            v-model="showAllData"
            type="checkbox"
            class="toggle toggle-sm"
          />
        </label>
      </div>

      <!-- Core Data Form -->
      <VocabFormCoreRenderer
        :form-data="formData"
        @field-change="$emit('field-change')"
        @add-translation="(translation) => { console.log('[VocabFormMetaRenderer] Received add-translation, re-emitting:', translation); $emit('add-translation', translation); }"
        @update-translation="(translation) => { console.log('[VocabFormMetaRenderer] Received update-translation, re-emitting:', translation); $emit('update-translation', translation); }"
        @remove-translation="(uid) => { console.log('[VocabFormMetaRenderer] Received remove-translation, re-emitting:', uid); $emit('remove-translation', uid); }"
      />

      <!-- Advanced Props Form (only when showing all data) -->
      <VocabFormAdvancedPropsRenderer
        v-if="showAllData"
        :form-data="formData"
        @field-change="$emit('field-change')"
        @add-note="$emit('add-note', $event)"
        @update-note="$emit('update-note', $event)"
        @remove-note="$emit('remove-note', $event)"
        @add-link="$emit('add-link', $event)"
        @update-link="(index, link) => $emit('update-link', index, link)"
        @remove-link="$emit('remove-link', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import VocabFormCoreRenderer from './VocabFormCoreRenderer.vue';
import VocabFormAdvancedPropsRenderer from './VocabFormAdvancedPropsRenderer.vue';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { Link } from '@/shared/links/Link';
import { Length } from '@/shared/Length';

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
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { NoteData } from '@/entities/notes/NoteData';

defineProps<{
  formData: VocabFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
  loadedVocabData: VocabData | null;
}>();

defineEmits<{
  'field-change': [];
  'add-note': [note: NoteData];
  'update-note': [note: NoteData];
  'remove-note': [uid: string];
  'add-link': [link: Link];
  'update-link': [index: number, link: Link];
  'remove-link': [index: number];
  'add-translation': [translation: TranslationData];
  'update-translation': [translation: TranslationData];
  'remove-translation': [uid: string];
}>();

// Persistent toggle state in localStorage
const showAllData = ref<boolean>(
  localStorage.getItem('vocab-edit-show-all-data') === 'true'
);

// Watch for changes and persist to localStorage
watch(showAllData, (newValue) => {
  localStorage.setItem('vocab-edit-show-all-data', String(newValue));
});
</script>