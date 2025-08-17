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

    <!-- Vocab Form -->
    <div class="max-w-2xl mx-auto">
      <VocabEditFormController
        :vocab-id="route.params.id as string"
        @vocab-saved="handleVocabSaved"
      />
    </div>

    <!-- Associated Tasks -->
    <div v-if="isEditing && currentVocabTaskIds.length > 0" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Associated Tasks</h2>
      <TaskModalTriggerList :task-ids="currentVocabTaskIds" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import VocabEditFormController from './ui/VocabEditFormController.vue';
import TaskModalTriggerList from '@/widgets/do-task/TaskModalTriggerList.vue';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';

const route = useRoute();
const currentVocabTaskIds = ref<string[]>([]);

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const taskRepo = inject<TaskRepoContract>('taskRepo');
const noteRepo = inject<NoteRepoContract>('noteRepo');

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

// Watch for vocab ID changes and load task IDs
watch(() => route.params.id, async (vocabId) => {
  if (vocabId && vocabId !== 'new' && vocabRepo) {
    try {
      const vocab = await vocabRepo.getVocabByUID(vocabId as string);
      currentVocabTaskIds.value = vocab?.tasks || [];
    } catch (error) {
      console.error('Failed to load vocab tasks:', error);
      currentVocabTaskIds.value = [];
    }
  } else {
    currentVocabTaskIds.value = [];
  }
}, { immediate: true });

async function handleVocabSaved(vocabId: string) {
  if (!vocabRepo || !taskRepo) {
    console.warn('Repos not available for task update');
    return;
  }
  
  try {
    if (!noteRepo) {
      console.error('NoteRepo not available');
      return;
    }
    const taskController = new UpdateVocabTasksController(vocabRepo, taskRepo, noteRepo);
    await taskController.updateTasksForVocab(vocabId);
    
    // Reload task IDs for this vocab
    const vocab = await vocabRepo.getVocabByUID(vocabId);
    currentVocabTaskIds.value = vocab?.tasks || [];
  } catch (error) {
    console.error('Failed to update vocab tasks:', error);
  }
}
</script>