<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Audio</h3>

    <!-- Current Sound -->
    <div v-if="localSound" class="card bg-base-200">
      <div class="card-body p-4">
        <div class="flex items-center gap-4">
          <!-- Play/Pause Button -->
          <button 
            @click="togglePlayback"
            class="btn btn-circle btn-primary"
            :disabled="loading"
          >
            <svg v-if="!isPlaying" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>

          <!-- Audio Info -->
          <div class="flex-1">
            <div class="text-sm font-medium">
              {{ localSound.originalFileName || 'Audio file' }}
            </div>
            <div class="text-xs text-base-content/60 flex gap-4">
              <span>{{ formatFileSize(localSound.fileSize) }}</span>
              <span v-if="localSound.duration">{{ formatAudioDuration(localSound.duration) }}</span>
              <span>{{ localSound.mimeType.split('/')[1].toUpperCase() }}</span>
            </div>
          </div>

          <!-- Remove Button -->
          <button 
            @click="removeSound"
            class="btn btn-sm btn-error btn-outline"
            :disabled="loading"
          >
            Remove
          </button>
        </div>

        <!-- Audio Progress Bar (when playing) -->
        <div v-if="isPlaying && audioElement && localSound.duration" class="mt-3">
          <div class="flex items-center gap-2 text-xs text-base-content/60">
            <span>{{ formatAudioDuration(currentTime) }}</span>
            <progress 
              class="progress progress-primary flex-1" 
              :value="currentTime" 
              :max="localSound.duration"
            ></progress>
            <span>{{ formatAudioDuration(localSound.duration) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Sound Section -->
    <div v-if="!localSound" class="card bg-base-200">
      <div class="card-body p-4">
        <div class="tabs tabs-boxed tabs-sm mb-4">
          <button 
            class="tab tab-sm" 
            :class="{ 'tab-active': mode === 'url' }"
            @click="mode = 'url'"
          >
            URL
          </button>
          <button 
            class="tab tab-sm" 
            :class="{ 'tab-active': mode === 'upload' }"
            @click="mode = 'upload'"
          >
            Upload
          </button>
        </div>

        <!-- URL Input -->
        <div v-if="mode === 'url'" class="flex gap-2">
          <input 
            v-model="soundUrl"
            @keyup.enter="addFromUrl"
            placeholder="https://example.com/audio.mp3"
            class="input input-sm input-bordered flex-1"
            :disabled="loading"
          />
          <button 
            @click="addFromUrl"
            :disabled="!soundUrl.trim() || loading"
            class="btn btn-sm btn-primary"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <span v-else>Add</span>
          </button>
        </div>

        <!-- File Upload -->
        <div v-if="mode === 'upload'" class="form-control">
          <input 
            ref="fileInput"
            type="file" 
            accept="audio/*"
            @change="handleFileUpload"
            :disabled="loading"
            class="file-input file-input-sm file-input-bordered"
          />
          <div class="label">
            <span class="label-text-alt">Supported: MP3, WAV, M4A, OGG, WebM, AAC (max 10MB)</span>
          </div>
        </div>

        <!-- Loading/Error States -->
        <div v-if="loading" class="mt-2">
          <div class="flex items-center gap-2 text-sm">
            <span class="loading loading-spinner loading-xs"></span>
            <span>{{ loadingMessage }}</span>
          </div>
          <progress class="progress progress-primary w-full mt-1" :value="progress" max="100"></progress>
        </div>

        <div v-if="error" class="alert alert-error alert-sm mt-2">
          <span class="text-xs">{{ error }}</span>
          <button class="btn btn-xs btn-outline" @click="error = ''">
            ×
          </button>
        </div>
      </div>
    </div>


    <!-- Hidden audio element for playback -->
    <audio 
      ref="audioElement"
      @ended="handleAudioEnded"
      @timeupdate="handleTimeUpdate"
      class="hidden"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import type { VocabSound } from '@/entities/vocab/vocab/VocabData';
import { formatAudioDuration } from '@/shared/audioUtils';
import { formatFileSize } from '@/shared/fileUtils';

const props = defineProps<{
  sound?: VocabSound;
}>();

const emit = defineEmits<{
  soundChanged: [sound: VocabSound | undefined];
}>();

// Local reactive state for sound
const localSound = ref<VocabSound | undefined>();

// Watch props to sync initial state
watch(() => props.sound, (newSound) => {
  localSound.value = newSound ? { ...newSound } : undefined;
}, { immediate: true });

// State
const mode = ref<'url' | 'upload'>('url');
const soundUrl = ref('');
const loading = ref(false);
const loadingMessage = ref('');
const progress = ref(0);
const error = ref('');
const fileInput = ref<HTMLInputElement>();

// Audio playback state
const audioElement = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const currentTime = ref(0);
const createdUrl = ref<string | null>(null);

// Get audio URL for playback
function getAudioUrl(sound: VocabSound): string {
  if (createdUrl.value) {
    URL.revokeObjectURL(createdUrl.value);
  }
  
  try {
    const url = URL.createObjectURL(sound.blob);
    createdUrl.value = url;
    return url;
  } catch (error) {
    console.warn('Failed to create object URL for audio blob:', error);
    return '';
  }
}

// Toggle audio playback
function togglePlayback() {
  if (!localSound.value || !audioElement.value) return;
  
  if (isPlaying.value) {
    audioElement.value.pause();
    isPlaying.value = false;
  } else {
    const url = getAudioUrl(localSound.value);
    if (url) {
      audioElement.value.src = url;
      audioElement.value.play();
      isPlaying.value = true;
    }
  }
}

// Handle audio ended
function handleAudioEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
}

// Handle time update
function handleTimeUpdate() {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
  }
}

