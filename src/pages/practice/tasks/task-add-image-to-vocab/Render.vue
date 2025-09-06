<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import VocabImageManager from '@/features/vocab-image-management/VocabImageManager.vue';
import TaskSkipDisableDone from '@/pages/practice/tasks/ui/TaskSkipDisableDone.vue';
import type { NoteData } from '@/entities/notes/NoteData';
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

// Task state
const hasChanges = ref(false);

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

// Handle image changes from VocabImageManager
const handleImagesChanged = () => {
  hasChanges.value = true;
};

const handleSkip = async () => {
  emit('finished');
};

const handleSkipAndDisable = async () => {
  if (!vocab.value) return;
  
  try {
    await vocabRepo.markVocabNotPicturable(vocab.value.uid);
    emit('finished');
  } catch (err) {
    console.error('Error marking vocab as not picturable:', err);
    emit('finished');
  }
};

const handleDone = () => {
  emit('finished');
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <div class="mb-8">
      <!-- Vocab section -->
      <div class="flex gap-4 mb-6">
        <div class="flex-1 text-center">
          <div :class="isSentence ? 'text-3xl' : 'text-6xl'" class="font-bold">{{ vocab.content }}</div>
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
      <div class="space-y-4 mb-8">
        <div v-for="translation in translations" :key="translation.uid" class="flex gap-4">
          <div class="flex-1 text-center">
            <div :class="isSentence ? 'text-xl' : 'text-2xl'" class="text-light">{{ translation.content }}</div>
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
    
    <!-- Image Management -->
    <div class="max-w-2xl mx-auto mb-8">
      <VocabImageManager
        :vocab-id="vocab.uid"
        :images="vocab.images"
        :is-picturable="vocab.isPicturable"
        @images-changed="handleImagesChanged"
      />
    </div>
    
    <!-- Links -->
    <div v-if="vocab.links && vocab.links.length > 0" class="flex flex-wrap gap-2 mb-6">
      <LinkDisplayMini
        v-for="(link, index) in vocab.links"
        :key="index"
        :link="link"
      />
    </div>
    
    <!-- Action Buttons -->
    <TaskSkipDisableDone 
      :done-disabled="!hasChanges"
      @skip="handleSkip"
      @skip-and-disable="handleSkipAndDisable"
      @done="handleDone"
    />
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>