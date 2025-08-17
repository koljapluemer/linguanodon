<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import ManageFactsOfResourceWidget from '@/features/resource-manage-its-facts/ManageFactsOfResourceWidget.vue';
import LinkDisplayAsButton from '@/shared/ui/LinkDisplayAsButton.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';

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

function handleFactCardListChanged() {
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

    <ManageFactsOfResourceWidget v-if="resourceUid" :resource-uid="resourceUid"
      @fact-card-list-changed="handleFactCardListChanged" />
  </div>
</template>