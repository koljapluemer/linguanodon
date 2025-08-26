<template>
    <!-- Language -->
    <div class="py-4">
      <label class="label">
        <span class="label-text font-medium">Language *</span>
      </label>
      <LanguageDropdown
        v-model="formData.language"
        @update:model-value="$emit('field-change')"
        placeholder="Select target language"
      />
    </div>

    <!-- Content -->
    <div class="py-4">
      <label class="label">
        <span class="label-text font-medium">Content *</span>
      </label>
      <input
        v-model="formData.content"
        @input="$emit('field-change')"
        type="text"
        placeholder="The word or phrase"
        class="input input-bordered input-lg w-full"
        required
      />
    </div>

    <!-- Translations -->
    <div class="py-4">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Translations
      </div>
      
      <div class="space-y-3">
        <!-- Existing translations -->
        <div
          v-for="(translation, index) in formData.translations"
          :key="translation.uid"
          class="flex items-center gap-2"
        >
          <input
            v-model="translation.content"
            @input="$emit('field-change')"
            type="text"
            placeholder="Enter translation..."
            class="input input-bordered input-lg flex-1"
          />
          <button
            type="button"
            @click="removeTranslation(index)"
            class="btn btn-ghost btn-circle text-error flex-shrink-0"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        
        <!-- Always-visible add new translation input -->
        <div class="flex items-center gap-2">
          <input
            v-model="newTranslationContent"
            @blur="addTranslationIfNeeded"
            @keydown.enter="focusNewTranslation"
            type="text"
            placeholder="Add new translation..."
            class="input input-bordered input-lg flex-1"
          />
          <div class="w-10 flex-shrink-0"></div> <!-- Spacer for alignment -->
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { X } from 'lucide-vue-next';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import LanguageDropdown from '@/entities/languages/LanguageDropdown.vue';

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

const props = defineProps<{
  formData: VocabFormData;
}>();

const emit = defineEmits<{
  'field-change': [];
}>();

// Translation management

const newTranslationContent = ref('');

function addTranslationIfNeeded() {
  if (newTranslationContent.value.trim()) {
    const newTranslation: TranslationData = {
      uid: crypto.randomUUID(),
      content: newTranslationContent.value.trim(),
      priority: 1,
      notes: [],
      origins: []
    };
    
    props.formData.translations.push(newTranslation);
    newTranslationContent.value = '';
    emit('field-change');
  }
}

function removeTranslation(index: number) {
  props.formData.translations.splice(index, 1);
  emit('field-change');
}

async function focusNewTranslation() {
  addTranslationIfNeeded();
  await nextTick();
  // Focus stays on the same input after adding
}
</script>