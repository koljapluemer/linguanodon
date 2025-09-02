<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';

interface Props {
  task: Task;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;
const vocab = ref<VocabData | null>(null);
const translations = ref<string[]>([]);

// Image upload state
const mode = ref<'url' | 'upload'>('url');
const imageUrl = ref('');
const loading = ref(false);
const error = ref('');
const fileInput = ref<HTMLInputElement>();

const isSentence = computed(() => {
  return vocab.value?.length === 'sentence';
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

// Add image from URL
const addFromUrl = async () => {
  if (!imageUrl.value.trim() || !vocab.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const url = new URL(imageUrl.value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Please use HTTP or HTTPS URLs');
    }
    
    await vocabRepo.addImageFromUrl(vocab.value.uid, imageUrl.value);
    emit('finished');
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add image';
    loading.value = false;
  }
};

// Handle file upload
const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !vocab.value) return;
  
  loading.value = true;
  error.value = '';
  
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file';
    loading.value = false;
    return;
  }
  
  if (file.size > 50 * 1024 * 1024) {
    error.value = 'Image must be smaller than 50MB';
    loading.value = false;
    return;
  }
  
  try {
    await vocabRepo.addImageFromFile(vocab.value.uid, file);
    emit('finished');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add image';
    loading.value = false;
  }
};

const handleSkip = async () => {
  emit('finished');
};

const handleNotPicturable = async () => {
  if (!vocab.value) return;
  
  try {
    await vocabRepo.markVocabNotPicturable(vocab.value.uid);
    emit('finished');
  } catch (err) {
    console.error('Error marking vocab as not picturable:', err);
    emit('finished');
  }
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <div class="text-center mb-8">
      <div :class="isSentence ? 'text-3xl' : 'text-6xl'" class="font-bold mb-6">{{ vocab.content }}</div>
      <div class="divider mb-6"></div>
      <div :class="isSentence ? 'text-xl' : 'text-2xl'" class="text-base-content/70 mb-8">
        {{ translations.join(', ') }}
      </div>
      
      <!-- Upload Section -->
      <div class="max-w-md mx-auto mb-6">
        <div class="tabs tabs-boxed tabs-sm mb-4 justify-center">
          <button 
            class="tab tab-sm" 
            :class="{ 'tab-active': mode === 'url' }"
            @click="mode = 'url'"
            :disabled="loading"
          >
            URL
          </button>
          <button 
            class="tab tab-sm" 
            :class="{ 'tab-active': mode === 'upload' }"
            @click="mode = 'upload'"
            :disabled="loading"
          >
            Upload
          </button>
        </div>

        <!-- URL Input -->
        <div v-if="mode === 'url'" class="flex gap-2 mb-4">
          <input 
            v-model="imageUrl"
            @keyup.enter="addFromUrl"
            placeholder="https://example.com/image.jpg"
            class="input input-sm input-bordered flex-1"
            :disabled="loading"
          />
          <button 
            @click="addFromUrl"
            :disabled="!imageUrl.trim() || loading"
            class="btn btn-sm btn-primary"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <span v-else>Add</span>
          </button>
        </div>

        <!-- File Upload -->
        <div v-if="mode === 'upload'" class="mb-4">
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*"
            @change="handleFileUpload"
            :disabled="loading"
            class="file-input file-input-sm file-input-bordered w-full"
          />
          <div class="text-xs text-base-content/60 mt-1">
            Images compressed to ~800×600px
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="alert alert-error alert-sm mb-4">
          <span class="text-xs">{{ error }}</span>
          <button class="btn btn-xs btn-outline" @click="error = ''">
            ×
          </button>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="flex justify-center gap-4">
      <button @click="handleSkip" class="btn btn-ghost" :disabled="loading">
        Skip for Now
      </button>
      <button @click="handleNotPicturable" class="btn btn-outline" :disabled="loading">
        Cannot Be Visualized
      </button>
    </div>
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>