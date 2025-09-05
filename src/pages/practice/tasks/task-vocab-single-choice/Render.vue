<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import { shuffleArray } from '@/shared/utils/arrayUtils';
import { Rating } from 'ts-fsrs';

interface AnswerOption {
  content: string;
  isCorrect: boolean;
}


interface Props {
  task: Task;
  repositories: RepositoriesContext;
  modeContext?: {
    setWrongVocabDueAgainImmediately?: boolean;
  };
}

const emit = defineEmits<{
  finished: [];
}>();

const props = defineProps<Props>();

const vocabRepo = props.repositories.vocabRepo!;
const translationRepo = props.repositories.translationRepo!;

// Use the task state composable

// Exercise state
const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);
const answerOptions = ref<AnswerOption[]>([]);
const vocab = ref<VocabData | null>(null);
const translations = ref<TranslationData[]>([]);
const loading = ref(true);

// Get the vocab ID from associated vocab
const vocabUid = computed(() => {
  return props.task.associatedVocab?.[0];
});

// Extract task type info from task type
const isReverse = computed(() => {
  return props.task.taskType.includes('native-to-target');
});

const optionCount = computed(() => {
  return props.task.taskType.includes('four') ? 4 : 2;
});



const displayContent = computed(() => {
  if (!vocab.value) return '';

  if (isReverse.value) {
    // For translation-to-vocab, show random translation
    const randomTranslation = translations.value[Math.floor(Math.random() * translations.value.length)];
    return randomTranslation?.content || '';
  } else {
    // For vocab-to-translation, show vocab
    return vocab.value.content || '';
  }
});


async function loadVocabData() {
  if (!vocabUid.value) {
    loading.value = false;
    return;
  }

  try {
    const vocabData = await vocabRepo.getVocabByUID(vocabUid.value);
    if (!vocabData) {
      loading.value = false;
      return;
    }

    vocab.value = vocabData;
    translations.value = await translationRepo.getTranslationsByIds(vocabData.translations);

    await generateOptions();
  } catch (error) {
    console.error('Failed to load vocab data:', error);
  } finally {
    loading.value = false;
  }
}

async function generateOptions() {
  if (!vocab.value || translations.value.length === 0) return;

  const options: AnswerOption[] = [];

  if (isReverse.value) {
    // Translation-to-vocab: correct answer is vocab content
    const correctAnswer = vocab.value.content || '';
    options.push({ content: correctAnswer, isCorrect: true });

    // Generate wrong vocab options
    const wrongCount = optionCount.value - 1;
    const wrongAnswers = await vocabRepo.generateWrongVocabs(
      vocab.value.language,
      correctAnswer,
      wrongCount
    );

    wrongAnswers.forEach(wrong => {
      options.push({ content: wrong, isCorrect: false });
    });

  } else {
    // Vocab-to-translation: correct answer is random translation
    const correctAnswer = translations.value[Math.floor(Math.random() * translations.value.length)].content;
    options.push({ content: correctAnswer, isCorrect: true });

    // Generate wrong translation options
    const wrongCount = optionCount.value - 1;
    const wrongAnswers = await translationRepo.generateWrongTranslations(
      correctAnswer,
      wrongCount
    );

    wrongAnswers.forEach(wrong => {
      options.push({ content: wrong, isCorrect: false });
    });
  }

  answerOptions.value = shuffleArray(options);
}

async function selectOption(index: number) {
  if (isAnswered.value) return;

  selectedIndex.value = index;
  const isCorrect = answerOptions.value[index].isCorrect;

  if (isCorrect) {
    isAnswered.value = true;
    await handleCompletion();
  } else {
    // Wrong answer: mark first attempt as wrong, disable button
    firstAttemptWrong.value = true;
  }
}

function getButtonClass(index: number): string {
  const isCorrect = answerOptions.value[index].isCorrect;
  const isSelected = index === selectedIndex.value;

  if (isCorrect && isSelected) {
    return 'btn-success';
  }

  if (!isCorrect && isSelected) {
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

function isButtonDisabled(index: number): boolean {
  const isCorrect = answerOptions.value[index].isCorrect;
  const isSelected = index === selectedIndex.value;

  if (isAnswered.value) return true;
  if (!isCorrect && isSelected) return true;

  return false;
}

const handleCompletion = async () => {
  if (!vocab.value) return;
  
  try {
    const rating = firstAttemptWrong.value ? Rating.Again : Rating.Good;
    const immediateDue = props.modeContext?.setWrongVocabDueAgainImmediately || false;
    await vocabRepo.scoreVocab(vocab.value.uid, rating, immediateDue);
    await vocabRepo.updateLastReview(vocab.value.uid);
    
    setTimeout(() => emit('finished'), 750);
  } catch (error) {
    console.error('Error scoring vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocabData);
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <!-- Exercise Content -->
  <div v-else-if="vocab && answerOptions.length > 0" class="text-center">
    <!-- Display Content -->
    <div class="text-6xl font-bold mb-8">{{ displayContent }}</div>

    <!-- Answer Options - only show when not answered -->
    <div v-if="!isAnswered" class="flex flex-col md:flex-row gap-2 mb-6">
      <button v-for="(option, index) in answerOptions" :key="index" :class="getButtonClass(index)"
        :disabled="isButtonDisabled(index)" @click="selectOption(index)" class="btn btn-lg flex-1">
        {{ option.content }}
      </button>
    </div>

    <!-- Show answer when completed -->
    <div v-if="isAnswered" class="mb-6">
      <!-- Show answer for regular content -->
      <div class="text-6xl font-bold text-light mb-6">
        {{ answerOptions.find(opt => opt.isCorrect)?.content }}
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else>
    <span>Failed to load exercise data</span>
  </div>
</template>