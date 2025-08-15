<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-700">
    <InlineLanguageSelect
      v-model="formData.language"
      label="Language"
      placeholder="Select target language"
      required
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
import InlineInput from '@/shared/ui/InlineInput.vue';
import InlineLanguageSelect from '@/shared/ui/InlineLanguageSelect.vue';
import TranslationGroupForm from '@/entities/vocab/translations/TranslationGroupForm.vue';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';

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
</script>