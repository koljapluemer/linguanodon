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
      <VocabTaskList :vocab-id="route.params.id as string" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import VocabFormController from '@/features/vocab-unit-manage/VocabFormController.vue';
import VocabTaskList from '@/widgets/vocab-task-list/VocabTaskListWidget.vue';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';

const route = useRoute();
const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const taskRepo = inject<TaskRepoContract>('taskRepo');

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

async function handleVocabSaved(vocabId: string) {
  if (!vocabRepo || !taskRepo) {
    console.warn('Repos not available for task update');
    return;
  }
  
  try {
    const taskController = new UpdateVocabTasksController(vocabRepo, taskRepo);
    await taskController.updateTasksForVocab(vocabId);
  } catch (error) {
    console.error('Failed to update vocab tasks:', error);
  }
}
</script>