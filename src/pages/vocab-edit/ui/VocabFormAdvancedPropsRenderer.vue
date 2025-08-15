<template>
  <div class="mt-8 space-y-8">
    <!-- Priority and Exclude from Practice -->
    <div class="divide-y divide-gray-200 dark:divide-gray-700">
      <InlineInput
        v-model="formData.priority"
        label="Priority"
        type="number"
        :min="1"
        :max="5"
        placeholder="1"
        @update:modelValue="$emit('field-change')"
      />

      <InlineToggle
        v-model="formData.doNotPractice"
        label="Exclude from practice"
        @update:modelValue="$emit('field-change')"
      />
    </div>

    <!-- Notes -->
    <div>
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Notes
      </div>
      <NoteList
        :notes="formData.notes"
        :show-before-exercise-option="true"
        @add="$emit('add-note')"
        @update="$emit('update-note', $event)"
        @delete="$emit('remove-note', $event)"
      />
    </div>

    <!-- Links -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Links
        </div>
        <button
          type="button"
          @click="$emit('add-link')"
          class="btn btn-sm btn-outline"
        >
          <Plus class="w-4 h-4 mr-1" />
          Add Link
        </button>
      </div>
      
      <div v-if="formData.links.length === 0" class="text-gray-500 text-center py-4">
        No links yet. Click "Add Link" to add external resources.
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="(link, index) in formData.links"
          :key="index"
          class="divide-y divide-gray-200 dark:divide-gray-700"
        >
          <InlineInput
            v-model="link.label"
            label="Link label"
            placeholder="Link label"
            @update:modelValue="$emit('field-change')"
          />
          
          <div class="flex items-center justify-between pt-2">
            <div class="flex-1">
              <InlineInput
                v-model="link.url"
                label="URL"
                type="url"
                placeholder="https://..."
                @update:modelValue="$emit('field-change')"
              />
            </div>
            <button
              type="button"
              @click="$emit('remove-link', index)"
              class="ml-4 btn btn-sm btn-ghost btn-circle text-error flex-shrink-0"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, X } from 'lucide-vue-next';
import InlineInput from '@/shared/ui/InlineInput.vue';
import InlineToggle from '@/shared/ui/InlineToggle.vue';
import NoteList from '@/entities/notes/NoteList.vue';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';

interface VocabFormData {
  id?: string;
  language: string;
  content: string;
  translations: TranslationData[];
  priority?: number;
  doNotPractice?: boolean;
  notes: NoteData[];
  links: Array<{
    label: string;
    url: string;
  }>;
}
import type { NoteData } from '@/entities/notes/NoteData';

defineProps<{
  formData: VocabFormData;
}>();

defineEmits<{
  'field-change': [];
  'add-note': [];
  'update-note': [note: NoteData];
  'remove-note': [uid: string];
  'add-link': [];
  'remove-link': [index: number];
}>();
</script>