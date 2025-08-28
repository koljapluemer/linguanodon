<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import { shuffleArray } from '@/shared/arrayUtils';
import { Rating } from 'ts-fsrs';

interface AnswerOption {
  content: string;
  isCorrect: boolean;
}

interface ClozeData {
  beforeWord: string;
  hiddenWord: string;
  afterWord: string;
  hiddenWordIndex: number;
  hiddenWords?: string[]; // For multiple word clozing
}

interface Props {
  task: Task;
}

const emit = defineEmits<{
  finished: [];
}>();

const props = defineProps<Props>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;

const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);
const answerOptions = ref<AnswerOption[]>([]);
const vocab = ref<VocabData | null>(null);
const translations = ref<TranslationData[]>([]);
const loading = ref(true);
const clozeData = ref<ClozeData | null>(null);

const vocabUid = computed(() => {
  return props.task.associatedVocab?.[0];
});


const isReverse = computed(() => {
  // Sentence/phrase cloze only goes content→translation
  if (vocab.value?.length === 'sentence' || vocab.value?.length === 'word') {
    return false;
  }
  // Vocab-based cloze can go both ways
  return props.task.taskType.includes('native-to-target');
});

const optionCount = computed(() => {
  return props.task.taskType.includes('four') ? 4 : 2;
});

const isRTL = computed(() => {
  if (!vocab.value?.content) return false;
  // Check if text contains RTL characters using Unicode ranges
  const rtlChars = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
  return rtlChars.test(vocab.value.content);
});

const secondaryContent = computed(() => {
  if (!vocab.value || translations.value.length === 0) return '';

  if (isReverse.value) {
    // Show vocab content as secondary when translation is primary (cloze)
    return vocab.value.content || '';
  } else {
    // Show translation as secondary when vocab is primary (cloze)
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

    await generateClozeOptions();
  } catch (error) {
    console.error('Failed to load vocab data:', error);
  } finally {
    loading.value = false;
  }
}

function splitTextIntoWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(word => word.length > 0);
}

function generateClozeFromText(text: string, level: number): ClozeData {
  const words = splitTextIntoWords(text);
  
  if (words.length < 1) {
    return {
      beforeWord: '',
      hiddenWord: text,
      afterWord: '',
      hiddenWordIndex: 0
    };
  }

  if (words.length === 1) {
    return {
      beforeWord: '',
      hiddenWord: words[0],
      afterWord: '',
      hiddenWordIndex: 0
    };
  }

  const wordCount = words.length;
  let indicesToHide: number[] = [];
  
  if (level < wordCount) {
    // Single word clozing based on level (0-indexed)
    indicesToHide = [level];
  } else {
    // Multiple word clozing when level >= wordCount
    // Start over but cloze two words
    const baseIndex = level % wordCount;
    const nextIndex = (baseIndex + 1) % wordCount;
    indicesToHide = [baseIndex, nextIndex];
  }
  
  // Sort indices to handle them properly
  indicesToHide.sort((a, b) => a - b);
  
  const hiddenWords = indicesToHide.map(i => words[i]);
  const hiddenWord = hiddenWords.join(' ');
  
  // Build the text with hidden words replaced by placeholder
  let result = [...words];
  // Replace from right to left to maintain correct indices
  for (let i = indicesToHide.length - 1; i >= 0; i--) {
    result[indicesToHide[i]] = '___HIDDEN___';
  }
  
  const textWithPlaceholder = result.join(' ');
  const parts = textWithPlaceholder.split('___HIDDEN___');
  
  return {
    beforeWord: parts[0]?.trim() || '',
    hiddenWord: hiddenWord,
    afterWord: parts[parts.length - 1]?.trim() || '',
    hiddenWordIndex: indicesToHide[0],
    hiddenWords: hiddenWords
  };
}

async function generateClozeOptions() {
  if (!vocab.value || translations.value.length === 0) return;

  const sourceText = isReverse.value 
    ? translations.value[Math.floor(Math.random() * translations.value.length)].content
    : vocab.value.content || '';
  
  clozeData.value = generateClozeFromText(sourceText, vocab.value.progress.level);
  const correctAnswer = clozeData.value.hiddenWord;
  
  const options: AnswerOption[] = [];
  options.push({ content: correctAnswer, isCorrect: true });
  
  const wrongCount = optionCount.value - 1;
  const wrongAnswers = isReverse.value
    ? await translationRepo.generateWrongTranslations(correctAnswer, wrongCount)
    : await vocabRepo.generateWrongVocabs(vocab.value.language, correctAnswer, wrongCount);

  wrongAnswers.forEach(wrong => {
    options.push({ content: wrong, isCorrect: false });
  });

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
    await vocabRepo.scoreVocab(vocab.value.uid, rating);
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
  <div v-if="loading">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <div v-else-if="vocab && answerOptions.length > 0 && clozeData" class="text-center">
    <div class="mb-8">
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
    
    <div v-if="!isAnswered" class="grid grid-cols-1 gap-2 mb-6">
      <button v-for="(option, index) in answerOptions" :key="index" :class="getButtonClass(index)"
        :disabled="isButtonDisabled(index)" @click="selectOption(index)" class="btn btn-lg">
        {{ option.content }}
      </button>
    </div>

    <div v-if="isAnswered" class="mb-6">
      <div class="text-3xl mb-4" :class="{ 'rtl': isRTL }">
        <span v-if="clozeData.beforeWord" class="mr-2">{{ clozeData.beforeWord }}</span>
        <span class="text-green-600 font-bold mx-1">{{ clozeData.hiddenWord }}</span>
        <span v-if="clozeData.afterWord" class="ml-2">{{ clozeData.afterWord }}</span>
      </div>
      <div v-if="secondaryContent" class="text-2xl text-base-content/70" :class="{ 'rtl': isRTL }">
        {{ secondaryContent }}
      </div>
    </div>
  </div>

  <div v-else>
    <span>Failed to load exercise data</span>
  </div>
</template>