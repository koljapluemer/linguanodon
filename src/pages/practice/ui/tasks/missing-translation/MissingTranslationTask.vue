<template>
  <div class="space-y-6">
    <!-- Task Instruction -->
    <WidgetInstruction>
      {{ exercise.prompt }}
    </WidgetInstruction>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Original Linguistic Unit -->
        <div class="mb-6 text-center">
          <WidgetBigText :is-extra-big="false">
            {{ exercise.linguisticUnit.content }}
          </WidgetBigText>
          <div class="badge badge-outline mt-2">
            {{ exercise.linguisticUnit.language }}
          </div>
        </div>

        <!-- Translation Form -->
        <div class="space-y-4">
          <!-- Language Selection -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Translation Language</span>
            </label>
            <select
              v-model="selectedLanguage"
              class="select select-bordered w-full"
              :disabled="loading"
            >
              <option value="" disabled>Select a language...</option>
              <option 
                v-for="lang in availableLanguages" 
                :key="lang.code"
                :value="lang.code"
              >
                {{ lang.name }}
              </option>
            </select>
          </div>

          <!-- Translation Content -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Translation</span>
            </label>
            <WidgetImportantTextArea 
              v-model="translationContent" 
              placeholder="Enter your translation here..."
              :disabled="loading"
            />
          </div>

          <!-- Save Button -->
          <div class="flex justify-end">
            <button 
              @click="handleSaveTranslation"
              class="btn btn-primary"
              :disabled="!canSave || loading"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              Save Translation
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="alert alert-error mt-4">
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { MissingTranslationExercise } from '../../../model/Exercise';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';
import { wordService, sentenceService } from '@/entities/linguisticUnits';
import { languageService } from '@/entities/languages';
import WidgetInstruction from '@/shared/ElementInstruction.vue';
import WidgetBigText from '@/shared/ElementBigText.vue';
import WidgetImportantTextArea from '@/shared/ElementImportantTextArea.vue';

interface Props {
  exercise: MissingTranslationExercise;
}

interface Emits {
  (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedLanguage = ref('');
const translationContent = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const availableLanguages = ref<LanguageIdentifier[]>([]);

/**
 * Check if the form can be saved
 */
const canSave = computed(() => {
  return selectedLanguage.value.trim() !== '' && 
         translationContent.value.trim() !== '';
});

/**
 * Load available languages for translation
 */
async function loadAvailableLanguages() {
  try {
    const allLanguages = await languageService.getAll();
    // Filter to only show languages that are missing translations
    availableLanguages.value = allLanguages.filter(lang => 
      props.exercise.missingLanguages.includes(lang.code)
    );
  } catch {
    error.value = 'Failed to load languages';
  }
}

/**
 * Save the translation
 */
async function handleSaveTranslation() {
  if (!canSave.value) return;

  loading.value = true;
  error.value = null;

  try {
    // Create the translation linguistic unit
    const translationUnit = {
      type: props.exercise.linguisticUnit.type,
      language: selectedLanguage.value,
      content: translationContent.value.trim(),
      translations: [],
      notes: [],
      links: [],
      credits: []
    };

    // Save the translation unit
    if (props.exercise.linguisticUnit.type === 'word') {
      await wordService.add(translationUnit);
    } else {
      await sentenceService.add(translationUnit);
    }

    // Update the original unit to include the new translation
    const originalUnit = {
      ...props.exercise.linguisticUnit,
      translations: [
        ...(props.exercise.linguisticUnit.translations || []),
        {
          type: props.exercise.linguisticUnit.type,
          language: selectedLanguage.value,
          content: translationContent.value.trim()
        }
      ]
    };

    if (props.exercise.linguisticUnit.type === 'word') {
      await wordService.update(originalUnit);
    } else {
      await sentenceService.update(originalUnit);
    }

    // Complete the exercise
    emit('rate', 'Easy');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save translation';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadAvailableLanguages();
});
</script> 