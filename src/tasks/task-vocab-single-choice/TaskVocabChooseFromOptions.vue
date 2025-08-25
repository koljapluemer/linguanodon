<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Rating } from 'ts-fsrs';
import { shuffleArray } from '@/shared/arrayUtils';
import SpacedRepetitionRating from '@/shared/SpacedRepetitionRating.vue';

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

const emit = defineEmits<{
  finished: [];
}>();

const props = defineProps<Props>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;

// Use the task state composable

// Exercise state
const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);
const showRating = ref(false);
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
  }

  answerOptions.value = shuffleArray(options);
}

function selectOption(index: number) {
  if (isAnswered.value) return;

  selectedIndex.value = index;
  const isCorrect = answerOptions.value[index].isCorrect;

  if (isCorrect) {
    isAnswered.value = true;
    showRating.value = true;
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

const handleRating = async (rating: Rating) => {
  if (!vocab.value) return;
  
  try {
    // Score vocab and update last review
    await vocabRepo.scoreVocab(vocab.value.uid, rating);
    await vocabRepo.updateLastReview(vocab.value.uid);
    
    emit('finished');
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
    <!-- Cloze Display for Single Sentences -->
    <div v-if="isSingleSentence && clozeData" class="mb-8">
      <div class="text-3xl mb-4" :class="{ 'rtl': isRTL }">
        <span v-if="clozeData.beforeWord" class="mr-2">{{ clozeData.beforeWord }}</span>
        <span class="inline-block bg-gray-300 dark:bg-gray-600 text-transparent rounded px-2 py-1 mx-1 select-none" 
              :style="{ width: Math.max(clozeData.hiddenWord.length * 0.6, 3) + 'em' }">
          {{ clozeData.hiddenWord }}
        </span>
        <span v-if="clozeData.afterWord" class="ml-2">{{ clozeData.afterWord }}</span>
      </div>
      <div v-if="secondaryContent" class="text-2xl text-base-content/70" :class="{ 'rtl': isRTL }">
        {{ secondaryContent }}
      </div>
    </div>
    
    <!-- Regular Display for Other Content Types -->
    <div v-else :class="isSingleSentence ? 'text-3xl' : 'text-6xl'" class="font-bold mb-8">{{ displayContent }}</div>

    <!-- Answer Options - only show when not answered and not showing rating -->
    <div v-if="!isAnswered && !showRating" class="grid grid-cols-1 gap-2 mb-6">
      <button v-for="(option, index) in answerOptions" :key="index" :class="getButtonClass(index)"
        :disabled="isButtonDisabled(index)" @click="selectOption(index)" class="btn btn-lg">
        {{ option.content }}
      </button>
    </div>

    <!-- Correct Answer Display and Rating - show when answered -->
    <div v-if="isAnswered">
      <div class="divider mb-6">Answer</div>
      
      <!-- Show complete sentence for cloze -->
      <div v-if="isSingleSentence && clozeData" class="mb-6">
        <div class="text-3xl mb-4" :class="{ 'rtl': isRTL }">
          <span v-if="clozeData.beforeWord" class="mr-2">{{ clozeData.beforeWord }}</span>
          <span class="text-green-600 font-bold mx-1">{{ clozeData.hiddenWord }}</span>
          <span v-if="clozeData.afterWord" class="ml-2">{{ clozeData.afterWord }}</span>
        </div>
        <div v-if="secondaryContent" class="text-2xl text-base-content/70" :class="{ 'rtl': isRTL }">
          {{ secondaryContent }}
        </div>
      </div>
      
      <!-- Show answer for regular content -->
      <div v-else :class="isSingleSentence ? 'text-3xl' : 'text-6xl'" class="font-bold text-base-content/70 mb-6">
        {{ answerOptions.find(opt => opt.isCorrect)?.content }}
      </div>
      
      <SpacedRepetitionRating @rating="handleRating" />
    </div>
  </div>

  <!-- Error State -->
  <div v-else>
    <span>Failed to load exercise data</span>
  </div>
</template>