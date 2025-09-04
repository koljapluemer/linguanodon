<template>
  <div class="space-y-6">
    <div class="text-center">
      <p class="text-lg text-base-content/70 mb-6">
        {{ vocabCount === 1 ? 'Record yourself saying a sentence using this word' : 'Record yourself saying a sentence using both words' }}
      </p>
      
      <!-- Recording Controls -->
      <div class="flex justify-center items-center gap-4 mb-6">
        <button
          v-if="!isRecording && !audioBlob"
          @click="startRecording"
          class="btn btn-primary btn-circle btn-lg"
          :disabled="!canRecord"
        >
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
        
        <button
          v-if="isRecording"
          @click="stopRecording"
          class="btn btn-error btn-circle btn-lg animate-pulse"
        >
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
        
        <div v-if="isRecording" class="text-error text-sm font-mono">
          {{ formatDuration(recordingDuration) }}
        </div>
      </div>
      
      <!-- Recording Status -->
      <div v-if="!canRecord" class="alert alert-warning text-sm max-w-md mx-auto mb-4">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Microphone access is required to record audio</span>
      </div>
      
      <!-- Playback Controls -->
      <div v-if="audioBlob" class="space-y-4">
        <div class="flex justify-center items-center gap-4">
          <button
            @click="togglePlayback"
            class="btn btn-circle btn-secondary"
          >
            <svg v-if="!isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          
          <span class="text-sm text-base-content/70">
            {{ formatDuration(Math.floor(audioDuration)) }}
          </span>
        </div>
        
        <div class="flex justify-center gap-4">
          <button
            @click="clearRecording"
            class="btn btn-ghost btn-sm"
          >
            Record Again
          </button>
        </div>
      </div>
    </div>
    
    <!-- Progress indicator when recording -->
    <div v-if="isRecording" class="text-center">
      <div class="radial-progress text-primary" :style="`--value:${Math.min(recordingDuration / 60 * 100, 100)}`">
        {{ Math.floor(recordingDuration) }}s
      </div>
      <p class="text-xs text-base-content/50 mt-2">Maximum 60 seconds</p>
    </div>
    
    <!-- Audio element for playback -->
    <audio
      ref="audioElement"
      @ended="handleAudioEnded"
      @loadedmetadata="handleAudioLoaded"
      class="hidden"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  vocabCount: number;
}

defineProps<Props>();

const emit = defineEmits<{
  recordingReady: [blob: Blob, duration: number];
}>();

// Recording state
const isRecording = ref(false);
const canRecord = ref(false);
const recordingDuration = ref(0);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordingTimer = ref<ReturnType<typeof setInterval> | null>(null);
const audioChunks = ref<Blob[]>([]);

// Playback state
const audioBlob = ref<Blob | null>(null);
const isPlaying = ref(false);
const audioDuration = ref(0);
const audioElement = ref<HTMLAudioElement>();
const objectUrl = ref<string | null>(null);

// Initialize microphone access
onMounted(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });
    
    canRecord.value = true;
    
    // Stop the stream for now, we'll restart when recording
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error('Failed to get microphone access:', error);
    canRecord.value = false;
  }
});

// Cleanup
onUnmounted(() => {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
  }
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
  }
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop();
  }
});

async function startRecording() {
  if (!canRecord.value) return;
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });
    
    audioChunks.value = [];
    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data);
      }
    };
    
    mediaRecorder.value.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      
      if (audioChunks.value.length > 0) {
        const blob = new Blob(audioChunks.value, { type: 'audio/webm;codecs=opus' });
        audioBlob.value = blob;
        
        // Calculate duration by creating a temporary audio element
        const duration = await getAudioDuration(blob);
        audioDuration.value = duration;
        
        emit('recordingReady', blob, duration);
      }
    };
    
    isRecording.value = true;
    recordingDuration.value = 0;
    mediaRecorder.value.start();
    
    // Start timer
    recordingTimer.value = setInterval(() => {
      recordingDuration.value += 1;
      
      // Auto-stop after 60 seconds
      if (recordingDuration.value >= 60) {
        stopRecording();
      }
    }, 1000);
    
  } catch (error) {
    console.error('Failed to start recording:', error);
  }
}

function stopRecording() {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop();
  }
  
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
    recordingTimer.value = null;
  }
  
  isRecording.value = false;
}

function clearRecording() {
  audioBlob.value = null;
  audioDuration.value = 0;
  recordingDuration.value = 0;
  
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = null;
  }
  
  if (isPlaying.value && audioElement.value) {
    audioElement.value.pause();
    isPlaying.value = false;
  }
}

function togglePlayback() {
  if (!audioBlob.value || !audioElement.value) return;
  
  if (isPlaying.value) {
    audioElement.value.pause();
    isPlaying.value = false;
  } else {
    if (!objectUrl.value) {
      objectUrl.value = URL.createObjectURL(audioBlob.value);
    }
    
    audioElement.value.src = objectUrl.value;
    audioElement.value.play();
    isPlaying.value = true;
  }
}

function handleAudioEnded() {
  isPlaying.value = false;
}

function handleAudioLoaded() {
  if (audioElement.value) {
    audioDuration.value = audioElement.value.duration;
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    });
    
    audio.addEventListener('error', () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
    
    audio.src = url;
  });
}
</script>