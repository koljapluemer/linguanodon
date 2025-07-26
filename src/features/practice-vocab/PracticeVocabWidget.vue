<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { Exercise, ExerciseRating } from '@/shared/ExerciseTypes';
import { ExerciseGenerator } from './gen/ExerciseGenerator';
import MetaExerciseRenderer from './ui/MetaExerciseRenderer.vue';

interface Props {
  vocab: VocabData;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const exercise = ref<Exercise | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  console.log('PracticeVocabWidget mounted with vocab:', props.vocab.id);
  try {
    const translations = await vocabRepo.getTranslationsByIds(props.vocab.translations);
    exercise.value = ExerciseGenerator.generateExercise(props.vocab, translations);
  } catch (error) {
    console.error('Error generating exercise:', error);
  } finally {
    isLoading.value = false;
  }
});

const handleRating = async (rating: ExerciseRating) => {
  console.log('PracticeVocabWidget: Rating received:', rating);
  if (!props.vocab) return;
  
  try {
    console.log('PracticeVocabWidget: Scoring vocab...');
    await vocabRepo.scoreVocab(props.vocab.id, rating);
    console.log('PracticeVocabWidget: Scoring complete, emitting finished');
    emit('finished');
  } catch (error) {
    console.error('Error scoring vocab:', error);
    console.log('PracticeVocabWidget: Error occurred, still emitting finished');
    emit('finished');
  }
};
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="exercise" class="w-full max-w-2xl mx-auto">
      <MetaExerciseRenderer 
        :exercise="exercise"
        @rate="handleRating"
      />
    </div>
    
    <div v-else class="alert alert-warning">
      <span>Unable to generate exercise for this vocab</span>
      <button class="btn btn-sm" @click="emit('finished')">
        Skip
      </button>
    </div>
  </div>
</template>