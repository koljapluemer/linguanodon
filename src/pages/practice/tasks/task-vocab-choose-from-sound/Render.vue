<template>
  <!-- Loading State -->
  <div v-if="loading" class="text-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <!-- Exercise Content -->
  <div v-else-if="vocab1 && vocab2 && playableSound" class="text-center">
    <!-- Skip button -->
    <div class="flex justify-end mb-4">
      <button @click="skipTask" class="btn btn-outline btn-sm">Skip Exercise</button>
    </div>

    <SoundPlayer :sound="playableSound" :auto-play="true" />

    <div class="flex flex-row gap-4 mx-auto justify-center my-6">
      <div v-for="(vocab, index) in shuffledVocabs" :key="vocab.uid" class="flex gap-2 flex-col ">
        <button :class="getButtonClass(index)" class="btn btn-lg" @click="selectOption(index)"
          :disabled="isButtonDisabled(index)">
          I hear {{ vocab.content }}
        </button>
        <VocabWithTranslationsDisplay :vocab-uid="vocab.uid" :repositories="repositories"
          :showAllNotesImmediately="true" />
      </div>
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
import type { VocabData, VocabSound } from '@/entities/vocab/VocabData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import SoundPlayer from '@/shared/ui/SoundPlayer.vue';
import VocabWithTranslationsDisplay from '@/features/display-vocab-with-translations/VocabWithTranslationsDisplay.vue';
import { Rating } from 'ts-fsrs';
import { shuffleArray, randomFromArray } from '@/shared/utils/arrayUtils';

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

// Exercise state
const selectedIndex = ref<number | null>(null);
const isAnswered = ref(false);
const firstAttemptWrong = ref(false);
const vocab1 = ref<VocabData | null>(null); // The vocab to be identified
const vocab2 = ref<VocabData | null>(null); // The related vocab (distractor)
const shuffledVocabs = ref<VocabData[]>([]);
const correctIndex = ref<number>(0);
const playableSound = ref<VocabSound | null>(null);
const loading = ref(true);

// Get the vocab ID from associated vocab
const vocabUid = computed(() => {
  return props.task.associatedVocab?.[0];
});

const correctVocab = computed(() => {
  return vocab1.value;
});

async function loadVocabData() {
  if (!vocabUid.value) {
    console.error('Choose from Sound: No vocab UID provided');
    loading.value = false;
    return;
  }

  try {
    const vocabData = await vocabRepo.getVocabByUID(vocabUid.value);
    if (!vocabData) {
      console.error('Choose from Sound: Vocab not found for UID:', vocabUid.value);
      loading.value = false;
      return;
    }

    // Must be a character and have sound
    if (vocabData.consideredCharacter !== true) {
      console.error('Choose from Sound: Vocab is not consideredCharacter', {
        uid: vocabData.uid,
        content: vocabData.content,
        consideredCharacter: vocabData.consideredCharacter
      });
      loading.value = false;
      return;
    }

    if (!vocabData.sounds?.length) {
      console.error('Choose from Sound: Vocab has no sounds', {
        uid: vocabData.uid,
        content: vocabData.content,
        hasSound: vocabData.hasSound
      });
      loading.value = false;
      return;
    }

    // Must have content
    if (!vocabData.content) {
      console.error('Choose from Sound: Vocab has no content', {
        uid: vocabData.uid
      });
      loading.value = false;
      return;
    }

    // Must have related vocab 
    if (!vocabData.relatedVocab?.length) {
      console.error('Choose from Sound: Vocab has no related vocab', {
        uid: vocabData.uid,
        content: vocabData.content,
        relatedVocabCount: vocabData.relatedVocab?.length || 0
      });
      loading.value = false;
      return;
    }

    vocab1.value = vocabData;

    // Find a playable sound (not disableForPractice)
    const availableSound = vocabData.sounds.find(sound => !sound.disableForPractice);
    if (!availableSound) {
      console.error('Choose from Sound: Vocab has no playable sounds', {
        uid: vocabData.uid,
        content: vocabData.content,
        totalSounds: vocabData.sounds.length,
        disabledSounds: vocabData.sounds.filter(s => s.disableForPractice).length
      });
      loading.value = false;
      return;
    }

    // Pick random sound from available sounds
    const randomSound = randomFromArray(vocabData.sounds.filter(s => !s.disableForPractice));
    playableSound.value = randomSound;

    // Find a related vocab that is also a character and has sound and content
    const relatedVocabList = await vocabRepo.getVocabByUIDs(vocabData.relatedVocab);
    const validRelatedVocab = relatedVocabList.filter(v =>
      v.consideredCharacter === true &&
      v.sounds && v.sounds.some(s => !s.disableForPractice) &&
      v.content
    );

    if (validRelatedVocab.length === 0) {
      console.error('Choose from Sound: No valid related vocab found', {
        uid: vocabData.uid,
        content: vocabData.content,
        totalRelated: relatedVocabList.length,
        validRelated: validRelatedVocab.length
      });
      loading.value = false;
      return;
    }

    // Pick random related vocab as distractor
    vocab2.value = randomFromArray(validRelatedVocab)!;

    // Shuffle the two vocabs and track correct index
    const vocabArray = [vocab1.value, vocab2.value];
    shuffledVocabs.value = shuffleArray(vocabArray);
    correctIndex.value = shuffledVocabs.value.findIndex(v => v.uid === vocab1.value!.uid);

  } catch (error) {
    console.error('Choose from Sound: Failed to load vocab data for UID:', vocabUid.value, error);
  } finally {
    loading.value = false;
  }
}

async function selectOption(index: number) {
  if (isAnswered.value) return;

  selectedIndex.value = index;
  const isCorrect = index === correctIndex.value;

  if (isCorrect) {
    isAnswered.value = true;
    await handleCompletion();
  } else {
    // Wrong answer: mark first attempt as wrong, disable button
    firstAttemptWrong.value = true;
  }
}

function getButtonClass(index: number): string {
  const isCorrect = index === correctIndex.value;
  const isSelected = index === selectedIndex.value;

  if (isCorrect && isSelected) {
    return 'btn-success';
  }

  if (!isCorrect && isSelected) {
    return 'btn-error';
  }

  if (isAnswered.value && isCorrect) {
    return 'btn-success';
  }

  if (isAnswered.value && !isCorrect) {
    return 'btn-outline opacity-50';
  }

  return 'btn-outline';
}

function isButtonDisabled(index: number): boolean {
  const isCorrect = index === correctIndex.value;
  const isSelected = index === selectedIndex.value;

  if (isAnswered.value) return true;
  if (!isCorrect && isSelected) return true;

  return false;
}

function skipTask() {
  emit('finished');
}

const handleCompletion = async () => {
  if (!vocab1.value) return;

  try {
    const rating = firstAttemptWrong.value ? Rating.Again : Rating.Good;
    const immediateDue = props.modeContext?.setWrongVocabDueAgainImmediately || false;
    await vocabRepo.scoreVocab(vocab1.value.uid, rating, immediateDue);
    await vocabRepo.updateLastReview(vocab1.value.uid);

    setTimeout(() => emit('finished'), 750);
  } catch (error) {
    console.error('Error scoring vocab:', error);
    emit('finished');
  }
};

onMounted(loadVocabData);
</script>