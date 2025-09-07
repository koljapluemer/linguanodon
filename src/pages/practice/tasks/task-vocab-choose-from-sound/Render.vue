<template>
  <!-- Loading State -->
  <div v-if="loading" class="text-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <!-- Exercise Content -->
  <div v-else-if="vocab1 && vocab2 && playableSound" class="text-center">
    <!-- Skip button -->
    <div class="flex justify-end mb-4">
      <button @click="skipTask" class="btn btn-outline btn-sm">{{ $t('practice.tasks.skipExercise') }}</button>
    </div>

    <SoundPlayer ref="soundPlayerRef" :sound="playableSound" :auto-play="true" />

    <div class="flex flex-row gap-4 mx-auto justify-center my-6">
      <div v-for="(vocab, index) in shuffledVocabs" :key="vocab.uid" 
           :class="getOptionContainerClass(index)"
           class="flex gap-2 flex-col transition-all duration-300 ease-out">
        <button :class="getButtonClass(index)" class="btn btn-lg transition-all duration-300" @click="selectOption(index)"
          :disabled="isButtonDisabled(index)">
          {{ $t('practice.tasks.iHear') }} {{ vocab.content }}
        </button>
        <VocabWithTranslationsDisplay :vocab-uid="vocab.uid" :repositories="repositories"
          :showAllNotesImmediately="true" />
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else class="text-center">
    <div class="alert alert-error max-w-md mx-auto">
      <span>{{ $t('practice.tasks.failedToLoad') }}</span>
    </div>
    <div class="mt-4">
      <button @click="skipTask" class="btn btn-outline">{{ $t('practice.tasks.skipExercise') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData, VocabSound } from '@/entities/vocab/VocabData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import SoundPlayer from '@/shared/ui/SoundPlayer.vue';
import VocabWithTranslationsDisplay from '@/features/display-vocab-with-translations/VocabWithTranslationsDisplay.vue';
import { Rating } from 'ts-fsrs';
import { shuffleArray, randomFromArray } from '@/shared/utils/arrayUtils';
import { useButtonWithKeyboardArrowControl } from '@/shared/composables/useButtonWithKeyboardArrowControl';
import { useReplaySoundWithSpacebar } from '@/shared/composables/useReplaySoundWithSpacebar';

interface Props {
  task: Task;
  repositories: RepositoriesContextStrict;
  modeContext?: {
    setWrongVocabDueAgainImmediately?: boolean;
  };
}

const emit = defineEmits<{
  finished: [];
}>();

const props = defineProps<Props>();

const vocabRepo = props.repositories.vocabRepo;

// Exercise state
const selectedAnswerIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);
const vocab1 = ref<VocabData | null>(null); // The vocab to be identified
const vocab2 = ref<VocabData | null>(null); // The related vocab (distractor)
const shuffledVocabs = ref<VocabData[]>([]);
const correctIndex = ref<number>(0);
const playableSound = ref<VocabSound | null>(null);
const loading = ref(true);
const soundPlayerRef = ref<{ playSound: () => void } | null>(null);

// Keyboard arrow control
const buttonCount = computed(() => shuffledVocabs.value.length);
useButtonWithKeyboardArrowControl({
  buttonCount,
  onSelect: selectOption,
  disabled: computed(() => isAnswered.value || loading.value)
});

// Sound replay with spacebar
const replaySound = () => {
  if (soundPlayerRef.value) {
    soundPlayerRef.value.playSound();
  }
};

useReplaySoundWithSpacebar({
  onReplay: replaySound,
  disabled: computed(() => loading.value)
});

// Get the vocab ID from associated vocab
const vocabUid = computed(() => {
  return props.task.associatedVocab?.[0];
});

