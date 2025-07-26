<script setup lang="ts">
import { onMounted } from 'vue';
import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';
import type { WordRepository } from '@/entities/linguisticUnits/words/WordRepository';
import type { SentenceRepository } from '@/entities/linguisticUnits/sentences/SentenceRepository';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';
import { useResourceExtractionForm } from './useResourceExtractionForm';
import ResourceExtractionFormRender from './ResourceExtractionFormRender.vue';

interface Props {
  extractedUnits: LinguisticUnitIdentification[];
  wordRepository: WordRepository;
  sentenceRepository: SentenceRepository;
  languages: LanguageIdentifier[];
  onUnitSaved?: (unit: LinguisticUnitIdentification) => void;
}

const props = defineProps<Props>();

const {
  rows,
  isLoading,
  error,
  initializeForm,
  addRow,
  removeRow,
  updateRow,
  saveRow
} = useResourceExtractionForm(
  props.wordRepository,
  props.sentenceRepository,
  props.languages,
  props.onUnitSaved
);

onMounted(() => {
  initializeForm(props.extractedUnits);
});

/**
 * Handle row updates from the render component.
 */
const handleUpdateRow = (id: string, updates: Partial<{ type: 'word' | 'sentence'; originalLanguage: string; originalContent: string; translationLanguage: string; translationContent: string }>) => {
  updateRow(id, updates);
};

/**
 * Handle row save from the render component.
 */
const handleSaveRow = async (id: string) => {
  await saveRow(id);
};

/**
 * Handle row removal from the render component.
 */
const handleRemoveRow = (id: string) => {
  removeRow(id);
};

/**
 * Handle adding a new row from the render component.
 */
const handleAddRow = () => {
  addRow();
};
</script>

<template>
  <ResourceExtractionFormRender
    :rows="rows"
    :languages="languages"
    :is-loading="isLoading"
    :error="error"
    @update-row="handleUpdateRow"
    @save-row="handleSaveRow"
    @remove-row="handleRemoveRow"
    @add-row="handleAddRow"
  />
</template> 