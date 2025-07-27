<template>
  <div>
    <!-- Instruction -->
    <div class="text-center mb-6">
      <p class="text-lg text-base-content/70">{{ exercise.prompt }}</p>
    </div>

    <!-- Vocab Content Card -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body text-center">
        <h2 class="text-3xl font-bold">{{ getDisplayContent() }}</h2>
      </div>
    </div>

    <!-- Answer Options (2x2 Grid) -->
    <div class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      <button 
        v-for="(option, index) in exercise.answerOptions" 
        :key="index"
        :class="getButtonClass(index)"
        :disabled="isButtonDisabled(index)"
        @click="selectOption(index)"
        class="btn btn-lg px-6 py-4 min-h-16 text-wrap"
      >
        {{ option.content }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Exercise, ExerciseEmits } from '@/shared/ExerciseTypes';

interface Props {
  exercise: Exercise;
}

const props = defineProps<Props>();
const emit = defineEmits<ExerciseEmits>();

const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);

function getDisplayContent(): string {
  if (props.exercise.isReverse && props.exercise.targetTranslation) {
    return props.exercise.targetTranslation;
  }
  return props.exercise.vocab.content;
}

function selectOption(index: number) {
  if (isAnswered.value) return;

  selectedIndex.value = index;
  const isCorrect = props.exercise.answerOptions![index].isCorrect;

  if (isCorrect) {
    // Correct answer: make green and proceed after 100ms
    isAnswered.value = true;
    setTimeout(() => {
      // Map based on whether first attempt was wrong
      const rating = firstAttemptWrong.value ? 'Hard' : 'Doable';
      emit('rate', rating);
    }, 200);
  } else {
    // Wrong answer: mark first attempt as wrong, disable button
    firstAttemptWrong.value = true;
  }
}

function getButtonClass(index: number): string {
  const isCorrect = props.exercise.answerOptions![index].isCorrect;
  const isSelected = index === selectedIndex.value;

  if (isCorrect && isSelected) {
    // Correct answer was selected
    return 'btn-success';
  }

  if (!isCorrect && isSelected) {
    // Wrong answer was selected
    return 'btn-error';
  }

  if (isAnswered.value && isCorrect) {
    // Show correct answer when exercise is complete
    return 'btn-success';
  }

  if (isAnswered.value && !isCorrect) {
    // Disable wrong answers when exercise is complete
    return 'btn-outline opacity-50';
  }

  // Default state
  return 'btn-outline';
}

function isButtonDisabled(index: number): boolean {
  const isCorrect = props.exercise.answerOptions![index].isCorrect;
  const isSelected = index === selectedIndex.value;

  // Disable if exercise is answered
  if (isAnswered.value) return true;

  // Disable if this wrong option was selected
  if (!isCorrect && isSelected) return true;

  return false;
}
</script>