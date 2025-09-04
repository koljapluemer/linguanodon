<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import AudioRecorder from './AudioRecorder.vue';

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
const activeTab = ref<'text' | 'audio'>('text');
const audioRecording = ref<{ blob: Blob; duration: number } | null>(null);

const isDoneEnabled = computed(() => {
  if (activeTab.value === 'text') {
    return sentence.value.trim().length >= 3;
  } else {
    return audioRecording.value !== null;
  }
});

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

const handleRecordingReady = (blob: Blob, duration: number) => {
  audioRecording.value = { blob, duration };
};

const handleDone = async () => {
  if (!isDoneEnabled.value || vocabItems.value.length === 0) return;
  
  try {
    if (activeTab.value === 'text') {
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
    } else if (activeTab.value === 'audio' && audioRecording.value) {
      // Create VocabSound from the audio recording
      const vocabSound = {
        uid: crypto.randomUUID(),
        blob: audioRecording.value.blob,
        addedAt: new Date(),
        fileSize: audioRecording.value.blob.size,
        mimeType: audioRecording.value.blob.type,
        duration: audioRecording.value.duration,
        originalFileName: `sentence-${Date.now()}.webm`,
        disableForPractice: true // Set this to true as requested
      };
      
      // Attach sound to both vocab items
      for (const vocab of vocabItems.value) {
        const updatedVocab = {
          ...vocab,
          sounds: [...(vocab.sounds || []), vocabSound]
        };
        await vocabRepo.updateVocab(toRaw(updatedVocab));
      }
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
    <!-- Vocabulary Display -->
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
    </div>

    <!-- Tabbed Interface -->
    <div class="w-full max-w-4xl mx-auto mb-8">
      <!-- Tab Headers -->
      <div class="tabs tabs-bordered w-full justify-center mb-6">
        <button 
          @click="activeTab = 'text'"
          :class="['tab', 'tab-bordered', { 'tab-active': activeTab === 'text' }]"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Write Text
        </button>
        
        <button 
          @click="activeTab = 'audio'"
          :class="['tab', 'tab-bordered', { 'tab-active': activeTab === 'audio' }]"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          Record Audio
        </button>
      </div>

      <!-- Tab Content -->
      <div class="min-h-[300px] flex items-center justify-center">
        <!-- Text Tab -->
        <div v-if="activeTab === 'text'" class="w-full max-w-2xl">
          <div class="text-center mb-6">
            <p class="text-lg text-base-content/70 mb-4">
              {{ vocabItems.length === 1 ? 'Write a sentence using this word' : 'Write a sentence using both words' }}
            </p>
          </div>
          
          <textarea 
            v-model="sentence"
            class="textarea textarea-bordered w-full text-lg"
            rows="6"
            :placeholder="vocabItems.length === 1 ? 'Form a sentence using this word...' : 'Form a sentence using both words...'"
          ></textarea>
          
          <div class="text-right mt-2">
            <span class="text-sm text-base-content/50">
              {{ sentence.trim().length }} characters
            </span>
          </div>
        </div>

        <!-- Audio Tab -->
        <div v-if="activeTab === 'audio'" class="w-full max-w-2xl">
          <AudioRecorder 
            :vocab-count="vocabItems.length"
            @recording-ready="handleRecordingReady"
          />
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="flex justify-center gap-4">
      <button @click="handleSkip" class="btn btn-ghost">Skip</button>
      <button @click="handleDone" class="btn btn-primary" :disabled="!isDoneEnabled">
        Done
        <span v-if="activeTab === 'text' && sentence.trim().length >= 3" class="ml-2">
          💬
        </span>
        <span v-if="activeTab === 'audio' && audioRecording" class="ml-2">
          🎤
        </span>
      </button>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <span class="loading loading-spinner loading-lg"></span>
    <p class="mt-4 text-base-content/70">Loading vocabulary...</p>
  </div>
</template>