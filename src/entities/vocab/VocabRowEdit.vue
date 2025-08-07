<template>
  <div class="card bg-base-100 border-2 border-dashed border-base-300">
    <div class="card-body p-4">
      <div class="flex items-end gap-4">
        <!-- Language -->
        <div class="form-control w-32">
          <label class="label">
            <span class="label-text">Language *</span>
          </label>
          <LanguageDropdown
            v-model="localVocab.language"
            placeholder="Select language"
            size="sm"
            required
            :default-language="defaultLanguage"
          />
        </div>

        <!-- Content -->
        <div class="form-control flex-1">
          <label class="label">
            <span class="label-text">In {{ currentLanguageDisplay }}{{ contentRequired ? ' *' : '' }}</span>
          </label>
          <input
            v-model="localVocab.content"
            type="text"
            :placeholder="contentPlaceholder"
            class="input input-bordered input-sm"
          />
        </div>

        <!-- Translations -->
        <div class="form-control flex-1">
          <label class="label">
            <span class="label-text">In your native language{{ translationsRequired ? ' *' : '' }}</span>
          </label>
          <input
            v-model="translationsText"
            type="text"
            :placeholder="translationsPlaceholder"
            class="input input-bordered input-sm"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            class="btn btn-sm btn-ghost"
            @click="handleClearOrCancel"
          >
            {{ isNew ? 'Clear' : 'Cancel' }}
          </button>
          <button
            class="btn btn-sm btn-primary"
            :disabled="!isValid"
            @click="handleSave"
          >
            {{ isNew ? 'Add' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import type { VocabData } from './vocab/VocabData';
import type { LanguageRepoContract } from '@/entities/languages';
import { createEmptyCard } from 'ts-fsrs';

const props = defineProps<{
  vocab: Partial<VocabData>;
  isNew?: boolean;
  defaultLanguage?: string;
}>();

const emit = defineEmits<{
  save: [VocabData];
  cancel: [];
}>();

const languageRepo = inject<LanguageRepoContract>('languageRepo');

const localVocab = ref({ 
  language: props.vocab.language || (props.isNew ? props.defaultLanguage : '') || '', 
  ...props.vocab 
} as VocabData);
const translationsText = ref(Array.isArray(props.vocab.translations) ? props.vocab.translations.join(', ') : '');

// Watch for changes in vocab prop
watch(() => props.vocab, (newVocab) => {
  localVocab.value = { 
    language: newVocab.language || (props.isNew ? props.defaultLanguage : '') || '', 
    ...newVocab 
  } as VocabData;
  translationsText.value = Array.isArray(newVocab.translations) ? newVocab.translations.join(', ') : '';
}, { deep: true });

// State machine for field requirements
const fieldState = computed(() => {
  const hasContent = !!localVocab.value.content?.trim();
  const hasTranslations = !!translationsText.value.trim();
  
  if (hasContent && hasTranslations) {
    return 'both-filled';
  } else if (hasContent) {
    return 'content-filled';
  } else if (hasTranslations) {
    return 'translations-filled';
  } else {
    return 'both-empty';
  }
});

// Dynamic required field indicators based on state
const contentRequired = computed(() => {
  return fieldState.value === 'both-empty';
});

const translationsRequired = computed(() => {
  return fieldState.value === 'both-empty';
});

// Dynamic placeholders based on state
const contentPlaceholder = computed(() => {
  switch (fieldState.value) {
    case 'both-empty':
      return 'Vocabulary word or phrase (required if no translation)';
    case 'translations-filled':
      return 'Vocabulary word or phrase (optional)';
    default:
      return 'Vocabulary word or phrase';
  }
});

const translationsPlaceholder = computed(() => {
  switch (fieldState.value) {
    case 'both-empty':
      return 'Comma-separated translations (required if no content)';
    case 'content-filled':
      return 'Comma-separated translations (optional)';
    default:
      return 'Comma-separated translations';
  }
});

// Current language display text
const currentLanguageDisplay = ref('target language');

// Watch for language changes and update display name
watch(() => localVocab.value.language || props.defaultLanguage, async (languageCode) => {
  if (!languageCode) {
    currentLanguageDisplay.value = 'target language';
    return;
  }
  
  if (languageRepo) {
    try {
      const language = await languageRepo.getByCode(languageCode);
      currentLanguageDisplay.value = language?.name || languageCode;
    } catch (error) {
      console.error('Failed to get language name:', error);
      currentLanguageDisplay.value = languageCode;
    }
  } else {
    currentLanguageDisplay.value = languageCode;
  }
}, { immediate: true });

const isValid = computed(() => {
  const hasLanguage = localVocab.value.language || props.defaultLanguage;
  
  // Valid if we have language (including default) AND we're not in the 'both-empty' state
  return hasLanguage && fieldState.value !== 'both-empty';
});

function handleSave() {
  if (!isValid.value) return;

  const translations = translationsText.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  const vocabData: VocabData = {
    uid: localVocab.value.uid || crypto.randomUUID(),
    content: localVocab.value.content?.trim() || '',
    language: (localVocab.value.language || props.defaultLanguage)!,
    translations,
    notes: localVocab.value.notes || [],
    links: localVocab.value.links || [],
    associatedTasks: localVocab.value.associatedTasks || [],
    progress: localVocab.value.progress || {
      ...createEmptyCard(),
      streak: 0,
      level: -1
    }
  };

  emit('save', vocabData);
}

function handleClearOrCancel() {
  if (props.isNew) {
    // Clear/reset form to default values
    localVocab.value = {
      language: props.defaultLanguage || '',
      content: '',
      translations: []
    } as VocabData;
    translationsText.value = '';
  } else {
    // Cancel editing - emit cancel event
    emit('cancel');
  }
}
</script>