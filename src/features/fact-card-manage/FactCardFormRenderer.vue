<template>
  <div class="max-w-2xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading fact card...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <div v-else class="space-y-6">
      <!-- Basic Information -->
      <FormFieldset legend="Basic Information">
        <!-- Language -->
        <FormField label="Language" required>
          <template #default="{ inputId }">
            <LanguageDropdown
              :id="inputId"
              v-model="formData.language"
              placeholder="Select target language"
              required
            />
          </template>
        </FormField>

        <!-- Priority -->
        <FormField label="Priority">
          <template #default="{ inputId, inputClassString }">
            <input
              :id="inputId"
              v-model.number="formData.priority"
              type="number"
              min="1"
              placeholder="1"
              :class="inputClassString"
              style="width: 6rem;"
            />
          </template>
        </FormField>

        <!-- Exclude from practice -->
        <div class="form-control">
          <label class="cursor-pointer label justify-start gap-2">
            <input
              v-model="formData.doNotPractice"
              type="checkbox"
              class="checkbox"
            />
            <span class="label-text">Exclude from practice</span>
          </label>
        </div>
      </FormFieldset>

      <!-- Card Content -->
      <FormFieldset legend="Card Content">
        <!-- Front -->
        <FormField label="Front" required>
          <template #default="{ inputId }">
            <textarea
              :id="inputId"
              v-model="formData.front"
              placeholder="Enter the front of the card (e.g., question, prompt, or concept)"
              class="textarea textarea-bordered h-32 w-full"
              required
            ></textarea>
            <div class="text-xs text-base-content/60 mt-1">Supports basic Markdown</div>
          </template>
        </FormField>

        <!-- Back -->
        <FormField label="Back" required>
          <template #default="{ inputId }">
            <textarea
              :id="inputId"
              v-model="formData.back"
              placeholder="Enter the back of the card (e.g., answer, explanation, or details)"
              class="textarea textarea-bordered h-32 w-full"
              required
            ></textarea>
            <div class="text-xs text-base-content/60 mt-1">Supports basic Markdown</div>
          </template>
        </FormField>
      </FormFieldset>

      <!-- Notes -->
      <FormFieldset legend="Notes">
        <NoteList
          :notes="formData.notes"
          :show-before-exercise-option="false"
          @add="$emit('addNote')"
          @update="$emit('updateNote', $event)"
          @delete="$emit('removeNote', $event)"
        />
      </FormFieldset>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span v-if="saving" class="text-sm text-base-content/70 flex items-center gap-1">
            <span class="loading loading-spinner loading-sm"></span>
            Auto-saving...
          </span>
          <span v-else-if="isEditing" class="text-sm text-success flex items-center gap-1">
            <Check class="w-4 h-4" />
            Changes saved automatically
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import NoteList from '@/entities/notes/NoteList.vue';
import type { FactCardFormData } from './types';
import type { NoteData } from '@/entities/notes/NoteData';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';

defineProps<{
  formData: FactCardFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isValid: boolean;
  isEditing: boolean;
}>();

defineEmits<{
  addNote: [];
  updateNote: [note: NoteData];
  removeNote: [uid: string];
}>();
</script>