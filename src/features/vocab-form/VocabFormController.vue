<template>
  <VocabFormRenderer
    :form-data="state.formData"
    :loading="state.loading"
    :saving="state.saving"
    :error="state.error"
    :is-valid="isValid"
    :is-editing="state.isEditing"
    @save="handleSave"
    @add-note="addNote"
    @remove-note="removeNote"
    @add-link="addLink"
    @remove-link="removeLink"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVocabForm } from './useVocabForm';
import VocabFormRenderer from './VocabFormRenderer.vue';

const props = defineProps<{
  vocabId?: string;
}>();

const router = useRouter();
const { state, isValid, loadVocab, save, addNote, removeNote, addLink, removeLink } = useVocabForm(props.vocabId);

/**
 *
 */
async function handleSave() {
  const success = await save();
  if (success) {
    router.push('/vocab');
  }
}

onMounted(() => {
  if (props.vocabId) {
    loadVocab();
  }
});
</script>