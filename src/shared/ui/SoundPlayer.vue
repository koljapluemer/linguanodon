<template>
  <div class="flex flex-col items-center gap-4">
    <button @click="playSound" :disabled="!audioUrl || isPlaying" class="btn btn-circle btn-xl btn-primary">
      <Play v-if="!isPlaying" class="w-10 h-10" />
      <span v-else class="loading loading-spinner loading-lg"></span>
    </button>

    <div class="flex flex-col items-center gap-2">
      <div class="font-medium">{{ $t('media.audio.volume') }}</div>
      <input type="range" min="0" max="1" step="0.1" v-model="volume" @input="updateVolume"
        class="range range-primary w-32" />
      <div class="text-xs text-base-content/60">{{ Math.round(volume * 100) }}{{ $t('resources.percent') }}</div>
    </div>

    <!-- Hidden audio element -->
    <audio ref="audioElement" @loadeddata="onAudioLoaded" @ended="onAudioEnded" @error="onAudioError" />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';
import { Play } from 'lucide-vue-next';
import type { VocabSound } from '@/entities/vocab/VocabData';

interface Props {
  sound: VocabSound | null;
  autoPlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: false
});

// Audio state
const audioElement = ref<HTMLAudioElement>();
const audioUrl = ref<string | null>(null);
const isPlaying = ref(false);
const volume = ref(0.7);

// Create audio URL from sound blob
const createAudioUrl = (sound: VocabSound | null) => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }
  
  if (sound?.blob) {
    audioUrl.value = URL.createObjectURL(sound.blob);
  }
};

function playSound() {
  if (!audioElement.value || !audioUrl.value || isPlaying.value) return;

  audioElement.value.src = audioUrl.value;
  audioElement.value.volume = volume.value;
  isPlaying.value = true;
  audioElement.value.play().catch(error => {
    console.error('Failed to play audio:', error);
    isPlaying.value = false;
  });
}

function updateVolume() {
  if (audioElement.value) {
    audioElement.value.volume = volume.value;
  }
}

function onAudioLoaded() {
  // Audio is ready
}

function onAudioEnded() {
  isPlaying.value = false;
}

function onAudioError(error: Event) {
  console.error('Audio error:', error);
  isPlaying.value = false;
}

// Watch for sound changes
watch(() => props.sound, (newSound) => {
  createAudioUrl(newSound);
  
  // Auto-play if enabled and we have a new sound
  if (props.autoPlay && newSound) {
    setTimeout(() => {
      playSound();
    }, 500);
  }
}, { immediate: true });

onUnmounted(() => {
  // Cleanup audio URL
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});

// Expose playSound method for external use
defineExpose({
  playSound
});
</script>