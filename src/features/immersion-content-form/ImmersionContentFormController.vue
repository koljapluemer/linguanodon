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
    
    <!-- Debug Component -->
    <DebugImmersionContent v-if="loadedContentData" :content-data="loadedContentData" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useImmersionContentForm } from './useImmersionContentForm';
import ImmersionContentFormRenderer from './ImmersionContentFormRenderer.vue';
import DebugImmersionContent from '@/shared/ui/DebugImmersionContent.vue';

const props = defineProps<{
  contentUid?: string;
}>();

const { state, loadedContentData, isValid, loadContent } = useImmersionContentForm(props.contentUid);

onMounted(() => {
  if (props.contentUid) {
    loadContent();
  }
});
</script>