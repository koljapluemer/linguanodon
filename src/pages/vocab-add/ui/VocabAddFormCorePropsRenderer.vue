<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-700">
    <!-- Language -->
    <div class="py-4">
      <label class="label">
        <span class="label-text font-medium">Language *</span>
      </label>
      <select
        v-model="formData.language"
        @change="$emit('field-change')"
        class="select select-bordered w-full"
        required
      >
        <option value="">Select target language</option>
        <option
          v-for="option in languageOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
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
      <TranslationGroupForm
        v-model="formData.translations"
        :allow-edit-on-click="false"
        :show-delete-button="true"
        :allow-adding-new="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import TranslationGroupForm from '@/entities/vocab/translations/TranslationGroupForm.vue';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';
import { formatLanguageDisplay } from '@/entities/languages';

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
}>();

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const availableLanguages = ref<LanguageData[]>([]);

onMounted(async () => {
  try {
    availableLanguages.value = await languageRepo.getActiveTargetLanguages();
  } catch (error) {
    console.error('Failed to load languages:', error);
  }
});

const languageOptions = computed(() => {
  return availableLanguages.value.map(language => ({
    value: language.code,
    label: language.emoji ? `${language.emoji} ${formatLanguageDisplay(language, false)}` : formatLanguageDisplay(language, false)
  }));
});
</script>