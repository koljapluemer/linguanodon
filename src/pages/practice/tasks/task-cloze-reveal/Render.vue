<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Rating } from 'ts-fsrs';
import SpacedRepetitionRating from '@/pages/practice/tasks/ui/SpacedRepetitionRating.vue';
import { generateClozeFromText, isRTLText, type ClozeData } from '@/pages/practice/tasks/utils/clozeUtils';
import type { NoteData } from '@/entities/notes/NoteData';
import NoteDisplayMini from '@/entities/notes/NoteDisplayMini.vue';
import LinkDisplayMini from '@/shared/links/LinkDisplayMini.vue';

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
const noteRepo = props.repositories.noteRepo!;

const vocab = ref<VocabData | null>(null);
const translations = ref<TranslationData[]>([]);
const vocabNotes = ref<NoteData[]>([]);
const translationNotes = ref<NoteData[]>([]);
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
    
    // Load vocab notes
    if (vocabData.notes && vocabData.notes.length > 0) {
      vocabNotes.value = await noteRepo.getNotesByUIDs(vocabData.notes);
    }
    
    // Load translation notes
    const allTranslationNoteIds: string[] = [];
    translations.value.forEach(translation => {
      if (translation.notes && translation.notes.length > 0) {
        allTranslationNoteIds.push(...translation.notes);
      }
    });
    if (allTranslationNoteIds.length > 0) {
      translationNotes.value = await noteRepo.getNotesByUIDs(allTranslationNoteIds);
    }

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
    const immediateDue = props.modeContext?.setWrongVocabDueAgainImmediately || false;
    await vocabRepo.scoreVocab(vocab.value.uid, rating, immediateDue);
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
        <span class="inline-block bg-gray-300  text-transparent rounded px-2 py-1 mx-1 select-none" 
              :style="{ width: Math.max(clozeData.hiddenWord.length * 0.6, 3) + 'em' }">
          {{ clozeData.hiddenWord }}
        </span>
        <span v-if="clozeData.afterWord" class="ms-2">{{ clozeData.afterWord }}</span>
      </div>
      <div v-if="translationContent" class="text-2xl text-light" >
        {{ translationContent }}
      </div>
      
      <!-- Vocab notes that should show before exercise -->
      <div v-if="vocabNotes.filter(note => note.showBeforeExercise).length > 0" class="space-y-2 mt-4">
        <NoteDisplayMini 
          v-for="note in vocabNotes.filter(note => note.showBeforeExercise)" 
          :key="note.uid"
          :note="note"
        />
      </div>
      
      <!-- Translation notes that should show before exercise -->
      <div v-if="translationNotes.filter(note => note.showBeforeExercise).length > 0" class="space-y-2 mt-4">
        <NoteDisplayMini 
          v-for="note in translationNotes.filter(note => note.showBeforeExercise)" 
          :key="note.uid"
          :note="note"
        />
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
        <div v-if="translationContent" class="text-2xl text-light">
          {{ translationContent }}
        </div>
      </div>
      
      <SpacedRepetitionRating @rating="handleRating" />
    </div>
    
    <div v-else>
      <button @click="isRevealed = true" class="btn btn-primary">Reveal</button>
    </div>
    
    <!-- Links -->
    <div v-if="vocab?.links && vocab.links.length > 0" class="space-y-2 mt-6">
      <LinkDisplayMini
        v-for="(link, index) in vocab.links"
        :key="index"
        :link="link"
      />
    </div>
  </div>

  <div v-else>
    <span>Failed to load exercise data</span>
  </div>
</template>