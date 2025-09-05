<script setup lang="ts">
import { ref } from 'vue';
import { Search } from 'lucide-vue-next';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import { useToast } from '@/shared/toasts';

interface Props {
  vocabRepo: VocabRepoContract;
}

const props = defineProps<Props>();

// Empty sound detection state
const detectingSounds = ref(false);
const emptyAudioResults = ref<{ uid: string; content: string; reason: string; soundIndex?: number; soundUid: string }[]>([]);
const analysisCompleted = ref(false);
const deletingEmptyAudio = ref(false);

// Empty sound detection utilities
async function getAudioDuration(audioBlob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(audioBlob);
  });
}

function isLikelyEmptyAudio(audioBlob: Blob): boolean {
  const minSizeThreshold = 1000; // bytes
  return audioBlob.size < minSizeThreshold;
}

async function isAudioTooShort(audioBlob: Blob, minDuration = 0.1): Promise<boolean> {
  const duration = await getAudioDuration(audioBlob);
  return duration < minDuration;
}

async function isAudioSilent(audioBlob: Blob, threshold = 0.001): Promise<boolean> {
  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    let rmsSum = 0;
    let sampleCount = 0;

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        rmsSum += channelData[i] * channelData[i];
        sampleCount++;
      }
    }

    const rms = Math.sqrt(rmsSum / sampleCount);
    return rms < threshold;
  } catch (error) {
    console.warn('Audio analysis failed:', error);
    return false;
  }
}

async function detectEmptyAudio(audioBlob: Blob): Promise<{ isEmpty: boolean; reason: string | null }> {
  // Quick checks first
  if (isLikelyEmptyAudio(audioBlob)) {
    return { isEmpty: true, reason: 'file_too_small' };
  }

  if (await isAudioTooShort(audioBlob)) {
    return { isEmpty: true, reason: 'duration_too_short' };
  }

  // Deep analysis
  try {
    const isSilent = await isAudioSilent(audioBlob);
    return { isEmpty: isSilent, reason: isSilent ? 'silent_audio' : null };
  } catch {
    return { isEmpty: false, reason: 'analysis_failed' };
  }
}

async function detectEmptySoundFiles() {
  const toast = useToast();

  detectingSounds.value = true;
  analysisCompleted.value = false;
  emptyAudioResults.value = [];

  try {
    // Get all vocab with sound
    const allVocab = await props.vocabRepo.getVocab();
    const vocabWithSound = allVocab.filter(v => v.hasSound && v.sounds?.some(s => s.blob));

    // Count total audio files
    const totalAudioFiles = vocabWithSound.reduce((count, v) => count + (v.sounds?.length || 0), 0);
    toast.info(`Analyzing ${totalAudioFiles} audio files from ${vocabWithSound.length} vocab items...`, { duration: 2000 });

    let emptyCount = 0;
    const results: { uid: string; content: string; reason: string; soundIndex?: number; soundUid: string }[] = [];

    for (const vocab of vocabWithSound) {
      if (vocab.sounds) {
        for (let i = 0; i < vocab.sounds.length; i++) {
          const sound = vocab.sounds[i];
          if (sound.blob) {
            const detection = await detectEmptyAudio(sound.blob);
            if (detection.isEmpty) {
              emptyCount++;
              results.push({
                uid: vocab.uid,
                content: vocab.content || '...',
                reason: detection.reason || 'unknown',
                soundIndex: vocab.sounds.length > 1 ? i : undefined,
                soundUid: sound.uid
              });
            }
          }
        }
      }
    }

    ;
    if (results.length > 0) {
      console.table(results);
    }

    // Store results for display
    emptyAudioResults.value = results;
    analysisCompleted.value = true;

    // Show toast with results
    if (emptyCount === 0) {
      toast.success(`No empty sound files found! All ${vocabWithSound.length} audio files are valid.`);
    } else {
      toast.warning(`Found ${emptyCount} empty sound files out of ${vocabWithSound.length} total.`,
        { duration: 6000 });
    }

  } catch (error) {
    console.error('Error detecting empty sound files:', error);
    toast.error('Error analyzing sound files.');
  } finally {
    detectingSounds.value = false;
  }
}

async function deleteEmptyAudio() {
  if (emptyAudioResults.value.length === 0) return;

  const toast = useToast();
  deletingEmptyAudio.value = true;

  try {
    let deletedCount = 0;

    for (const result of emptyAudioResults.value) {
      await props.vocabRepo.removeSoundFromVocab(result.uid, result.soundUid);
      deletedCount++;
    }

    toast.success(`Deleted ${deletedCount} empty sound files.`);

    // Clear results after deletion
    emptyAudioResults.value = [];
    analysisCompleted.value = false;

  } catch (error) {
    console.error('Error deleting empty sound files:', error);
    toast.error('Error deleting empty sound files.');
  } finally {
    deletingEmptyAudio.value = false;
  }
}
</script>

<template>
  <h3>Audio Analysis</h3>
  <p class=" text-light mb-4">
    Detect empty or silent audio files in your vocabulary collection.
  </p>

  <div class="flex gap-2">
    <button @click="detectEmptySoundFiles" :disabled="detectingSounds" class="btn btn-outline btn-sm w-fit">
      <Search class="w-4 h-4 mr-2" />
      <span v-if="detectingSounds" class="loading loading-spinner loading-xs mr-2"></span>
      {{ detectingSounds ? 'Analyzing Audio Files...' : 'Detect Empty Sound Files' }}
    </button>

    <button @click="deleteEmptyAudio"
      :disabled="!analysisCompleted || emptyAudioResults.length === 0 || deletingEmptyAudio"
      class="btn btn-error btn-sm w-fit">
      <span v-if="deletingEmptyAudio" class="loading loading-spinner loading-xs mr-2"></span>
      {{ deletingEmptyAudio ? 'Deleting...' : `Delete ${emptyAudioResults.length} Empty Audio Files` }}
    </button>
  </div>

  <!-- Results Details -->
  <div v-if="analysisCompleted && emptyAudioResults.length > 0" class="mt-4">
    <details class="collapse collapse-plus bg-base-200">
      <summary class="collapse-title  font-medium">
        View {{ emptyAudioResults.length }} vocabulary items with broken audio
      </summary>
      <div class="collapse-content">
        <ul class="list-disc list-inside space-y-1  mt-2">
          <li v-for="result in emptyAudioResults" :key="result.uid">
            <router-link
              :to="{ name: 'vocab-list', query: { search: result.content !== '...' ? result.content : result.uid } }"
              class="link link-primary hover:link-hover">
              {{ result.content }}
            </router-link>
            <span class="text-base-content/60 ml-2 text-xs">({{ result.reason.replace('_', ' ') }})</span>
          </li>
        </ul>
      </div>
    </details>
  </div>
</template>