<template>
  <div class="space-y-4">
    <h4>{{ $t('translations.title') }}</h4>
    
    <!-- Existing translations -->
    <div v-for="(translation, index) in translations" :key="translation.uid" class="space-y-2">
      <TranslationRowRender
        :translation="translation"
        :allow-edit-on-click="allowEditOnClick"
        :show-delete-button="showDeleteButton"
        @save="saveTranslation(index, $event)"
        @delete="deleteTranslation(index)"
      />
    </div>
    
    <!-- Add new translation row -->
    <TranslationRowEdit
      v-if="allowAddingNew !== false"
      :translation="newTranslation"
      :is-new="true"
      @save="addNewTranslation"
      @cancel="resetNewTranslation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TranslationData } from './TranslationData';
import TranslationRowRender from './TranslationRowRender.vue';
import TranslationRowEdit from './TranslationRowEdit.vue';

const props = defineProps<{
  modelValue: TranslationData[];
  allowEditOnClick?: boolean;
  showDeleteButton?: boolean;
  allowAddingNew?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [TranslationData[]];
}>();

const translations = ref<TranslationData[]>([...props.modelValue]);
const newTranslation = ref<Pick<TranslationData, 'content' | 'notes'>>({
  content: '',
  notes: []
});

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  translations.value = [...newValue];
}, { deep: true });

// Emit changes when translations are modified
watch(translations, (newTranslations) => {
  emit('update:modelValue', [...newTranslations]);
}, { deep: true });

function saveTranslation(index: number, updatedTranslation: TranslationData) {
  translations.value[index] = updatedTranslation;
}

function deleteTranslation(index: number) {
  translations.value.splice(index, 1);
}

function addNewTranslation(translationData: Omit<TranslationData, 'uid' | 'origins'>) {
  const newTranslation: TranslationData = {
    uid: crypto.randomUUID(),
    ...translationData,
    origins: []
  };
  translations.value.push(newTranslation);
  resetNewTranslation();
}

function resetNewTranslation() {
  newTranslation.value = {
    content: '',
    notes: []
  };
}
</script>