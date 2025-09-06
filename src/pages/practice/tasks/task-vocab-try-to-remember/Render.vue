<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createEmptyCard } from 'ts-fsrs';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import VocabWithTranslationsDisplay from '@/features/display-vocab-with-translations/VocabWithTranslationsDisplay.vue';

interface Props {
  task: Task;
  repositories: RepositoriesContextStrict;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const vocabRepo = props.repositories.vocabRepo;
const vocab = ref<VocabData | null>(null);

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  if (vocabData) {
    vocab.value = vocabData;
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
    <VocabWithTranslationsDisplay
      :vocab-uid="task.associatedVocab?.[0] || ''"
      :repositories="repositories"
    />
    
    <div class="flex justify-center gap-4 mt-6">
      <button @click="handleSkip" class="btn btn-ghost">Do not learn this</button>
      <button @click="handleDone" class="btn btn-primary">Done</button>
    </div>
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>