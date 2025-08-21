<script setup lang="ts">
import { ref, inject, onMounted, watch } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'taskNowMayBeConsideredDone'): void;
  (e: 'taskNowMayNotBeConsideredDone'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const vocab = ref<VocabData | null>(null);
const pronunciation = ref('');

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  
  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  vocab.value = vocabData || null;
};

watch(pronunciation, (newValue) => {
  if (newValue.trim().length > 0) {
    emit('taskNowMayBeConsideredDone');
  } else {
    emit('taskNowMayNotBeConsideredDone');
  }
});

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab" class="space-y-4">
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <h3 class="text-xl font-semibold mb-4">{{ vocab.content }}</h3>
        
        <div class="flex flex-col space-y-1">
          <label class="text-sm font-medium">Pronunciation</label>
          <input 
            v-model="pronunciation"
            type="text" 
            placeholder="Enter pronunciation..."
            class="input input-bordered w-full"
          />
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>