<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { toRaw } from 'vue';
import type { TaskData } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';

interface Props {
  task: TaskData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const vocab = ref<VocabData | null>(null);
const pronunciation = ref('');

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  
  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  vocab.value = vocabData || null;
};

const handleDone = async () => {
  if (!vocab.value || !pronunciation.value.trim()) return;
  
  try {
    // Add pronunciation to vocab
    await vocabRepo.addPronunciationToVocab(vocab.value.uid, pronunciation.value.trim());
    
    emit('finished');
  } catch (error) {
    console.error('Error saving pronunciation:', error);
    emit('finished');
  }
};

const handleSkip = async () => {
  if (!vocab.value) return;
  
  try {
    // Set due 10 minutes into the future
    const updatedVocab = {
      ...vocab.value,
      progress: {
        ...vocab.value.progress,
        due: new Date(Date.now() + 10 * 60 * 1000)
      }
    };
    await vocabRepo.updateVocab(toRaw(updatedVocab));
    
    emit('finished');
  } catch (error) {
    console.error('Error skipping pronunciation:', error);
    emit('finished');
  }
};

const handleSkipAndDisable = async () => {
  if (!vocab.value) return;
  
  try {
    // Set notInterestedInPronunciation to true
    const updatedVocab = {
      ...vocab.value,
      notInterestedInPronunciation: true
    };
    await vocabRepo.updateVocab(toRaw(updatedVocab));
    
    emit('finished');
  } catch (error) {
    console.error('Error disabling pronunciation:', error);
    emit('finished');
  }
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <h2 class="text-2xl font-bold mb-4">{{ vocab.content }}</h2>
    
    <input 
      v-model="pronunciation"
      type="text" 
      placeholder="Enter pronunciation..."
      class="input input-bordered w-full mb-6"
    />
    
    <div class="flex gap-2">
      <button @click="handleSkip" class="btn btn-outline">Skip</button>
      <button @click="handleSkipAndDisable" class="btn btn-outline">Skip & Disable</button>
      <button @click="handleDone" :disabled="!pronunciation.trim()" class="btn btn-primary">Done</button>
    </div>
  </div>
  
  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>