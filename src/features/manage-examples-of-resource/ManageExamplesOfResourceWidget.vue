<template>
  <div class="space-y-6">
    <ExampleGroupForm
      :example-ids="exampleIds"
      :default-language="defaultLanguage"
      @update:example-ids="handleExamplesUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import ExampleGroupForm from '@/entities/examples/ExampleGroupForm.vue';

const props = defineProps<{
  resourceUid: string;
}>();

const emit = defineEmits<{
  taskMayNowBeConsideredDone: [];
  taskMayNowNotBeConsideredDone: [];
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const exampleIds = ref<string[]>([]);
const defaultLanguage = ref<string>('');
const initialExampleIds = ref<string[]>([]);
const hasExamplesChanged = ref(false);

async function loadResource() {
  if (!resourceRepo) return;
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    exampleIds.value = [...resource.examples];
    initialExampleIds.value = [...resource.examples];
    defaultLanguage.value = resource.language;
  }
}

async function handleExamplesUpdate(newExampleIds: string[]) {
  if (!resourceRepo) return;
  
  // Check if examples list has changed from initial state
  const examplesListChanged = JSON.stringify(newExampleIds.sort()) !== JSON.stringify(initialExampleIds.value.sort());
  
  if (examplesListChanged && !hasExamplesChanged.value) {
    hasExamplesChanged.value = true;
    emit('taskMayNowBeConsideredDone');
  }
  
  // Auto-save - update the resource with new example IDs
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    const updatedResource: ResourceData = {
      ...resource,
      examples: newExampleIds
    };
    await resourceRepo.updateResource(updatedResource);
    exampleIds.value = newExampleIds;
  }
}

onMounted(() => {
  loadResource();
});
</script>