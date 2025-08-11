<template>
  <div>
    <VocabFormRenderer
      :form-data="state.formData"
      :loading="state.loading"
      :saving="state.saving"
      :error="state.error"
      :is-valid="isValid"
      :is-editing="state.isEditing"
      @add-note="addNote"
      @update-note="updateNote"
      @remove-note="removeNote"
      @add-link="addLink"
      @remove-link="removeLink"
    />
    
    <!-- Debug Component -->
    <DebugVocabProgress v-if="loadedVocabData" :vocab-data="loadedVocabData" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useVocabForm } from './useVocabForm';
import VocabFormRenderer from './VocabFormRenderer.vue';
import DebugVocabProgress from '@/shared/ui/DebugVocabProgress.vue';

const props = defineProps<{
  vocabId?: string;
}>();

const emit = defineEmits<{
  'vocab-saved': [vocabId: string];
}>();

const { state, loadedVocabData, isValid, loadVocab, addNote, updateNote, removeNote, addLink, removeLink } = useVocabForm(props.vocabId, emit);

onMounted(() => {
  if (props.vocabId) {
    loadVocab();
  }
});
</script>