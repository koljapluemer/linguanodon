<script setup lang="ts">
import { inject, onMounted } from 'vue';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import { useCachedQueue } from './useCachedQueue';
import MetaTaskRenderer from './MetaTaskRenderer.vue';
import { useTimeTracking } from '@/shared/useTimeTracking';

// Inject repositories
const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const exampleRepo = inject<ExampleRepoContract>('exampleRepo');
const goalRepo = inject<GoalRepoContract>('goalRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');

if (!vocabRepo || !exampleRepo || !goalRepo || !resourceRepo) {
  throw new Error('Repositories not available');
}

const {
  state,
  initializeQueue,
  completeCurrentTask,
  stateMachineDebug
} = useCachedQueue(vocabRepo, exampleRepo, goalRepo, resourceRepo);

// Initialize time tracking for this page
useTimeTracking();

onMounted(async () => {
  await initializeQueue();
});


/**
 *
 */
const handleTaskFinished = async () => {
  await completeCurrentTask();
};
</script>

<template>
  <div class="min-h-screen bg-base-200 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="state.status === 'initializing' || state.status === 'loading'" class="flex justify-center items-center min-h-96">
        <div class="text-center">
          <span class="loading loading-spinner loading-lg"></span>
          <p class="mt-4 text-lg">
            {{ state.status === 'loading' && state.message ? state.message : 'Loading your learning queue...' }}
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="state.status === 'error'" class="alert alert-error">
        <span>{{ state.message }}</span>
        <button class="btn btn-sm" @click="stateMachineDebug.retry">
          Retry
        </button>
      </div>

      <!-- No Content Available -->
      <div v-else-if="state.status === 'empty'" class="hero min-h-96">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">All Done!</h1>
            <p class="py-6">{{ state.message }}</p>
            <button class="btn btn-primary" @click="initializeQueue">
              Check Again
            </button>
          </div>
        </div>
      </div>


      <!-- Task -->
      <div v-else-if="state.status === 'task'">
        <MetaTaskRenderer 
          :task="state.task"
          @finished="handleTaskFinished"
        />
      </div>

      <!-- Fallback (should never happen with state machine) -->
      <div v-else class="alert alert-warning">
        <span>Unknown queue state. Please refresh.</span>
        <button class="btn btn-sm" @click="initializeQueue">
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>