async function loadVocabData() {
  if (!vocabUid.value) {
    console.error('Choose from Sound: No vocab UID provided');
    loading.value = false;
    return;
  }

  try {
    const vocabData = await vocabRepo.getVocabByUID(vocabUid.value);
    if (!vocabData) {
      console.error('Choose from Sound: Vocab not found for UID:', vocabUid.value);
      loading.value = false;
      return;
    }

    // Assumes the following:
    // - consideredCharacter = true
    // - has content
    // - has playable sounds (not disableForPractice)
    // - has relatedVocab with at least one valid character with sound and content

    vocab1.value = vocabData;

    // Pick random sound from available sounds (guaranteed to exist)
    const playableSounds = vocabData.sounds!.filter(s => !s.disableForPractice);
    playableSound.value = randomFromArray(playableSounds);

    // Find valid related vocab (guaranteed to have at least one)
    const relatedVocabList = await vocabRepo.getVocabByUIDs(vocabData.relatedVocab!);
    const validRelatedVocab = relatedVocabList.filter(v =>
      v.consideredCharacter === true &&
      v.sounds && v.sounds.some(s => !s.disableForPractice) &&
      v.content
    );

    // Pick random related vocab as distractor (guaranteed to exist)
    vocab2.value = randomFromArray(validRelatedVocab)!;

    // Shuffle the two vocabs and track correct index
    const vocabArray = [vocab1.value, vocab2.value];
    shuffledVocabs.value = shuffleArray(vocabArray);
    correctIndex.value = shuffledVocabs.value.findIndex(v => v.uid === vocab1.value!.uid);

  } catch (error) {
    console.error('Choose from Sound: Failed to load vocab data for UID:', vocabUid.value, error);
  } finally {
    loading.value = false;
  }
}

async function selectOption(index: number) {
  if (isAnswered.value) return;

  selectedAnswerIndex.value = index;
  const isCorrect = index === correctIndex.value;

  if (isCorrect) {
    isAnswered.value = true;
    await handleCompletion();
  } else {
    // Wrong answer: mark first attempt as wrong, disable button
    firstAttemptWrong.value = true;
  }
}

function getButtonClass(index: number): string {
  const isCorrect = index === correctIndex.value;
  const isAnswerSelected = index === selectedAnswerIndex.value;

  if (isCorrect && isAnswerSelected) {
    return 'btn-success';
  }

  if (!isCorrect && isAnswerSelected) {
    return 'btn-error';
  }

  if (isAnswered.value && isCorrect) {
    return 'btn-success';
  }

  if (isAnswered.value && !isCorrect) {
    return 'btn-outline opacity-50';
  }


  return 'btn-outline';
}

function getOptionContainerClass(index: number): string {
  const isCorrect = index === correctIndex.value;
  const isAnswerSelected = index === selectedAnswerIndex.value;

  if (isCorrect && isAnswerSelected) {
    return 'border-2 border-green-400 rounded-lg p-2 transform translate-y-[-2px]';
  }

  if (isAnswered.value && isCorrect) {
    return 'border-2 border-green-400 rounded-lg p-2 transform translate-y-[-2px]';
  }

  if (!isCorrect && isAnswerSelected) {
    return 'border-2 border-transparent rounded-lg p-2 opacity-50';
  }

  return 'border-2 border-transparent rounded-lg p-2';
}

function isButtonDisabled(index: number): boolean {
  const isCorrect = index === correctIndex.value;
  const isAnswerSelected = index === selectedAnswerIndex.value;

  if (isAnswered.value) return true;
  if (!isCorrect && isAnswerSelected) return true;

  return false;
}

function skipTask() {
  emit('finished');
}

const handleCompletion = async () => {
  if (!vocab1.value) return;

  try {
    const rating = firstAttemptWrong.value ? Rating.Again : Rating.Good;
    const immediateDue = props.modeContext?.setWrongVocabDueAgainImmediately || false;
    await vocabRepo.scoreVocab(vocab1.value.uid, rating, immediateDue);
    await vocabRepo.updateLastReview(vocab1.value.uid);

    setTimeout(() => emit('finished'), 750);
  } catch (error) {
    console.error('Error scoring vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocabData);
</script>