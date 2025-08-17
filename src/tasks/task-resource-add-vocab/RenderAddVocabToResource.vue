<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import ManageVocabOfResourceWidget from '@/features/resource-manage-its-vocab/ManageVocabOfResourceWidget.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import LinkDisplayAsButton from '@/shared/ui/LinkDisplayAsButton.vue';

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'taskNowMayBeConsideredDone'): void;
  (e: 'taskNowMayNotBeConsideredDone'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Get the resource ID from associated resources
const resourceUid = computed(() => {
  return props.task.associatedResources?.[0];
});

// Resource data and loading
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const resource = ref<ResourceData | null>(null);

const loadResource = async () => {
  if (!resourceUid.value || !resourceRepo) return;

  try {
    const resourceData = await resourceRepo.getResourceById(resourceUid.value);
    resource.value = resourceData || null;
  } catch (error) {
    console.error('Failed to load resource:', error);
  }
};

function handleVocabListChanged() {
  emit('taskNowMayBeConsideredDone');
}

onMounted(() => {
  loadResource();
});
</script>

<template>
  <div class="card-body">
    <LinkDisplayAsButton v-if="resource?.link" :link="resource.link" size="large" />
    <p class="text-lg my-2" v-if="resource?.content">{{ resource.content }}</p>

    <ManageVocabOfResourceWidget v-if="resourceUid" :resource-uid="resourceUid" :show-delete-button="true"
      :show-disconnect-button="true" :allow-jumping-to-vocab-page="false" :allow-connecting-existing="true"
      :allow-adding-new="true" @vocab-list-changed="handleVocabListChanged" />
  </div>
</template>