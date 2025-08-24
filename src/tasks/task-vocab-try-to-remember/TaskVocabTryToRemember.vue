<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
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

const isSentence = computed(() => {
  return vocab.value?.length === 'single-sentence' || vocab.value?.length === 'multiple-sentences';
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

  // Can be considered done immediately
  emit('taskNowMayBeConsideredDone');
};

onMounted(loadVocab);
</script>

<template>
  <div class="card bg-base-100 shadow-sm" v-if="vocab">
    <div class="card-body text-center flex flex-col gap-4">
      <div :class="isSentence ? 'text-3xl' : 'text-5xl'" class="font-bold">{{ vocab.content }}</div>

      <div class="divider"></div>

      <div :class="isSentence ? 'text-3xl' : 'text-5xl'" class="font-bold">
        {{ translations.join(', ') }}
      </div>
    </div>
  </div>

  <div v-else class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>