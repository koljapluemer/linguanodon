<template>
  <div>
    <ImmersionContentFormRenderer
      :form-data="state.formData"
      :loading="state.loading"
      :saving="state.saving"
      :error="state.error"
      :is-valid="isValid"
      :is-editing="state.isEditing"
    />
    
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useImmersionContentForm } from './useImmersionContentForm';
import ImmersionContentFormRenderer from './ImmersionContentFormRenderer.vue';

const props = defineProps<{
  contentUid?: string;
}>();

const { state, isValid, loadContent } = useImmersionContentForm(props.contentUid);

onMounted(() => {
  if (props.contentUid) {
    loadContent();
  }
});
</script>