<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import DoTaskFrame from '@/entities/tasks/DoTaskFrame.vue';
import ManageFactsOfResourceWidget from '@/features/manage-facts-of-resource/ManageFactsOfResourceWidget.vue';

interface Props {
  task: Task;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleTaskFinished = () => {
  emit('finished');
};

// Get the resource ID from associated units
const resourceUid = computed(() => {
  const resourceAssociation = props.task.associatedUnits.find(unit => unit.type === 'Resource');
  return resourceAssociation?.uid;
});
</script>

<template>
  <DoTaskFrame :task="task" @task-finished="handleTaskFinished">
    <!-- Fact Cards Management Widget -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h3 class="card-title">Add Fact Cards</h3>
        <ManageFactsOfResourceWidget 
          v-if="resourceUid"
          :resource-uid="resourceUid"
        />
      </div>
    </div>
  </DoTaskFrame>
</template>