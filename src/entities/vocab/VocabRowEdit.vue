<template>
  <div class="flex flex-wrap gap-4">
    <FormField label="Language" required>
      <template #default="{ inputId }">
        <LanguageDropdown
          :id="inputId"
          v-model="localVocab.language"
          placeholder="Select language"
          size="sm"
          required
          :default-language="defaultLanguage"
        />
      </template>
    </FormField>

    <FormField :label="`In ${currentLanguageDisplay}${contentRequired ? ' *' : ''}`" size="sm" full-width>
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="localVocab.content"
          type="text"
          :placeholder="contentPlaceholder"
          :class="inputClasses"
        />
      </template>
    </FormField>

    <FormField :label="`In your native language${translationsRequired ? ' *' : ''}`" size="sm" full-width>
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="translationsText"
          type="text"
          :placeholder="translationsPlaceholder"
          :class="inputClasses"
        />
      </template>
    </FormField>

    <!-- Actions -->
    <div class="flex gap-2 items-end">
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
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import FormField from '@/shared/ui/FormField.vue';
import type { VocabData } from './vocab/VocabData';
import type { LanguageRepoContract } from '@/entities/languages';
import type { VocabAndTranslationRepoContract } from './VocabAndTranslationRepoContract';
import type { TranslationData } from './translations/TranslationData';
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
const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');

const localVocab = ref({ 
  language: props.vocab.language || (props.isNew ? props.defaultLanguage : '') || '', 
  ...props.vocab 
} as VocabData);
const translationsText = ref('');

// Load translation texts from IDs
async function loadTranslationTexts() {
  if (!vocabRepo || !props.vocab.translations || !Array.isArray(props.vocab.translations)) {
    translationsText.value = '';
    return;
  }
  
  try {
    const translations = await vocabRepo.getTranslationsByIds(props.vocab.translations);
    translationsText.value = translations.map(t => t.content).join(', ');
  } catch (error) {
    console.error('Failed to load translation texts:', error);
    translationsText.value = '';
  }
}

// Watch for changes in vocab prop
watch(() => props.vocab, (newVocab) => {
  localVocab.value = { 
    language: newVocab.language || (props.isNew ? props.defaultLanguage : '') || '', 
    ...newVocab 
  } as VocabData;
  loadTranslationTexts();
}, { deep: true });

// Load initial translation texts
loadTranslationTexts();

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

async function handleSave() {
  if (!isValid.value || !vocabRepo) return;

  const translationTexts = translationsText.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  // Get or create translation objects with UUIDs
  const translationIds: string[] = [];
  
  for (const translationText of translationTexts) {
    try {
      // Check if translation already exists
      const existingTranslation = await vocabRepo.getTranslationByContent(translationText);
      
      if (existingTranslation) {
        // Use existing translation ID
        translationIds.push(existingTranslation.uid);
      } else {
        // Create new translation
        const newTranslation: TranslationData = {
          uid: crypto.randomUUID(),
          content: translationText,
          notes: []
        };
        
        const savedTranslation = await vocabRepo.saveTranslation(newTranslation);
        translationIds.push(savedTranslation.uid);
      }
    } catch (error) {
      console.error(`Failed to process translation "${translationText}":`, error);
      // Continue with other translations
    }
  }

  const vocabData: VocabData = {
    uid: localVocab.value.uid || crypto.randomUUID(),
    content: localVocab.value.content?.trim() || '',
    language: (localVocab.value.language || props.defaultLanguage)!,
    translations: translationIds, // Now using proper translation IDs
    notes: localVocab.value.notes || [],
    links: localVocab.value.links || [],
    tasks: localVocab.value.tasks || [],
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
      uid: crypto.randomUUID(),
      language: props.defaultLanguage || '',
      content: '',
      notes: [],
      translations: [],
      links: [],
      tasks: [],
      progress: {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      }
    } as VocabData;
    translationsText.value = '';
  } else {
    // Cancel editing - emit cancel event
    emit('cancel');
  }
}
</script>