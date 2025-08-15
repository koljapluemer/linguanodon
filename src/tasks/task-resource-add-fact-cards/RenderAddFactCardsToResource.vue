<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import ManageFactsOfResourceWidget from '@/features/resource-manage-its-facts/ManageFactsOfResourceWidget.vue';
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
const handleFactsMayBeConsideredDone = () => {
  // Could emit finished here if needed
};
const handleFactsMayNotBeConsideredDone = () => {
  // Widget state handling
};

// Get the resource ID from associated units
const resourceUid = computed(() => {
  const resourceAssociation = props.task.associatedUnits.find(unit => unit.type === 'Resource');
  return resourceAssociation?.uid;
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
  <div class="space-y-6">
    <!-- Task Header -->
    <TaskInfo :task="task" />
    
    <!-- Resource Link -->
    <div v-if="resource?.link" class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h3 class="card-title">Resource</h3>
        <LinkDisplay :link="resource.link" />
      </div>
    </div>
    
    <!-- Fact Cards Management Widget -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h3 class="card-title">Add Fact Cards</h3>
        <ManageFactsOfResourceWidget 
          v-if="resourceUid"
          :resource-uid="resourceUid"
          @task-may-now-be-considered-done="handleFactsMayBeConsideredDone"
          @task-may-now-not-be-considered-done="handleFactsMayNotBeConsideredDone"
        />
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
  </div>
</template>