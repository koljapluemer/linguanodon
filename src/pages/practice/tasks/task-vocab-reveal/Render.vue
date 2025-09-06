<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import type { Rating } from 'ts-fsrs';
import SpacedRepetitionRating from '@/pages/practice/tasks/ui/SpacedRepetitionRating.vue';
import type { NoteData } from '@/entities/notes/NoteData';
import NoteDisplayMini from '@/entities/notes/NoteDisplayMini.vue';
import LinkDisplayMini from '@/shared/links/LinkDisplayMini.vue';

interface Props {
  task: Task;
  repositories: RepositoriesContextStrict;
  modeContext?: {
    setWrongVocabDueAgainImmediately?: boolean;
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const vocabRepo = props.repositories.vocabRepo;
const translationRepo = props.repositories.translationRepo;
const noteRepo = props.repositories.noteRepo;
const vocab = ref<VocabData | null>(null);
const translations = ref<TranslationData[]>([]);
const vocabNotes = ref<NoteData[]>([]);
const translationNotes = ref<NoteData[]>([]);
const isRevealed = ref(false);

const isNativeToTarget = computed(() => props.task.taskType === 'vocab-reveal-native-to-target');

const isSentence = computed(() => {
  return vocab.value?.length === 'sentence';
});

const frontContent = computed(() => {
  if (!vocab.value || translations.value.length === 0) return '';
  
  if (isNativeToTarget.value) {
    return translations.value[0]?.content; // Show translation
  } else {
    return vocab.value.content; // Show vocab
  }
});

const solution = computed(() => {
  if (!vocab.value || translations.value.length === 0) return '';
  
  if (isNativeToTarget.value) {
    return vocab.value.content; // Show vocab as solution
  } else {
    return translations.value.map(t => t.content).join(', '); // Show translations as solution
  }
});

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  
  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  if (vocabData) {
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
  }
};

const handleRating = async (rating: Rating) => {
  if (!vocab.value) return;
  
  try {
    // Score vocab and update last review
    // In illegal immersion mode, use immediateDue for low ratings
    const immediateDue = props.modeContext?.setWrongVocabDueAgainImmediately || false;
    await vocabRepo.scoreVocab(vocab.value.uid, rating, immediateDue);
    await vocabRepo.updateLastReview(vocab.value.uid);
    
    emit('finished');
  } catch (error) {
    console.error('Error scoring vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <!-- Main content with notes sidebar -->
    <div class="flex gap-4 mb-8">
      <div class="flex-1 text-center">
        <div :class="isSentence ? 'text-3xl' : 'text-6xl'" class="font-bold">{{ frontContent }}</div>
      </div>
      
      <!-- Notes sidebar -->
      <div v-if="vocabNotes.filter(note => note.showBeforeExercise).length > 0 || translationNotes.filter(note => note.showBeforeExercise).length > 0" class="w-64 space-y-3">
        <!-- Vocab notes -->
        <div v-if="vocabNotes.filter(note => note.showBeforeExercise).length > 0" class="space-y-2">
          
          <NoteDisplayMini 
            v-for="note in vocabNotes.filter(note => note.showBeforeExercise)" 
            :key="note.uid"
            :note="note"
          />
        </div>
        
        <!-- Translation notes -->
        <div v-if="translationNotes.filter(note => note.showBeforeExercise).length > 0" class="space-y-2">
          
          <NoteDisplayMini 
            v-for="note in translationNotes.filter(note => note.showBeforeExercise)" 
            :key="note.uid"
            :note="note"
          />
        </div>
      </div>
    </div>
    
    <div class="text-center">
      
      <div v-if="isRevealed">
        <div class="divider mb-6">Answer</div>
        <div :class="isSentence ? 'text-xl' : 'text-3xl'" class="text-light mb-6">{{ solution }}</div>
        
        <SpacedRepetitionRating @rating="handleRating" />
      </div>
      
      <!-- Links -->
      <div v-if="vocab?.links && vocab.links.length > 0" class="space-y-2 mt-6">
        <LinkDisplayMini
          v-for="(link, index) in vocab.links"
          :key="index"
          :link="link"
        />
      </div>
      
      <div v-else>
        <button @click="isRevealed = true" class="btn btn-primary">Reveal</button>
      </div>
    </div>
  </div>
  
  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>