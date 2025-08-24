<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import { shuffleArray } from '@/shared/arrayUtils';

interface AnswerOption {
  content: string;
  isCorrect: boolean;
}

interface ClozeData {
  beforeWord: string;
  hiddenWord: string;
  afterWord: string;
  hiddenWordIndex: number;
}

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;

// Use the task state composable

// Exercise state
const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);
const answerOptions = ref<AnswerOption[]>([]);
const vocab = ref<VocabData | null>(null);
const translations = ref<TranslationData[]>([]);
const loading = ref(true);
const clozeData = ref<ClozeData | null>(null);

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

const isSingleSentence = computed(() => {
  return vocab.value?.length === 'single-sentence';
});

const isRTL = computed(() => {
  if (!vocab.value) return false;
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'ji', 'iw', 'ku', 'ps', 'sd'];
  return rtlLanguages.includes(vocab.value.language);
});

const displayContent = computed(() => {
  if (!vocab.value) return '';

  if (isSingleSentence.value && clozeData.value) {
    return ''; // Will be handled by cloze template
  }

  if (isReverse.value) {
    // For translation-to-vocab, show random translation
    const randomTranslation = translations.value[Math.floor(Math.random() * translations.value.length)];
    return randomTranslation?.content || '';
  } else {
    // For vocab-to-translation, show vocab
    return vocab.value.content || '';
  }
});

