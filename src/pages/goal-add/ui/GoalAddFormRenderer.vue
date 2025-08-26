<template>
  <div class="space-y-6">
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Language *</span>
      </label>
      <select
        v-model="formData.language"
        class="select select-bordered w-full"
        required
        @change="$emit('field-change')"
      >
        <option value="" disabled>Select target language</option>
        <option
          v-for="language in availableLanguages"
          :key="language.code"
          :value="language.code"
        >
          {{ language.emoji ? `${language.emoji} ` : '' }}{{ formatLanguageDisplay(language, false) }}
        </option>
      </select>
    </div>

    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Goal Title *</span>
      </label>
      <input
        v-model="formData.title"
        type="text"
        placeholder="What do you want to achieve?"
        class="input input-bordered input-lg w-full"
        required
        @input="$emit('field-change')"
      />
      <div class="label">
        <span class="label-text-alt text-gray-500">
          Be specific about what you want to learn or accomplish
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';
import { formatLanguageDisplay } from '@/entities/languages';

interface GoalFormData {
  language: string;
  title: string;
}

defineProps<{
  formData: GoalFormData;
  isSaving: boolean;
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
</script>