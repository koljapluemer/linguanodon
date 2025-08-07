<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import DoTaskFrame from '@/entities/tasks/DoTaskFrame.vue';
import ManageVocabOfResourceWidget from '@/features/manage-vocab-of-resource/ManageVocabOfResourceWidget.vue';

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
    <!-- Vocab Management Widget -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h3 class="card-title">Add Vocabulary</h3>
        <ManageVocabOfResourceWidget 
          v-if="resourceUid"
          :resource-uid="resourceUid"
          :show-delete-button="true"
          :show-disconnect-button="true"
          :allow-jumping-to-vocab-page="false"
          :allow-connecting-existing="true"
          :allow-adding-new="true"
        />
      </div>
    </div>
  </DoTaskFrame>
</template>