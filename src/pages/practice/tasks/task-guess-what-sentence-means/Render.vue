<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { createEmptyCard } from 'ts-fsrs';
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
const vocab = ref<VocabData | null>(null);
const translations = ref<string[]>([]);
const userGuess = ref('');
const showTranslation = ref(false);

const canReveal = computed(() => {
  return userGuess.value.trim().length > 0;
});

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;

  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  if (vocabData) {
    vocab.value = vocabData;
    const translationData = await translationRepo.getTranslationsByIds(vocabData.translations);
    translations.value = translationData.map(t => t.content);
  }
};

const handleReveal = () => {
  showTranslation.value = true;
};

const handleDone = async () => {
  if (!vocab.value) return;

  try {
    // Save user's guess as a note if they provided one
    if (userGuess.value.trim()) {
      const noteData = {
        content: userGuess.value.trim(),
        noteType: 'initially guessed answer'
      };
      
      const savedNote = await noteRepo.saveNote(noteData);
      
      // Add note to vocab
      const updatedVocab = {
        ...vocab.value,
        notes: [...vocab.value.notes, savedNote.uid],
        progress: {
          ...vocab.value.progress,
          level: 0,
          ...createEmptyCard()
        }
      };
      
      await vocabRepo.updateVocab(JSON.parse(JSON.stringify(updatedVocab)));
    } else {
      // Initialize learning card for unseen vocab without saving note
      const updatedVocab = {
        ...vocab.value,
        progress: {
          ...vocab.value.progress,
          level: 0,
          ...createEmptyCard()
        }
      };
      
      await vocabRepo.updateVocab(JSON.parse(JSON.stringify(updatedVocab)));
    }

    emit('finished');
  } catch (error) {
    console.error('Error initializing vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab" class="max-w-4xl mx-auto">
    <div class="text-3xl font-bold mb-8 p-6 bg-base-200 rounded-lg">
      {{ vocab.content }}
    </div>

    <div class="mb-8">
      <label for="user-guess" class="block text-lg font-medium mb-4">
        Your guess:
      </label>
      <textarea id="user-guess" v-model="userGuess" :disabled="showTranslation"
        class="textarea textarea-bordered textarea-lg w-full h-32 text-lg"
        placeholder="Type what you think this sentence means..."></textarea>
    </div>

    <div v-if="!showTranslation" class="text-center">
      <button @click="handleReveal" :disabled="!canReveal" class="btn btn-primary btn-lg">
        Reveal Translation
      </button>
    </div>

    <div v-if="showTranslation">
      <div class="mb-8">
        <div class="divider text-lg font-medium">Translation</div>
        <div class="text-2xl font-bold text-center p-6 bg-accent/10 rounded-lg">
          {{ translations.join(', ') }}
        </div>
      </div>

      <div class="text-center">
        <button @click="handleDone" class="btn btn-primary btn-lg">
          Done
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>