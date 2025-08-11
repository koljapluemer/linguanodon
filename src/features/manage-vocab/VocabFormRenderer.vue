<template>
  <div class="max-w-2xl mx-auto">
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
    <div v-else class="space-y-6">
      <!-- Core Content - Big Type -->
      <FormFieldset legend="Core Content">
        <FormField label="Content" size="lg" required>
          <template #default="{ inputId, inputClasses }">
            <input
              :id="inputId"
              v-model="formData.content"
              type="text"
              placeholder="The word or phrase"
              :class="inputClasses"
              required
            />
          </template>
        </FormField>

        <!-- Translations -->
        <div class="mt-6">
          <TranslationGroupForm
            v-model="formData.translations"
            :allow-edit-on-click="true"
            :show-delete-button="true"
            :allow-adding-new="true"
          />
        </div>
      </FormFieldset>

      <!-- Basic Information -->
      <FormFieldset legend="Basic Information">
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

        <FormField label="Priority">
          <template #default="{ inputId, inputClasses }">
            <input
              :id="inputId"
              v-model.number="formData.priority"
              type="number"
              min="1"
              max="5"
              placeholder="1"
              :class="inputClasses"
              style="width: 6rem"
            />
          </template>
        </FormField>

        <FormField label="">
          <template #default="{ inputId }">
            <label :for="inputId" class="cursor-pointer label justify-start gap-2">
              <input
                :id="inputId"
                v-model="formData.doNotPractice"
                type="checkbox"
                class="checkbox"
              />
              <span class="label-text">Exclude from practice</span>
            </label>
          </template>
        </FormField>
      </FormFieldset>

      <!-- Notes -->
      <FormFieldset legend="Notes">
        <NoteList
          :notes="formData.notes"
          :show-before-exercise-option="true"
          @add="$emit('addNote')"
          @update="$emit('updateNote', $event)"
          @delete="$emit('removeNote', $event)"
        />
      </FormFieldset>

      <!-- Links -->
      <FormFieldset legend="Links">
        <div class="flex justify-end mb-4">
          <button
            type="button"
            @click="$emit('addLink')"
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
            class="border rounded-lg p-4"
          >
            <div class="flex justify-between items-start gap-4">
              <div class="flex-1 space-y-4">
                <FormField label="Link label" size="sm">
                  <template #default="{ inputId, inputClasses }">
                    <input
                      :id="inputId"
                      v-model="link.label"
                      type="text"
                      placeholder="Link label"
                      :class="inputClasses"
                    />
                  </template>
                </FormField>
                
                <FormField label="URL" size="sm">
                  <template #default="{ inputId, inputClasses }">
                    <input
                      :id="inputId"
                      v-model="link.url"
                      type="url"
                      placeholder="https://..."
                      :class="inputClasses"
                    />
                  </template>
                </FormField>
              </div>
              
              <button
                type="button"
                @click="$emit('removeLink', index)"
                class="btn btn-sm btn-ghost btn-circle text-error"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
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
import { Plus, X, Check } from 'lucide-vue-next';
import NoteList from '@/entities/notes/NoteList.vue';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import TranslationGroupForm from '@/entities/vocab/translations/TranslationGroupForm.vue';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';
import type { VocabFormData } from './types';
import type { NoteData } from '@/entities/notes/NoteData';

defineProps<{
  formData: VocabFormData;
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
  addLink: [];
  removeLink: [index: number];
}>();
</script>