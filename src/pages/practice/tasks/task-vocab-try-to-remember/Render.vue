<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { createEmptyCard } from 'ts-fsrs';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';

interface Props {
  task: Task;
  repositories: RepositoriesContext;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const vocabRepo = props.repositories.vocabRepo!;
const translationRepo = props.repositories.translationRepo!;
const vocab = ref<VocabData | null>(null);
const translations = ref<string[]>([]);

const isSentence = computed(() => {
  return vocab.value?.length === 'sentence';
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

const handleDone = async () => {
  if (!vocab.value) return;
  
  try {
    // Initialize learning card for unseen vocab
    const updatedVocab = {
      ...vocab.value,
      progress: {
        ...vocab.value.progress,
        level: 0,
        card: createEmptyCard()
      }
    };
    await vocabRepo.updateVocab(JSON.parse(JSON.stringify(updatedVocab)));
    
    emit('finished');
  } catch (error) {
    console.error('Error initializing vocab:', error);
    emit('finished');
  }
};

const handleSkip = async () => {
  if (!vocab.value) return;
  
  try {
    // Mark vocab as do not practice
    const updatedVocab = {
      ...vocab.value,
      doNotPractice: true
    };
    await vocabRepo.updateVocab(JSON.parse(JSON.stringify(updatedVocab)));
    
    emit('finished');
  } catch (error) {
    console.error('Error updating vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <div class="text-center mb-8">
      <div :class="isSentence ? 'text-3xl' : 'text-5xl'" class="font-bold mb-6">{{ vocab.content }}</div>
      <div class="divider mb-6"></div>
      <div :class="isSentence ? 'text-3xl' : 'text-5xl'" class="font-bold text-light">
        {{ translations.join(', ') }}
      </div>
    </div>
    
    <div class="flex justify-center gap-4">
      <button @click="handleSkip" class="btn btn-ghost">Do not learn this</button>
      <button @click="handleDone" class="btn btn-primary">Done</button>
    </div>
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>