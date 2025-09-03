<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Rating } from 'ts-fsrs';
import SpacedRepetitionRating from '@/pages/practice/tasks/ui/SpacedRepetitionRating.vue';

interface Props {
  task: Task;
  repositories: RepositoriesContext;
  modeContext?: {
    setWrongVocabDueAgainImmediately?: boolean;
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const vocabRepo = props.repositories.vocabRepo!;
const translationRepo = props.repositories.translationRepo!;
const vocab = ref<VocabData | null>(null);
const translations = ref<string[]>([]);
const isRevealed = ref(false);

const isNativeToTarget = computed(() => props.task.taskType === 'vocab-reveal-native-to-target');

const isSentence = computed(() => {
  return vocab.value?.length === 'sentence';
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

const handleRating = async (rating: Rating) => {
  if (!vocab.value) return;
  
  try {
    // Score vocab and update last review
    // In illegal immersion mode, use immediateDue for low ratings
    const immediateDue = props.modeContext?.setWrongVocabDueAgainImmediately || false;
    await vocabRepo.scoreVocab(vocab.value.uid, rating, immediateDue);
    await vocabRepo.updateLastReview(vocab.value.uid);
    
    emit('finished');
  } catch (error) {
    console.error('Error scoring vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <div class="text-center mb-8">
      <div :class="isSentence ? 'text-3xl' : 'text-6xl'" class="font-bold mb-6">{{ frontContent }}</div>
      
      <div v-if="isRevealed">
        <div class="divider mb-6">Answer</div>
        <div :class="isSentence ? 'text-xl' : 'text-3xl'" class="text-base-content/70 mb-6">{{ solution }}</div>
        
        <SpacedRepetitionRating @rating="handleRating" />
      </div>
      
      <div v-else>
        <button @click="isRevealed = true" class="btn btn-primary">Reveal</button>
      </div>
    </div>
  </div>
  
  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>