// Add sound from URL
async function addFromUrl() {
  if (!soundUrl.value.trim()) return;
  
  loading.value = true;
  loadingMessage.value = 'Fetching audio...';
  progress.value = 20;
  error.value = '';
  
  try {
    // Basic URL validation
    const url = new URL(soundUrl.value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Please use HTTP or HTTPS URLs');
    }
    
    progress.value = 40;
    loadingMessage.value = 'Processing audio...';
    
    // Fetch and process audio locally
    const { fetchAudioAsBlob, validateAudioFile, getAudioDuration } = await import('@/shared/audioUtils');
    const blob = await fetchAudioAsBlob(soundUrl.value);
    
    // Validate the fetched blob
    const file = new File([blob], 'audio', { type: blob.type });
    const validationError = validateAudioFile(file);
    if (validationError) {
      throw new Error(validationError);
    }
    
    // Get audio duration
    const duration = await getAudioDuration(blob);
    
    const vocabSound: VocabSound = {
      uid: crypto.randomUUID(),
      blob: blob,
      addedAt: new Date(),
      fileSize: blob.size,
      mimeType: blob.type,
      duration: duration,
      originalFileName: undefined
    };
    
    localSound.value = vocabSound;
    emit('soundChanged', vocabSound);
    
    progress.value = 100;
    soundUrl.value = '';
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add audio';
  } finally {
    loading.value = false;
    progress.value = 0;
  }
}

// Handle file upload
async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  loading.value = true;
  loadingMessage.value = 'Processing audio...';
  progress.value = 10;
  error.value = '';
  
  try {
    // Validate the audio file
    const { validateAudioFile, getAudioDuration } = await import('@/shared/audioUtils');
    const validationError = validateAudioFile(file);
    if (validationError) {
      throw new Error(validationError);
    }
    
    progress.value = 30;
    loadingMessage.value = 'Analyzing audio...';
    
    // Get audio duration
    const duration = await getAudioDuration(file);
    
    const vocabSound: VocabSound = {
      uid: crypto.randomUUID(),
      blob: file, // Store the file as a blob directly
      addedAt: new Date(),
      fileSize: file.size,
      mimeType: file.type,
      duration: duration,
      originalFileName: file.name
    };
    
    localSound.value = vocabSound;
    emit('soundChanged', vocabSound);
    
    progress.value = 100;
    
    // Reset input
    if (fileInput.value) fileInput.value.value = '';
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to process audio';
  } finally {
    loading.value = false;
    progress.value = 0;
  }
}

// Remove sound
function removeSound() {
  // Stop playback if playing
  if (isPlaying.value && audioElement.value) {
    audioElement.value.pause();
    isPlaying.value = false;
    currentTime.value = 0;
  }
  
  // Update local state
  localSound.value = undefined;
  
  // Tell parent about the change
  emit('soundChanged', undefined);
}

// Cleanup URLs when component unmounts
onUnmounted(() => {
  if (createdUrl.value) {
    URL.revokeObjectURL(createdUrl.value);
  }
  
  // Stop audio if playing
  if (isPlaying.value && audioElement.value) {
    audioElement.value.pause();
  }
});
</script>