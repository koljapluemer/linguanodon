<template>
  <!-- Loading State -->
  <div v-if="loading" class="text-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <!-- Exercise Content -->
  <div v-else-if="vocab && imageOptions.length === 2" class="text-center">
    <!-- Sound Player -->
    <div class="my-4">
      <SoundPlayer :sound="playableSound" :auto-play="true" />
    </div>

    <!-- Image Options -->
    <div class="grid grid-cols-2 gap-6 max-w-md mx-auto mb-8">
      <div v-for="(option, index) in imageOptions" :key="index" @click="selectOption(index)"
        :class="getImageContainerClass(index)"
        class="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95">
        <VocabImageDisplay :image="option.image" />
      </div>
    </div>

    <!-- Show result when completed -->
    <div v-if="isAnswered" class="mb-6">
      <!-- Vocab section -->
      <div class="flex gap-4">
        <div class="flex-1 text-center">
          <div class="text-4xl font-bold text-light">
            {{ vocab.content }}
          </div>
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
    </div>

    <!-- Links -->
    <div v-if="vocab?.links && vocab.links.length > 0" class="space-y-2 mb-4">
      <LinkDisplayMini
        v-for="(link, index) in vocab.links"
        :key="index"
        :link="link"
      />
    </div>
    
    <!-- Skip button -->
    <div class="flex justify-end">
      <button @click="skipTask" class="btn btn-outline btn-sm">Skip Exercise</button>
    </div>
  </div>

  <!-- Error State -->
  <div v-else class="text-center">
    <div class="alert alert-error max-w-md mx-auto">
      <span>Failed to load exercise data</span>
    </div>
    <div class="mt-4">
      <button @click="skipTask" class="btn btn-outline">Skip Exercise</button>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData, VocabImage, VocabSound } from '@/entities/vocab/VocabData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import VocabImageDisplay from '@/shared/ui/VocabImage.vue';
import SoundPlayer from '@/shared/ui/SoundPlayer.vue';
import NoteDisplayMini from '@/entities/notes/NoteDisplayMini.vue';
import LinkDisplayMini from '@/shared/links/LinkDisplayMini.vue';
import { Rating } from 'ts-fsrs';

interface ImageOption {
  image: VocabImage;
  isCorrect: boolean;
}

interface Props {
  task: Task;
  repositories: RepositoriesContextStrict;
  modeContext?: {
    setWrongVocabDueAgainImmediately?: boolean;
  };
}

const emit = defineEmits<{
  finished: [];
}>();

const props = defineProps<Props>();

const vocabRepo = props.repositories.vocabRepo;
const noteRepo = props.repositories.noteRepo;

// Exercise state
const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);
const imageOptions = ref<ImageOption[]>([]);
const vocab = ref<VocabData | null>(null);
const vocabNotes = ref<NoteData[]>([]);
const loading = ref(true);

// Sound state  
const playableSound = ref<VocabSound | null>(null);

// Get the vocab ID from associated vocab
const vocabUid = computed(() => {
  return props.task.associatedVocab?.[0];
});

async function loadVocabData() {
  if (!vocabUid.value) {
    console.error('Choose Image by Sound: No vocab UID provided');
    loading.value = false;
    return;
  }

  try {
    const vocabData = await vocabRepo.getVocabByUID(vocabUid.value);
    if (!vocabData) {
      console.error('Choose Image by Sound: Vocab not found for UID:', vocabUid.value);
      loading.value = false;
      return;
    }

    if (!vocabData.sounds?.length) {
      console.error('Choose Image by Sound: Vocab has no sounds', {
        uid: vocabData.uid,
        content: vocabData.content,
        hasSound: vocabData.hasSound
      });
      loading.value = false;
      return;
    }

    if (!vocabData.images?.length) {
      console.error('Choose Image by Sound: Vocab has no images', {
        uid: vocabData.uid,
        content: vocabData.content,
        hasImage: vocabData.hasImage
      });
      loading.value = false;
      return;
    }

    // Find a playable sound (not disableForPractice)
    const availableSound = vocabData.sounds.find(sound => !sound.disableForPractice);
    if (!availableSound) {
      console.error('Choose Image by Sound: Vocab has no playable sounds', {
        uid: vocabData.uid,
        content: vocabData.content,
        totalSounds: vocabData.sounds.length,
        disabledSounds: vocabData.sounds.filter(s => s.disableForPractice).length
      });
      loading.value = false;
      return;
    }

    vocab.value = vocabData;
    
    // Load vocab notes
    if (vocabData.notes && vocabData.notes.length > 0) {
      vocabNotes.value = await noteRepo.getNotesByUIDs(vocabData.notes);
    }

    // Setup sound (use playable sound) 
    playableSound.value = availableSound;

    await generateImageOptions();

  } catch (error) {
    console.error('Choose Image by Sound: Failed to load vocab data for UID:', vocabUid.value, error);
  } finally {
    loading.value = false;
  }
}

async function generateImageOptions() {
  if (!vocab.value || !vocab.value.images?.length) return;

  const options: ImageOption[] = [];

  // Add correct option (random image from vocab)
  const correctImage = vocab.value.images[Math.floor(Math.random() * vocab.value.images.length)];
  options.push({ image: correctImage, isCorrect: true });

  // Add distractor option (random image from another vocab in same language)
  try {
    const distractorVocab = await vocabRepo.getRandomVocabWithImages(
      vocab.value.language,
      vocab.value.uid
    );

    if (distractorVocab?.images?.length) {
      const distractorImage = distractorVocab.images[Math.floor(Math.random() * distractorVocab.images.length)];
      options.push({ image: distractorImage, isCorrect: false });
    }
  } catch (error) {
    console.error('Failed to get distractor image:', error);
  }

  // Shuffle the options
  imageOptions.value = options.sort(() => Math.random() - 0.5);
}


async function selectOption(index: number) {
  if (isAnswered.value) return;

  selectedIndex.value = index;
  const isCorrect = imageOptions.value[index].isCorrect;

  if (isCorrect) {
    isAnswered.value = true;
    await handleCompletion();
  } else {
    // Wrong answer: mark first attempt as wrong, disable button
    firstAttemptWrong.value = true;
  }
}

function getImageContainerClass(index: number): string {
  const isCorrect = imageOptions.value[index].isCorrect;
  const isSelected = index === selectedIndex.value;

  if (isCorrect && isSelected) {
    return 'ring-4 ring-success ring-offset-2';
  }

  if (!isCorrect && isSelected) {
    return 'ring-4 ring-error ring-offset-2';
  }

  if (isAnswered.value && isCorrect) {
    return 'ring-4 ring-success ring-offset-2';
  }

  if (isAnswered.value && !isCorrect) {
    return 'opacity-50 grayscale';
  }

  return 'ring-2 ring-base-300 hover:ring-primary';
}

function skipTask() {
  emit('finished');
}

const handleCompletion = async () => {
  if (!vocab.value) return;

  try {
    const rating = firstAttemptWrong.value ? Rating.Again : Rating.Good;
    const immediateDue = props.modeContext?.setWrongVocabDueAgainImmediately || false;
    await vocabRepo.scoreVocab(vocab.value.uid, rating, immediateDue);
    await vocabRepo.updateLastReview(vocab.value.uid);

    setTimeout(() => emit('finished'), 750);
  } catch (error) {
    console.error('Error scoring vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocabData);

</script>