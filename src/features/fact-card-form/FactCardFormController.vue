<template>
  <div>
    <FactCardFormRenderer
      :form-data="state.formData"
      :loading="state.loading"
      :saving="state.saving"
      :error="state.error"
      :is-valid="isValid"
      :is-editing="state.isEditing"
      @add-note="addNote"
      @update-note="updateNote"
      @remove-note="removeNote"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFactCardForm } from './useFactCardForm';
import FactCardFormRenderer from './FactCardFormRenderer.vue';

const props = defineProps<{
  factCardUID?: string;
}>();

const { state, isValid, loadFactCard, addNote, updateNote, removeNote } = useFactCardForm(props.factCardUID);

onMounted(() => {
  if (props.factCardUID) {
    loadFactCard();
  }
});
</script>