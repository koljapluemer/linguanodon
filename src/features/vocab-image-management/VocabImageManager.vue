<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Images</h3>
      <div class="form-control">
        <label class="label cursor-pointer gap-2">
          <span class="label-text">Can be visualized</span>
          <input 
            type="checkbox" 
            :checked="isPicturable !== false"
            @change="updatePicturable"
            class="toggle toggle-sm"
          />
        </label>
      </div>
    </div>
    
    <!-- Show why images are disabled -->
    <div v-if="isPicturable === false" class="alert alert-info">
      <span>This vocabulary is marked as non-picturable. Enable "Can be visualized" to add images.</span>
    </div>

    <!-- Current Images -->
    <div v-if="localImages && localImages.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="image in localImages" :key="image.uid" class="relative group">
        <div class="aspect-square bg-base-200 rounded-lg overflow-hidden border">
          <img 
            :src="getImageUrl(image)" 
            :alt="image.alt || 'Vocabulary image'"
            class="w-full h-full object-cover"
          />
        </div>
        
        <!-- Image overlay with actions -->
        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <div class="flex gap-2">
            <button 
              @click="replaceImage(image.uid)"
              class="btn btn-sm btn-primary"
              :disabled="loading || isPicturable === false"
            >
              Replace
            </button>
            <button 
              @click="removeImage(image.uid)"
              class="btn btn-sm btn-error"
              :disabled="loading"
            >
              Remove
            </button>
          </div>
        </div>
        
        <!-- Image info -->
        <div class="mt-2 text-xs text-base-content/60">
          {{ formatFileSize(image.fileSize) }}
          <span v-if="image.dimensions">
            • {{ image.dimensions.width }}×{{ image.dimensions.height }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add Image Section (only if picturable and vocab exists) -->
    <div v-if="isPicturable !== false && vocabId" class="card bg-base-200">
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
        <div v-if="mode === 'upload'" class="form-control">
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*"
            @change="handleFileUpload"
            :disabled="loading"
            class="file-input file-input-sm file-input-bordered"
          />
          <div class="label">
            <span class="label-text-alt">Images compressed to ~800×600px</span>
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

    <!-- Message for new vocab -->
    <div v-if="isPicturable !== false && !vocabId" class="alert alert-info">
      <span>Save the vocabulary first to add images</span>
    </div>

    <!-- Hidden file input for replace functionality -->
    <input 
      ref="replaceFileInput"
      type="file" 
      accept="image/*"
      @change="handleReplaceFile"
      class="hidden"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed, watch, onUnmounted } from 'vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { VocabImage } from '@/entities/vocab/vocab/VocabData';
import { formatFileSize } from '@/shared/imageUtils';

const props = defineProps<{
  vocabId?: string;
  images?: VocabImage[];
  isPicturable?: boolean;
}>();

const emit = defineEmits<{
  imagesChanged: [images: VocabImage[]];
  picturableChanged: [isPicturable: boolean];
}>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo');

// Local reactive state for images
const localImages = ref<VocabImage[]>([]);

// Watch props to sync initial state
watch(() => props.images, (newImages) => {
  localImages.value = [...(newImages || [])];
}, { immediate: true });

// State
const mode = ref<'url' | 'upload'>('url');
const imageUrl = ref('');
const loading = ref(false);
const loadingMessage = ref('');
const progress = ref(0);
const error = ref('');
const fileInput = ref<HTMLInputElement>();
const replaceFileInput = ref<HTMLInputElement>();
const replacingImageId = ref<string | null>(null);

// Track created URLs for cleanup
const createdUrls = new Set<string>();

// Get image URL for display
function getImageUrl(image: VocabImage): string {
  if (image.blob && image.blob instanceof Blob) {
    try {
      const url = URL.createObjectURL(image.blob);
      createdUrls.add(url);
      return url;
    } catch (error) {
      console.warn('Failed to create object URL for image blob:', error);
      return image.url || '';
    }
  }
  return image.url || '';
}

// Update picturable status
function updatePicturable(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  emit('picturableChanged', checked);
}

// Add image from URL
async function addFromUrl() {
  if (!imageUrl.value.trim() || !props.vocabId || !vocabRepo) return;
  
  loading.value = true;
  loadingMessage.value = 'Fetching image...';
  progress.value = 20;
  error.value = '';
  
  try {
    // Basic URL validation
    const url = new URL(imageUrl.value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Please use HTTP or HTTPS URLs');
    }
    
    progress.value = 40;
    loadingMessage.value = 'Compressing image...';
    
    await vocabRepo.addImageFromUrl(props.vocabId, imageUrl.value);
    
    // Reload the vocab to get the new image and update local state
    const updatedVocab = await vocabRepo.getVocabByUID(props.vocabId);
    if (updatedVocab?.images) {
      localImages.value = [...updatedVocab.images];
      emit('imagesChanged', [...localImages.value]);
    }
    
    progress.value = 100;
    imageUrl.value = '';
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add image';
  } finally {
    loading.value = false;
    progress.value = 0;
  }
}

// Handle file upload
async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !props.vocabId || !vocabRepo) return;
  
  await processFileUpload(file, false);
}

// Handle replace file
async function handleReplaceFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !props.vocabId || !vocabRepo || !replacingImageId.value) return;
  
  // Remove old image first
  await vocabRepo.removeImageFromVocab(props.vocabId, replacingImageId.value);
  
  // Add new image
  await processFileUpload(file, true);
  replacingImageId.value = null;
}

// Process file upload (shared logic)
async function processFileUpload(file: File, isReplace: boolean) {
  if (!props.vocabId || !vocabRepo) return;
  
  loading.value = true;
  loadingMessage.value = isReplace ? 'Replacing image...' : 'Processing image...';
  progress.value = 10;
  error.value = '';
  
  // Validate file
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file';
    loading.value = false;
    return;
  }
  
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    error.value = 'Image must be smaller than 50MB';
    loading.value = false;
    return;
  }
  
  try {
    progress.value = 30;
    loadingMessage.value = 'Compressing image...';
    
    await vocabRepo.addImageFromFile(props.vocabId, file);
    
    // Reload the vocab to get the new image and update local state
    const updatedVocab = await vocabRepo.getVocabByUID(props.vocabId);
    if (updatedVocab?.images) {
      localImages.value = [...updatedVocab.images];
      emit('imagesChanged', [...localImages.value]);
    }
    
    progress.value = 100;
    
    // Reset inputs
    if (fileInput.value) fileInput.value.value = '';
    if (replaceFileInput.value) replaceFileInput.value.value = '';
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to process image';
  } finally {
    loading.value = false;
    progress.value = 0;
  }
}

// Replace image
function replaceImage(imageId: string) {
  replacingImageId.value = imageId;
  replaceFileInput.value?.click();
}

// Remove image
async function removeImage(imageId: string) {
  if (!props.vocabId || !vocabRepo) return;
  
  try {
    // 1. Remove from database
    await vocabRepo.removeImageFromVocab(props.vocabId, imageId);
    
    // 2. Update local state immediately
    localImages.value = localImages.value.filter(img => img.uid !== imageId);
    
    // 3. Tell parent about the new image list
    emit('imagesChanged', [...localImages.value]);
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to remove image';
  }
}

// Cleanup URLs when component unmounts
onUnmounted(() => {
  createdUrls.forEach(url => {
    URL.revokeObjectURL(url);
  });
  createdUrls.clear();
});
</script>