const secondaryContent = computed(() => {
  if (!vocab.value || !isSingleSentence.value) return '';

  if (isReverse.value) {
    // Show vocab content as secondary when translation is primary
    return vocab.value.content || '';
  } else {
    // Show translation as secondary when vocab is primary
    const randomTranslation = translations.value[Math.floor(Math.random() * translations.value.length)];
    return randomTranslation?.content || '';
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

function splitTextIntoWords(text: string): string[] {
  // For RTL languages, we still split on spaces but preserve RTL ordering
  return text.trim().split(/\s+/).filter(word => word.length > 0);
}

function generateClozeFromSentence(sentence: string): ClozeData {
  const words = splitTextIntoWords(sentence);
  
  if (words.length < 2) {
    // Fallback: treat as single word
    return {
      beforeWord: '',
      hiddenWord: sentence,
      afterWord: '',
      hiddenWordIndex: 0
    };
  }

  // Select a random word to hide (avoid first/last word if possible for better context)
  const availableIndices = words.length > 3 
    ? Array.from({length: words.length - 2}, (_, i) => i + 1)
    : Array.from({length: words.length}, (_, i) => i);
  
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  const hiddenWord = words[randomIndex];
  
  const beforeWords = words.slice(0, randomIndex);
  const afterWords = words.slice(randomIndex + 1);
  
  return {
    beforeWord: beforeWords.join(' '),
    hiddenWord: hiddenWord,
    afterWord: afterWords.join(' '),
    hiddenWordIndex: randomIndex
  };
}

async function generateOptions() {
  if (!vocab.value || translations.value.length === 0) return;

  const options: AnswerOption[] = [];

  // Handle single-sentence cloze differently
  if (isSingleSentence.value) {
    const sourceText = isReverse.value 
      ? translations.value[Math.floor(Math.random() * translations.value.length)].content
      : vocab.value.content || '';
    
    clozeData.value = generateClozeFromSentence(sourceText);
    const correctAnswer = clozeData.value.hiddenWord;
    
    options.push({ content: correctAnswer, isCorrect: true });
    
    // Generate wrong options based on the hidden word, not the full sentence
    const wrongCount = optionCount.value - 1;
    const wrongAnswers = isReverse.value
      ? await translationRepo.generateWrongTranslations(correctAnswer, wrongCount)
      : await vocabRepo.generateWrongVocabs(vocab.value.language, correctAnswer, wrongCount);

    wrongAnswers.forEach(wrong => {
      options.push({ content: wrong, isCorrect: false });
    });

    // Fill remaining slots if needed
    while (options.length < optionCount.value) {
      options.push({ content: correctAnswer, isCorrect: true });
    }
  } else {
    // Original logic for non-sentence content
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

      // Fill remaining slots if needed
      while (options.length < optionCount.value) {
        options.push({ content: correctAnswer, isCorrect: true });
      }
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

      // Fill remaining slots if needed
      while (options.length < optionCount.value) {
        options.push({ content: correctAnswer, isCorrect: true });
      }
    }
  }

  answerOptions.value = shuffleArray(options);
}

function selectOption(index: number) {
  if (isAnswered.value) return;

  selectedIndex.value = index;
  const isCorrect = answerOptions.value[index].isCorrect;

  if (isCorrect) {
    isAnswered.value = true;
    emit('finished')
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

onMounted(loadVocabData);
</script>

<template>

  <!-- Loading State -->
  <div v-if="loading" class="text-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
    <p class="mt-2 text-gray-500">Loading exercise...</p>
  </div>

  <!-- Exercise Content -->
  <div v-else-if="vocab && answerOptions.length > 0" class="card-body text-center items-center">
    <!-- Cloze Display for Single Sentences -->
    <div v-if="isSingleSentence && clozeData" class="mb-8">
      <!-- Primary cloze text -->
      <div class="card-title text-3xl mb-4" :class="{ 'rtl': isRTL }">
        <span v-if="clozeData.beforeWord" class="mr-2">{{ clozeData.beforeWord }}</span>
        <span class="inline-block bg-gray-300 dark:bg-gray-600 text-transparent rounded px-2 py-1 mx-1 select-none" 
              :style="{ width: Math.max(clozeData.hiddenWord.length * 0.6, 3) + 'em' }">
          {{ clozeData.hiddenWord }}
        </span>
        <span v-if="clozeData.afterWord" class="ml-2">{{ clozeData.afterWord }}</span>
      </div>
      <!-- Secondary text (smaller) -->
      <div v-if="secondaryContent" class="text-2xl text-gray-600 dark:text-gray-400" :class="{ 'rtl': isRTL }">
        {{ secondaryContent }}
      </div>
    </div>
    
    <!-- Regular Display for Other Content Types -->
    <div v-else :class="isSingleSentence ? 'text-3xl' : 'text-6xl'" class="card-title mb-8">{{ displayContent }}
    </div>

    <!-- Answer Options - only show when not answered -->
    <div v-if="!isAnswered" class="card-actions">
      <button v-for="(option, index) in answerOptions" :key="index" :class="getButtonClass(index)"
        :disabled="isButtonDisabled(index)" @click="selectOption(index)" class="btn btn-lg">
        {{ option.content }}
      </button>
    </div>

    <!-- Correct Answer Display - show when answered -->
    <div v-if="isAnswered" class="w-full">
      <div class="divider"></div>
      <!-- Show complete sentence for cloze -->
      <div v-if="isSingleSentence && clozeData">
        <!-- Primary text with revealed answer -->
        <div class="text-3xl mt-4 mb-4" :class="{ 'rtl': isRTL }">
          <span v-if="clozeData.beforeWord" class="mr-2">{{ clozeData.beforeWord }}</span>
          <span class="text-green-600 font-bold mx-1">{{ clozeData.hiddenWord }}</span>
          <span v-if="clozeData.afterWord" class="ml-2">{{ clozeData.afterWord }}</span>
        </div>
        <!-- Secondary text -->
        <div v-if="secondaryContent" class="text-2xl text-gray-600 dark:text-gray-400" :class="{ 'rtl': isRTL }">
          {{ secondaryContent }}
        </div>
      </div>
      <!-- Show answer for regular content -->
      <div v-else :class="isSingleSentence ? 'text-3xl' : 'text-6xl'" class="mt-4">
        {{ answerOptions.find(opt => opt.isCorrect)?.content }}
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else class="alert alert-error">
    <span>Failed to load exercise data</span>

  </div>
</template>