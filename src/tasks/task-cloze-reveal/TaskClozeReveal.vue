<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Rating } from 'ts-fsrs';
import SpacedRepetitionRating from '@/shared/SpacedRepetitionRating.vue';

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

const vocab = ref<VocabData | null>(null);
const translations = ref<TranslationData[]>([]);
const loading = ref(true);
const clozeData = ref<ClozeData | null>(null);
const isRevealed = ref(false);

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

const isRTL = computed(() => {
  if (!vocab.value?.content) return false;
  // Check if text contains RTL characters using Unicode ranges
  const rtlChars = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
  return rtlChars.test(vocab.value.content);
});

const translationContent = computed(() => {
  if (translations.value.length === 0) return '';

  if (isReverse.value) {
    // Show vocab content as secondary when translation is primary (cloze)
    return vocab.value?.content || '';
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

    generateCloze();
  } catch (error) {
    console.error('Failed to load vocab data:', error);
  } finally {
    loading.value = false;
  }
}

function splitTextIntoWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(word => word.length > 0);
}

function generateCloze() {
  if (!vocab.value || translations.value.length === 0) return;

  const text = isReverse.value 
    ? translations.value[Math.floor(Math.random() * translations.value.length)].content
    : vocab.value.content || '';
  
  clozeData.value = generateClozeFromText(text, vocab.value.progress.level);
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

const handleRating = async (rating: Rating) => {
  if (!vocab.value) return;
  
  try {
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
  <div v-if="loading">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <div v-else-if="vocab && clozeData" class="text-center">
    <div class="mb-8">
      <div class="text-3xl mb-4" :class="{ 'rtl': isRTL }">
        <span v-if="clozeData.beforeWord" class="mr-2">{{ clozeData.beforeWord }}</span>
        <span class="inline-block bg-gray-300 dark:bg-gray-600 text-transparent rounded px-2 py-1 mx-1 select-none" 
              :style="{ width: Math.max(clozeData.hiddenWord.length * 0.6, 3) + 'em' }">
          {{ clozeData.hiddenWord }}
        </span>
        <span v-if="clozeData.afterWord" class="ml-2">{{ clozeData.afterWord }}</span>
      </div>
      <div v-if="translationContent" class="text-2xl text-base-content/70" :class="{ 'rtl': isRTL }">
        {{ translationContent }}
      </div>
    </div>
    
    <div v-if="isRevealed">
      <div class="divider mb-6">Answer</div>
      
      <div class="mb-6">
        <div class="text-3xl mb-4" :class="{ 'rtl': isRTL }">
          <span v-if="clozeData.beforeWord" class="mr-2">{{ clozeData.beforeWord }}</span>
          <span class="text-green-600 font-bold mx-1">{{ clozeData.hiddenWord }}</span>
          <span v-if="clozeData.afterWord" class="ml-2">{{ clozeData.afterWord }}</span>
        </div>
        <div v-if="translationContent" class="text-2xl text-base-content/70" :class="{ 'rtl': isRTL }">
          {{ translationContent }}
        </div>
      </div>
      
      <SpacedRepetitionRating @rating="handleRating" />
    </div>
    
    <div v-else>
      <button @click="isRevealed = true" class="btn btn-primary">Reveal</button>
    </div>
  </div>

  <div v-else>
    <span>Failed to load exercise data</span>
  </div>
</template>