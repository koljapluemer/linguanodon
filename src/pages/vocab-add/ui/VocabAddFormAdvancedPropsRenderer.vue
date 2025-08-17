<template>
  <div class="mt-8 space-y-8">
    <!-- Priority and Exclude from Practice -->
    <div class="divide-y divide-gray-200 dark:divide-gray-700">
      <!-- Priority -->
      <div class="py-4">
        <label class="label">
          <span class="label-text font-medium">Priority</span>
        </label>
        <input
          v-model.number="formData.priority"
          @input="$emit('field-change')"
          type="number"
          min="1"
          max="5"
          placeholder="1"
          class="input input-bordered w-full"
        />
      </div>

      <!-- Exclude from Practice -->
      <div class="py-4">
        <label class="label cursor-pointer">
          <span class="label-text font-medium">Exclude from practice</span>
          <input
            v-model="formData.doNotPractice"
            @change="$emit('field-change')"
            type="checkbox"
            class="toggle"
          />
        </label>
      </div>
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
          <!-- Link Label -->
          <div class="py-2">
            <label class="label">
              <span class="label-text font-medium">Link label</span>
            </label>
            <input
              v-model="link.label"
              @input="$emit('field-change')"
              type="text"
              placeholder="Link label"
              class="input input-bordered w-full"
            />
          </div>
          
          <!-- Link URL and Remove Button -->
          <div class="flex items-end pt-2 gap-4">
            <div class="flex-1">
              <label class="label">
                <span class="label-text font-medium">URL</span>
              </label>
              <input
                v-model="link.url"
                @input="$emit('field-change')"
                type="url"
                placeholder="https://..."
                class="input input-bordered w-full"
              />
            </div>
            <button
              type="button"
              @click="$emit('remove-link', index)"
              class="btn btn-ghost btn-circle text-error flex-shrink-0"
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
import NoteList from '@/entities/notes/NoteList.vue';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';

interface VocabFormData {
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