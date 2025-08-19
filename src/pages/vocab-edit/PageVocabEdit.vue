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

    <div v-if="isEditing && currentVocabTaskIds.length > 0" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Associated Tasks</h2>
      <TaskModalTriggerList :task-ids="currentVocabTaskIds" />
    </div>

    <!-- Vocab Mastery Progress -->
    <div v-if="isEditing && currentVocab" class="mt-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="text-xl font-semibold mb-4">Mastery Progress</h2>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Current Mastery</span>
              <span class="text-sm font-bold">{{ vocabMastery }}%</span>
            </div>
            <progress 
              class="progress progress-primary w-full" 
              :value="vocabMastery" 
              max="100"
            ></progress>
          </div>
        </div>
      </div>
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
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import { calculateVocabMastery } from '@/entities/vocab/vocabMastery';

const route = useRoute();
const currentVocabTaskIds = ref<string[]>([]);
const currentVocab = ref<VocabData | null>(null);

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const taskRepo = inject<TaskRepoContract>('taskRepo');
const noteRepo = inject<NoteRepoContract>('noteRepo');

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

const vocabMastery = computed(() => {
  if (!currentVocab.value) return 0;
  return calculateVocabMastery(currentVocab.value);
});

// Watch for vocab ID changes and load task IDs and vocab data
watch(() => route.params.id, async (vocabId) => {
  if (vocabId && vocabId !== 'new' && vocabRepo) {
    try {
      const vocab = await vocabRepo.getVocabByUID(vocabId as string);
      currentVocabTaskIds.value = vocab?.tasks || [];
      currentVocab.value = vocab || null;
    } catch (error) {
      console.error('Failed to load vocab data:', error);
      currentVocabTaskIds.value = [];
      currentVocab.value = null;
    }
  } else {
    currentVocabTaskIds.value = [];
    currentVocab.value = null;
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
    
    // Reload task IDs and vocab data for this vocab
    const vocab = await vocabRepo.getVocabByUID(vocabId);
    currentVocabTaskIds.value = vocab?.tasks || [];
    currentVocab.value = vocab || null;
  } catch (error) {
    console.error('Failed to update vocab tasks:', error);
  }
}
</script>