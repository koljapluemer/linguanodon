<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'taskNowMayBeConsideredDone'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo')!;
const vocab = ref<VocabData | null>(null);
const translations = ref<string[]>([]);

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  
  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  if (vocabData) {
    vocab.value = vocabData;
    const translationData = await vocabRepo.getTranslationsByIds(vocabData.translations);
    translations.value = translationData.map(t => t.content);
  }
  
  // Can be considered done immediately
  emit('taskNowMayBeConsideredDone');
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab" class="space-y-4">
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body text-center">
        <div class="text-3xl font-bold mb-4">{{ vocab.content }}</div>
        
        <div class="divider">Translation</div>
        
        <div class="text-xl text-gray-600">
          {{ translations.join(', ') }}
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>