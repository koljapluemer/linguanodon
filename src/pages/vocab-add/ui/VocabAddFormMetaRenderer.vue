<template>
  <div>
    <!-- Error State -->
    <div v-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <div>
      <!-- Core Data Form -->
      <VocabAddFormCorePropsRenderer
        :form-data="formData"
        @field-change="$emit('field-change')"
      />

      <!-- Advanced Props Form -->
      <VocabAddFormAdvancedPropsRenderer
        :form-data="formData"
        @field-change="$emit('field-change')"
        @add-note="$emit('add-note', $event)"
        @update-note="$emit('update-note', $event)"
        @remove-note="$emit('remove-note', $event)"
        @add-link="$emit('add-link', $event)"
        @remove-link="$emit('remove-link', $event)"
      />

      <!-- Save Button -->
      <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          @click="$emit('save')"
          :disabled="saving || !formData.language.trim() || !formData.content.trim()"
          class="btn btn-primary w-full"
        >
          <span v-if="saving" class="loading loading-spinner loading-sm mr-2"></span>
          {{ saving ? 'Saving...' : 'Save Vocab' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VocabAddFormCorePropsRenderer from './VocabAddFormCorePropsRenderer.vue';
import VocabAddFormAdvancedPropsRenderer from './VocabAddFormAdvancedPropsRenderer.vue';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
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

defineProps<{
  formData: VocabFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
}>();

defineEmits<{
  'field-change': [];
  'add-note': [note: NoteData];
  'update-note': [note: NoteData];
  'remove-note': [uid: string];
  'add-link': [link: Link];
  'remove-link': [index: number];
  'save': [];
}>();
</script>