<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';

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

const vocabItems = ref<VocabData[]>([]);
const translations = ref<{ [vocabUid: string]: string[] }>({});
const sentence = ref('');

const isDoneEnabled = computed(() => sentence.value.trim().length >= 3);

const loadVocab = async () => {
  const vocabUids = props.task.associatedVocab || [];
  if (vocabUids.length === 0 || vocabUids.length > 2) return;

  const vocabData = await vocabRepo.getVocabByUIDs(vocabUids);
  if (vocabData.length >= 1) {
    vocabItems.value = vocabData;
    
    for (const vocab of vocabData) {
      const translationData = await translationRepo.getTranslationsByIds(vocab.translations);
      translations.value[vocab.uid] = translationData.map(t => t.content);
    }
  }
};

const handleSkip = async () => {
  await handleTaskCompletion();
  emit('finished');
};

const handleDone = async () => {
  if (!isDoneEnabled.value || vocabItems.value.length === 0) return;
  
  try {
    // Create note with the sentence
    const noteData = {
      content: sentence.value.trim(),
      noteType: 'example sentence task',
      showBeforeExercise: false
    };
    const savedNote = await noteRepo.saveNote(toRaw(noteData));
    
    // Attach note to both vocab items
    for (const vocab of vocabItems.value) {
      const updatedVocab = {
        ...vocab,
        notes: [...vocab.notes, savedNote.uid]
      };
      await vocabRepo.updateVocab(toRaw(updatedVocab));
    }
    
    await handleTaskCompletion();
    emit('finished');
  } catch (error) {
    console.error('Error saving sentence:', error);
    await handleTaskCompletion();
    emit('finished');
  }
};

const handleTaskCompletion = async () => {
  // For backup tasks (single word or lowest due vocab), update lastSeenAt and due date
  if (props.task.taskType === 'vocab-form-sentence-single' || 
      (props.task.taskType === 'vocab-form-sentence' && vocabItems.value.length <= 2)) {
    const vocabUids = props.task.associatedVocab || [];
    if (vocabUids.length > 0) {
      // Set due date to 60 minutes in the future
      const fiveMinutesFromNow = new Date(Date.now() + 60 * 60 * 1000);
      await vocabRepo.updateVocabLastSeenAndDueDate(vocabUids, fiveMinutesFromNow);
    }
  }
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocabItems.length >= 1">
    <div class="text-center mb-8">
      <div class="mb-6">
        <div class="text-4xl font-bold mb-2">{{ vocabItems[0].content }}</div>
        <div class="text-xl text-base-content/70 mb-4">{{ translations[vocabItems[0].uid]?.join(', ') }}</div>
        
        <div v-if="vocabItems.length === 2">
          <div class="text-4xl font-bold mb-2">{{ vocabItems[1].content }}</div>
          <div class="text-xl text-base-content/70">{{ translations[vocabItems[1].uid]?.join(', ') }}</div>
        </div>
      </div>
      
      <div class="divider mb-6"></div>
      
      <div class="mb-8">
        <textarea 
          v-model="sentence"
          class="textarea textarea-bordered w-full text-lg"
          rows="4"
          :placeholder="vocabItems.length === 1 ? 'Form a sentence using this word...' : 'Form a sentence using both words...'"
        ></textarea>
      </div>
    </div>
    
    <div class="flex justify-center gap-4">
      <button @click="handleSkip" class="btn btn-ghost">Skip</button>
      <button @click="handleDone" class="btn btn-primary" :disabled="!isDoneEnabled">Done</button>
    </div>
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>