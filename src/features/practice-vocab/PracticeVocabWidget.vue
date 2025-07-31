<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { Ban } from 'lucide-vue-next';
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
  (e: 'doNotPractice'): void;
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
  try {
    const translations = await vocabRepo.getTranslationsByIds(props.vocab.translations);
    exercise.value = await ExerciseGenerator.generateExercise(props.vocab, translations, vocabRepo);
  } catch (error) {
    console.error('Error generating exercise:', error);
  } finally {
    isLoading.value = false;
  }
});

const handleRating = async (rating: ExerciseRating) => {
  if (!props.vocab) return;

  try {
    await vocabRepo.scoreVocab(props.vocab.uid, rating);
    emit('finished');
  } catch (error) {
    console.error('Error scoring vocab:', error);
    emit('finished');
  }
};

const handleDoNotPractice = async () => {
  if (!props.vocab) return;

  try {
    // Get fresh vocab data to avoid conflicts
    const freshVocab = await vocabRepo.getVocabByUID(props.vocab.uid);
    if (!freshVocab) {
      console.warn('Vocab not found for doNotPractice update');
      emit('finished');
      return;
    }

    // Set doNotPractice to true
    freshVocab.doNotPractice = true;
    await vocabRepo.updateVocab(freshVocab);

    emit('finished');
  } catch (error) {
    console.error('Error setting doNotPractice:', error);
    emit('finished');
  }
};
</script>

<template>
  <div>

    <div v-if="isLoading" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="exercise" class="w-full max-w-2xl mx-auto gap-4 flex flex-col">
      <div class="flex justify-center self-end">
        <button class="btn btn-sm" @click="handleDoNotPractice">
          <Ban class="w-4 h-4 mr-1" />
          Do Not Practice This Word
        </button>
      </div>

      <MetaExerciseRenderer :exercise="exercise" @rate="handleRating" />


    </div>

    <div v-else class="alert alert-warning">
      <span>Unable to generate exercise for this vocab</span>
      <button class="btn btn-sm" @click="emit('finished')">
        Skip
      </button>
    </div>
  </div>
</template>