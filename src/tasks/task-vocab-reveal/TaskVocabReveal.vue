<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'taskNowMayBeConsideredDone'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;
const vocab = ref<VocabData | null>(null);
const translations = ref<string[]>([]);
const isRevealed = ref(false);

const isNativeToTarget = computed(() => props.task.taskType === 'vocab-reveal-native-to-target');

const isSentence = computed(() => {
  return vocab.value?.length === 'single-sentence' || vocab.value?.length === 'multiple-sentences';
});

const frontContent = computed(() => {
  if (!vocab.value || translations.value.length === 0) return '';
  
  if (isNativeToTarget.value) {
    return translations.value[0]; // Show translation
  } else {
    return vocab.value.content; // Show vocab
  }
});

const solution = computed(() => {
  if (!vocab.value || translations.value.length === 0) return '';
  
  if (isNativeToTarget.value) {
    return vocab.value.content; // Show vocab as solution
  } else {
    return translations.value.join(', '); // Show translations as solution
  }
});

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  
  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  if (vocabData) {
    vocab.value = vocabData;
    const translationData = await translationRepo.getTranslationsByIds(vocabData.translations);
    translations.value = translationData.map(t => t.content);
  }
};

watch(isRevealed, (revealed) => {
  if (revealed) {
    emit('taskNowMayBeConsideredDone');
  }
});

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab" class="space-y-4">
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body text-center">
        <div :class="isSentence ? 'text-3xl' : 'text-6xl'" class="font-bold mb-4">{{ frontContent }}</div>
        
        <div v-if="isRevealed">
          <div class="divider">Answer</div>
          <div :class="isSentence ? 'text-xl' : 'text-3xl'" class="text-gray-600">{{ solution }}</div>
        </div>
        
        <div v-else class="mt-6">
          <button 
            class="btn btn-primary"
            @click="isRevealed = true"
          >
            Reveal
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>