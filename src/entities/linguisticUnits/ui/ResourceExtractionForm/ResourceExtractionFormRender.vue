<script setup lang="ts">
import { computed } from 'vue';
import type { ResourceExtractionFormRow } from './ResourceExtractionFormRow';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';

interface Props {
  rows: ResourceExtractionFormRow[];
  languages: LanguageIdentifier[];
  isLoading: boolean;
  error: string | null;
}

interface Emits {
  (e: 'update-row', id: string, updates: Partial<ResourceExtractionFormRow>): void;
  (e: 'save-row', id: string): void;
  (e: 'remove-row', id: string): void;
  (e: 'add-row'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const languageOptions = computed(() => 
  Array.isArray(props.languages) 
    ? props.languages.map(lang => ({
        value: lang.code,
        label: lang.name
      }))
    : []
);

/**
 * Handle type change for a row.
 */
const handleTypeChange = (id: string, type: 'word' | 'sentence') => {
  emit('update-row', id, { type });
};

/**
 * Handle language change for a row.
 */
const handleLanguageChange = (id: string, field: 'originalLanguage' | 'translationLanguage', value: string) => {
  emit('update-row', id, { [field]: value });
};

/**
 * Handle content change for a row.
 */
const handleContentChange = (id: string, field: 'originalContent' | 'translationContent', value: string) => {
  emit('update-row', id, { [field]: value });
};

/**
 * Handle save for a row.
 */
const handleSave = (id: string) => {
  emit('save-row', id);
};

/**
 * Handle remove for a row.
 */
const handleRemove = (id: string) => {
  emit('remove-row', id);
};

/**
 * Handle add new row.
 */
const handleAddRow = () => {
  emit('add-row');
};
</script>

<template>
  <div class="space-y-4">
    <!-- Error Display -->
    <div v-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Form Rows -->
    <div class="space-y-3">
      <div 
        v-for="row in rows" 
        :key="row.id"
        class="card bg-base-100 shadow-sm border border-base-300"
      >
        <div class="card-body p-4">
          <div class="flex flex-col lg:flex-row gap-3 items-start">
            <!-- Type Toggle/Badge -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-xs">Type</span>
              </label>
              <div v-if="row.isNew" class="join">
                <button 
                  class="btn btn-sm join-item"
                  :class="{ 'btn-secondary': row.type === 'word' }"
                  @click="handleTypeChange(row.id, 'word')"
                >
                  Word
                </button>
                <button 
                  class="btn btn-sm join-item"
                  :class="{ 'btn-secondary': row.type === 'sentence' }"
                  @click="handleTypeChange(row.id, 'sentence')"
                >
                  Sentence
                </button>
              </div>
              <div v-else class="badge badge-outline badge-sm">
                {{ row.type === 'word' ? 'Word' : 'Sentence' }}
              </div>
            </div>

            <!-- Original Language -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-xs">Language</span>
              </label>
              <select 
                class="select select-bordered select-sm w-24"
                :value="row.originalLanguage"
                @change="handleLanguageChange(row.id, 'originalLanguage', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">Select</option>
                <option 
                  v-for="option in languageOptions" 
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Original Content -->
            <div class="form-control grow">
              <label class="label">
                <span class="label-text text-xs">Content</span>
              </label>
              <input 
                type="text"
                class="input input-bordered w-full"
                :placeholder="row.type === 'sentence' ? 'Enter sentence...' : 'Enter word...'"
                :value="row.originalContent"
                @input="handleContentChange(row.id, 'originalContent', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <!-- Separator -->
            <div class="flex items-center pt-6">
              <span class="text-base-content/50">|</span>
            </div>

            <!-- Translation Language -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-xs">Translation Lang</span>
              </label>
              <select 
                class="select select-bordered select-sm w-24"
                :value="row.translationLanguage"
                @change="handleLanguageChange(row.id, 'translationLanguage', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">Select</option>
                <option 
                  v-for="option in languageOptions" 
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Translation Content -->
            <div class="form-control grow">
              <label class="label">
                <span class="label-text text-xs">Translation</span>
              </label>
              <input 
                type="text"
                class="input input-bordered w-full"
                :placeholder="row.type === 'sentence' ? 'Enter translation...' : 'Enter translation...'"
                :value="row.translationContent"
                @input="handleContentChange(row.id, 'translationContent', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <!-- Action Buttons -->
            <div class="form-control pt-6">
              <div class="flex gap-2">
                <button 
                  class="btn btn-primary btn-sm"
                  :disabled="isLoading || !row.originalContent.trim() || !row.originalLanguage"
                  @click="handleSave(row.id)"
                >
                  <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
                  Save
                </button>
                <button 
                  v-if="row.isNew"
                  class="btn btn-error btn-sm"
                  @click="handleRemove(row.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Row Button -->
    <div class="flex justify-center">
      <button 
        class="btn btn-outline btn-sm"
        @click="handleAddRow"
      >
        Add Another Row
      </button>
    </div>
  </div>
</template> 