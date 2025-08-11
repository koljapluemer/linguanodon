<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditing ? 'Edit Vocab' : 'Add New Vocab' }}
      </h1>
      <router-link to="/vocab" class="btn btn-outline">
        Back to Vocab List
      </router-link>
    </div>

    <VocabFormController 
      :vocab-id="route.params.id as string" 
      @vocab-saved="handleVocabSaved"
    />

    <!-- Associated Tasks -->
    <div v-if="isEditing" class="mt-8">
      <VocabTaskList 
        :vocab-id="route.params.id as string" 
        @task-selected="openTaskModal"
      />
    </div>

    <TaskModal 
      ref="taskModal"
      :task="currentTask"
      @finished="handleTaskFinished"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useRoute } from 'vue-router';
import VocabFormController from '@/features/vocab-unit-manage/VocabFormController.vue';
import VocabTaskList from '@/widgets/vocab-task-list/VocabTaskListWidget.vue';
import TaskModal from '@/entities/tasks/TaskModal.vue';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { Task } from '@/entities/tasks/Task';

const route = useRoute();
const taskModal = ref<InstanceType<typeof TaskModal>>();
const currentTask = ref<Task>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const taskRepo = inject<TaskRepoContract>('taskRepo');

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

const openTaskModal = async (task: TaskData) => {
  currentTask.value = {
    ...task,
    mayBeConsideredDone: false,
    isDone: false
  };
  taskModal.value?.show();
};

const handleTaskFinished = async () => {
  currentTask.value = undefined;
  // VocabTaskList will handle reloading its own tasks
};

async function handleVocabSaved(vocabId: string) {
  if (!vocabRepo || !taskRepo) {
    console.warn('Repos not available for task update');
    return;
  }
  
  try {
    const taskController = new UpdateVocabTasksController(vocabRepo, taskRepo);
    await taskController.updateTasksForVocab(vocabId);
    // VocabTaskList will handle reloading its own tasks
  } catch (error) {
    console.error('Failed to update vocab tasks:', error);
  }
}
</script>