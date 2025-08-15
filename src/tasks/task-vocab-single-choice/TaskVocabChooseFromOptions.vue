<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import { DistractorGenerator } from '@/entities/vocab/DistractorGenerator';
import { shuffleArray } from '@/shared/arrayUtils';

interface AnswerOption {
  content: string;
  isCorrect: boolean;
}

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo')!;

// Use the task state composable

// Exercise state
const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);
const answerOptions = ref<AnswerOption[]>([]);
const vocab = ref<VocabData | null>(null);
const translations = ref<TranslationData[]>([]);
const loading = ref(true);

// Get the vocab ID from associated units
const vocabUid = computed(() => {
  const vocabAssociation = props.task.associatedUnits.find(unit => unit.type === 'Vocab');
  return vocabAssociation?.uid;
});

// Extract task type info from task metadata
const isReverse = computed(() => {
  return props.task.title.includes('translation-to-vocab');
});

const optionCount = computed(() => {
  return props.task.title.includes('four') ? 4 : 2;
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
    translations.value = await vocabRepo.getTranslationsByIds(vocabData.translations);
    
    await generateOptions();
  } catch (error) {
    console.error('Failed to load vocab data:', error);
  } finally {
    loading.value = false;
  }
}

async function generateOptions() {
  if (!vocab.value || translations.value.length === 0) return;

  const distractorGen = new DistractorGenerator(vocabRepo);
  const options: AnswerOption[] = [];

  if (isReverse.value) {
    // Translation-to-vocab: correct answer is vocab content
    const correctAnswer = vocab.value.content || '';
    options.push({ content: correctAnswer, isCorrect: true });

    // Generate wrong vocab options
    const wrongCount = optionCount.value - 1;
    const wrongAnswers = await distractorGen.generateWrongVocabs(
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
    const wrongAnswers = await distractorGen.generateWrongTranslations(
      vocab.value,
      translations.value,
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

  answerOptions.value = shuffleArray(options);
}

function selectOption(index: number) {
  if (isAnswered.value) return;

  selectedIndex.value = index;
  const isCorrect = answerOptions.value[index].isCorrect;

  if (isCorrect) {
    // Correct answer: make green and proceed after delay
    isAnswered.value = true;
    setTimeout(() => {
      // Auto-enable done and proceed
      emit('finished');
    }, 350);
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
  <div class="space-y-6">
    <!-- Task Screen -->
    <div>
      <!-- Task Header -->
      <TaskInfo :task="task" />
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-2 text-gray-500">Loading exercise...</p>
      </div>
      
      <!-- Exercise Content -->
      <div v-else-if="vocab && answerOptions.length > 0">
        <!-- Vocab Content Card -->
        <div class="card bg-base-100 shadow-xl mb-6">
          <div class="card-body text-center">
            <h2 class="text-3xl font-bold">{{ displayContent }}</h2>
          </div>
        </div>

        <!-- Answer Options -->
        <div v-if="optionCount === 2" class="flex justify-center gap-4">
          <button 
            v-for="(option, index) in answerOptions" 
            :key="index"
            :class="getButtonClass(index)"
            :disabled="isButtonDisabled(index)"
            @click="selectOption(index)"
            class="btn btn-lg px-8 py-4 min-h-16"
          >
            {{ option.content }}
          </button>
        </div>

        <!-- 2x2 Grid for 4 options -->
        <div v-else class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button 
            v-for="(option, index) in answerOptions" 
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

      <!-- Error State -->
      <div v-else class="alert alert-error">
        <span>Failed to load exercise data</span>
      </div>
    </div>
    
  </div>
</template>