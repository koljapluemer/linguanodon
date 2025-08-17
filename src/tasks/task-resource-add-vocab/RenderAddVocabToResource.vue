<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import ManageVocabOfResourceWidget from '@/features/resource-manage-its-vocab/ManageVocabOfResourceWidget.vue';
import LinkDisplay from '@/shared/ui/LinkDisplay.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Widget-specific handlers that trigger finished
const handleVocabMayBeConsideredDone = () => {
  // Could emit finished here if needed
};
const handleVocabMayNotBeConsideredDone = () => {
  // Widget state handling
};

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

onMounted(() => {
  loadResource();
});
</script>

<template>
  <!-- Resource Link -->
  <LinkDisplay v-if="resource?.link" :link="resource.link" />

  <p class="text-lg my-2" v-if="resource?.content">{{ resource.content }}</p>

  <!-- Vocab Management Widget -->
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body">
      <h3 class="card-title">Add Vocabulary</h3>
      <ManageVocabOfResourceWidget v-if="resourceUid" :resource-uid="resourceUid" :show-delete-button="true"
        :show-disconnect-button="true" :allow-jumping-to-vocab-page="false" :allow-connecting-existing="true"
        :allow-adding-new="true" @task-may-now-be-considered-done="handleVocabMayBeConsideredDone"
        @task-may-now-not-be-considered-done="handleVocabMayNotBeConsideredDone" />
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-2 mt-4">
    <button class="btn btn-primary" @click="emit('finished')">
      Done
    </button>
    <button class="btn btn-ghost" @click="emit('finished')">
      Skip
    </button>
  </div>
</template>