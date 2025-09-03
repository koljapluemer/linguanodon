<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { Rating } from 'ts-fsrs';
import SpacedRepetitionRating from '@/pages/practice/tasks/ui/SpacedRepetitionRating.vue';
import { generateClozeFromText, isRTLText, type ClozeData } from '@/pages/practice/tasks/utils/clozeUtils';

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
  return isRTLText(vocab.value.content);
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

function generateCloze() {
  if (!vocab.value || translations.value.length === 0) return;

  const text = isReverse.value 
    ? translations.value[Math.floor(Math.random() * translations.value.length)].content
    : vocab.value.content || '';
  
  clozeData.value = generateClozeFromText(text, vocab.value.progress.level);
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
      <div class="text-3xl mb-4" :dir="isRTL ? 'rtl' : 'ltr'">
        <span v-if="clozeData.beforeWord" class="me-2">{{ clozeData.beforeWord }}</span>
        <span class="inline-block bg-gray-300 dark:bg-gray-600 text-transparent rounded px-2 py-1 mx-1 select-none" 
              :style="{ width: Math.max(clozeData.hiddenWord.length * 0.6, 3) + 'em' }">
          {{ clozeData.hiddenWord }}
        </span>
        <span v-if="clozeData.afterWord" class="ms-2">{{ clozeData.afterWord }}</span>
      </div>
      <div v-if="translationContent" class="text-2xl text-base-content/70" >
        {{ translationContent }}
      </div>
    </div>
    
    <div v-if="isRevealed">
      <div class="divider mb-6">Answer</div>
      
      <div class="mb-6">
        <div class="text-3xl mb-4" :dir="isRTL ? 'rtl' : 'ltr'">
          <span v-if="clozeData.beforeWord" class="me-2">{{ clozeData.beforeWord }}</span>
          <span class="text-green-600 font-bold mx-1">{{ clozeData.hiddenWord }}</span>
          <span v-if="clozeData.afterWord" class="ms-2">{{ clozeData.afterWord }}</span>
        </div>
        <div v-if="translationContent" class="text-2xl text-base-content/70">
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