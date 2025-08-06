<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Examples</h1>
      <router-link to="/examples/new" class="btn btn-primary">
        Add New Example
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="examples.length === 0" class="text-center p-12">
      <h3 class="text-lg font-semibold mb-2">No examples yet</h3>
      <p class="text-base-content/70 mb-4">Create your first example to get started.</p>
      <router-link to="/examples/new" class="btn btn-primary">
        Add New Example
      </router-link>
    </div>

    <!-- Examples List -->
    <div v-else class="grid gap-4">
      <div 
        v-for="example in examples" 
        :key="example.uid"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <LanguageDisplay :language-code="example.language" compact />
                <span v-if="!example.isUserCreated" class="badge badge-info">External</span>
              </div>
              
              <div v-if="example.content" class="mb-2">
                <h3 class="font-semibold">Content:</h3>
                <p class="text-base-content/80">{{ example.content }}</p>
              </div>
              
              <div v-if="example.translation" class="mb-2">
                <h3 class="font-semibold">Translation:</h3>
                <p class="text-base-content/80">{{ example.translation }}</p>
              </div>
              
              <div v-if="example.associatedVocab.length > 0" class="mb-2">
                <h3 class="font-semibold">Associated Vocab:</h3>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="vocabId in example.associatedVocab" 
                    :key="vocabId"
                    class="badge badge-sm badge-secondary"
                  >
                    {{ vocabId }}
                  </span>
                </div>
                
                <!-- Vocab Readiness Progress Bar -->
                <div v-if="readinessPercentages[example.uid] > 0" class="mt-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-base-content/70">Readiness:</span>
                    <div class="flex-1">
                      <progress 
                        class="progress progress-primary w-full h-2" 
                        :value="readinessPercentages[example.uid]" 
                        max="100"
                      ></progress>
                    </div>
                    <span class="text-xs text-base-content/70">{{ readinessPercentages[example.uid] }}%</span>
                  </div>
                </div>
              </div>
              
              <div v-if="example.associatedTasks.length > 0" class="mt-2">
                <h3 class="font-semibold text-sm">Tasks:</h3>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="task in example.associatedTasks" 
                    :key="task.taskType"
                    class="badge badge-xs badge-accent"
                  >
                    {{ task.taskType }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <router-link :to="`/examples/${example.uid}`">
                    Edit
                  </router-link>
                </li>
                <li>
                  <button @click="handleDelete(example.uid)" class="text-error">
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ExampleData } from '@/entities/examples/ExampleData';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';

const exampleRepo = inject<ExampleRepoContract>('exampleRepo');
const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
if (!exampleRepo) {
  throw new Error('ExampleRepo not provided');
}
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const examples = ref<ExampleData[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const readinessPercentages = ref<Record<string, number>>({});

async function calculateReadinessPercentage(example: ExampleData): Promise<number> {
  if (!vocabRepo || example.associatedVocab.length === 0) {
    return 0;
  }
  
  let topOfMindCount = 0;
  const totalCount = example.associatedVocab.length;
  
  for (const vocabId of example.associatedVocab) {
    const vocab = await vocabRepo.getVocabByUID(vocabId);
    if (vocab && isCurrentlyTopOfMind(vocab)) {
      topOfMindCount++;
    }
  }
  
  return Math.round((topOfMindCount / totalCount) * 100);
}

async function loadExamples() {
  if (!exampleRepo) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    examples.value = await exampleRepo.getAllExamples();
    
    // Calculate readiness percentages for all examples
    const percentages: Record<string, number> = {};
    for (const example of examples.value) {
      percentages[example.uid] = await calculateReadinessPercentage(example);
    }
    readinessPercentages.value = percentages;
  } catch (err) {
    console.error('Error loading examples:', err);
    error.value = 'Failed to load examples';
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this example?') || !exampleRepo) return;
  
  try {
    await exampleRepo.deleteExample(id);
    await loadExamples(); // Reload the list
  } catch (err) {
    console.error('Error deleting example:', err);
    error.value = 'Failed to delete example';
  }
}

onMounted(() => {
  loadExamples();
});
</script>