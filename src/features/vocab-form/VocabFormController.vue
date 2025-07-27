<template>
  <VocabFormRenderer
    :form-data="state.formData"
    :loading="state.loading"
    :saving="state.saving"
    :error="state.error"
    :is-valid="isValid"
    :is-editing="state.isEditing"
    @add-note="addNote"
    @remove-note="removeNote"
    @add-link="addLink"
    @remove-link="removeLink"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useVocabForm } from './useVocabForm';
import VocabFormRenderer from './VocabFormRenderer.vue';

const props = defineProps<{
  vocabId?: string;
}>();

const { state, isValid, loadVocab, addNote, removeNote, addLink, removeLink } = useVocabForm(props.vocabId);

onMounted(() => {
  if (props.vocabId) {
    loadVocab();
  }
});
</script>