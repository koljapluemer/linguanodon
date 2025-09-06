<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { createEmptyCard } from 'ts-fsrs';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import NoteDisplayMini from '@/entities/notes/NoteDisplayMini.vue';
import LinkDisplayMini from '@/shared/links/LinkDisplayMini.vue';

interface Props {
  task: Task;
  repositories: RepositoriesContextStrict;
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

const isSentence = computed(() => {
  return vocab.value?.consideredSentence === true;
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
    <div class="flex gap-6 mb-8">
      <!-- Main content -->
      <div class="flex-1">
        <!-- Vocab section -->
        <div class="flex gap-4 mb-6">
          <div class="flex-1 text-center">
            <div :class="isSentence ? 'text-3xl' : 'text-5xl'" class="font-bold">{{ vocab.content }}</div>
          </div>
          <!-- Vocab notes sidebar -->
          <div v-if="vocabNotes.filter(note => note.showBeforeExercise).length > 0" class="w-64 space-y-2">
            
            <NoteDisplayMini 
              v-for="note in vocabNotes.filter(note => note.showBeforeExercise)" 
              :key="note.uid"
              :note="note"
            />
          </div>
        </div>
        
        <div class="divider mb-6"></div>
        
        <!-- Translation sections -->
        <div class="space-y-4">
          <div v-for="translation in translations" :key="translation.uid" class="flex gap-4">
            <div class="flex-1 text-center">
              <div :class="isSentence ? 'text-3xl' : 'text-5xl'" class="font-bold text-light">{{ translation.content }}</div>
            </div>
            <!-- Translation notes sidebar -->
            <div v-if="translationNotes.filter(note => note.showBeforeExercise && translation.notes?.includes(note.uid)).length > 0" class="w-64 space-y-2">
              
              <NoteDisplayMini 
                v-for="note in translationNotes.filter(note => note.showBeforeExercise && translation.notes?.includes(note.uid))" 
                :key="note.uid"
                :note="note"
              />
            </div>
          </div>
        </div>
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