<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { createEmptyCard } from 'ts-fsrs';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import NoteDisplayMini from '@/entities/notes/NoteDisplayMini.vue';
import LinkDisplayMini from '@/shared/links/LinkDisplayMini.vue';

interface Props {
  task: Task;
  repositories: RepositoriesContext;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const vocabRepo = props.repositories.vocabRepo!;
const translationRepo = props.repositories.translationRepo!;
const noteRepo = props.repositories.noteRepo!;
const vocab = ref<VocabData | null>(null);
const translations = ref<TranslationData[]>([]);
const vocabNotes = ref<NoteData[]>([]);
const translationNotes = ref<NoteData[]>([]);

const isSentence = computed(() => {
  return vocab.value?.length === 'sentence';
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

const handleDone = async () => {
  if (!vocab.value) return;
  
  try {
    // Initialize learning card for unseen vocab
    const updatedVocab = {
      ...vocab.value,
      progress: {
        ...vocab.value.progress,
        level: 0,
        card: createEmptyCard()
      }
    };
    await vocabRepo.updateVocab(JSON.parse(JSON.stringify(updatedVocab)));
    
    emit('finished');
  } catch (error) {
    console.error('Error initializing vocab:', error);
    emit('finished');
  }
};

const handleSkip = async () => {
  if (!vocab.value) return;
  
  try {
    // Mark vocab as do not practice
    const updatedVocab = {
      ...vocab.value,
      doNotPractice: true
    };
    await vocabRepo.updateVocab(JSON.parse(JSON.stringify(updatedVocab)));
    
    emit('finished');
  } catch (error) {
    console.error('Error updating vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <div class="text-center mb-8">
      <div :class="isSentence ? 'text-3xl' : 'text-5xl'" class="font-bold mb-6">{{ vocab.content }}</div>
      
      <!-- Vocab notes that should show before exercise -->
      <div v-if="vocabNotes.filter(note => note.showBeforeExercise).length > 0" class="space-y-2 mb-4">
        <NoteDisplayMini 
          v-for="note in vocabNotes.filter(note => note.showBeforeExercise)" 
          :key="note.uid"
          :note="note"
        />
      </div>
      
      <div class="divider mb-6"></div>
      <div :class="isSentence ? 'text-3xl' : 'text-5xl'" class="font-bold text-light">
        {{ translations.map(t => t.content).join(', ') }}
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
    
    <!-- Links -->
    <div v-if="vocab.links && vocab.links.length > 0" class="space-y-2 mt-6">
      <LinkDisplayMini
        v-for="(link, index) in vocab.links"
        :key="index"
        :link="link"
      />
    </div>
    
    <div class="flex justify-center gap-4 mt-6">
      <button @click="handleSkip" class="btn btn-ghost">Do not learn this</button>
      <button @click="handleDone" class="btn btn-primary">Done</button>
    </div>
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>