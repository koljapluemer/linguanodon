<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-700">
    <InlineSelect
      v-model="formData.language"
      label="Language"
      placeholder="Select target language"
      required
      :options="languageOptions"
      @update:modelValue="$emit('field-change')"
    />

    <InlineInput
      v-model="formData.content"
      label="Content"
      placeholder="The word or phrase"
      required
      size="large"
      @update:modelValue="$emit('field-change')"
    />

    <div class="py-4">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Translations
      </div>
      <TranslationGroupForm
        v-model="formData.translations"
        :allow-edit-on-click="true"
        :show-delete-button="true"
        :allow-adding-new="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import InlineInput from '@/shared/ui/InlineInput.vue';
import InlineSelect from '@/shared/ui/InlineSelect.vue';
import TranslationGroupForm from '@/entities/translations/TranslationGroupForm.vue';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';
import { formatLanguageDisplay } from '@/entities/languages';

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