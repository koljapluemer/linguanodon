<template>
  <div class="space-y-4">
    <h3>{{ $t('media.images.title') }}</h3>

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
              {{ $t('media.images.replace') }}
            </button>
            <button 
              @click="removeImage(image.uid)"
              class="btn btn-sm btn-error"
              :disabled="loading"
            >
              {{ $t('media.images.remove') }}
            </button>
          </div>
        </div>
        
        <!-- Image info -->
        <div class="mt-2 text-xs text-base-content/60">
          {{ formatFileSize(image.fileSize) }}
          <span v-if="image.dimensions">
            {{ $t('media.images.bullet') }} {{ image.dimensions.width }}{{ $t('media.images.times') }}{{ image.dimensions.height }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add Image Section -->
    <div v-if="isPicturable !== false" class="card shadow">
      <div class="card-body p-4">
        <div class="tabs tabs-boxed tabs-sm mb-4">
          <button 
            class="tab tab-sm" 
            :class="{ 'tab-active': mode === 'url' }"
            @click="mode = 'url'"
          >
            {{ $t('media.images.url') }}
          </button>
          <button 
            class="tab tab-sm" 
            :class="{ 'tab-active': mode === 'upload' }"
            @click="mode = 'upload'"
          >
            {{ $t('media.images.upload') }}
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
            <span v-else>{{ $t('media.images.add') }}</span>
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
            <span class="label-text-alt">{{ $t('media.images.compression') }}</span>
          </div>
        </div>

        <!-- Loading/Error States -->
        <div v-if="loading" class="mt-2">
          <div class="flex items-center gap-2 ">
            <span class="loading loading-spinner loading-xs"></span>
            <span>{{ loadingMessage }}</span>
          </div>
          <progress class="progress progress-primary w-full mt-1" :value="progress" max="100"></progress>
        </div>

        <div v-if="error" class="alert alert-error alert-sm mt-2">
          <span class="text-xs">{{ error }}</span>
          <button class="btn btn-xs btn-outline" @click="error = ''">
            {{ $t('media.images.close') }}
          </button>
        </div>
      </div>
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
import { ref, watch, onUnmounted } from 'vue';
import type { VocabImage } from '@/entities/vocab/VocabData';
import { formatFileSize } from '@/shared/utils/fileUtils';

const props = defineProps<{
  images?: VocabImage[];
  isPicturable?: boolean;
}>();

const emit = defineEmits<{
  imagesChanged: [images: VocabImage[]];
}>();

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


// Add image from URL
async function addFromUrl() {
  if (!imageUrl.value.trim()) return;
  
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
    
    // Fetch and compress the image locally
    const { compressImageFromUrl } = await import('@/shared/utils/imageUtils');
    const compressedBlob = await compressImageFromUrl(imageUrl.value, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8,
      format: 'jpeg'
    });
    
    const vocabImage: VocabImage = {
      uid: crypto.randomUUID(),
      url: imageUrl.value,
      blob: compressedBlob,
      alt: undefined,
      addedAt: new Date(),
      fileSize: compressedBlob.size,
      mimeType: compressedBlob.type,
      compressed: true
    };
    
    localImages.value = [...localImages.value, vocabImage];
    emit('imagesChanged', [...localImages.value]);
    
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
  if (!file) return;
  
  loading.value = true;
  loadingMessage.value = 'Processing image...';
  progress.value = 10;
  error.value = '';
  
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('Image must be smaller than 50MB');
    }
    
    progress.value = 30;
    loadingMessage.value = 'Compressing image...';
    
    // Compress the image locally
    const { compressImage } = await import('@/shared/utils/imageUtils');
    const compressedBlob = await compressImage(file, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8,
      format: 'jpeg'
    });
    
    const vocabImage: VocabImage = {
      uid: crypto.randomUUID(),
      blob: compressedBlob,
      alt: file.name,
      addedAt: new Date(),
      fileSize: compressedBlob.size,
      mimeType: compressedBlob.type,
      originalFileName: file.name,
      compressed: true
    };
    
    localImages.value = [...localImages.value, vocabImage];
    emit('imagesChanged', [...localImages.value]);
    
    progress.value = 100;
    
    // Reset input
    if (fileInput.value) fileInput.value.value = '';
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to process image';
  } finally {
    loading.value = false;
    progress.value = 0;
  }
}

// Handle replace file
async function handleReplaceFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !replacingImageId.value) return;
  
  loading.value = true;
  loadingMessage.value = 'Replacing image...';
  progress.value = 10;
  error.value = '';
  
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('Image must be smaller than 50MB');
    }
    
    progress.value = 30;
    loadingMessage.value = 'Compressing image...';
    
    // Compress the image locally
    const { compressImage } = await import('@/shared/utils/imageUtils');
    const compressedBlob = await compressImage(file, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8,
      format: 'jpeg'
    });
    
    const newVocabImage: VocabImage = {
      uid: crypto.randomUUID(),
      blob: compressedBlob,
      alt: file.name,
      addedAt: new Date(),
      fileSize: compressedBlob.size,
      mimeType: compressedBlob.type,
      originalFileName: file.name,
      compressed: true
    };
    
    // Replace the image in local state
    const index = localImages.value.findIndex(img => img.uid === replacingImageId.value);
    if (index >= 0) {
      localImages.value[index] = newVocabImage;
      emit('imagesChanged', [...localImages.value]);
    }
    
    progress.value = 100;
    replacingImageId.value = null;
    
    // Reset input
    if (replaceFileInput.value) replaceFileInput.value.value = '';
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to replace image';
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
function removeImage(imageId: string) {
  // Remove from local state
  localImages.value = localImages.value.filter(img => img.uid !== imageId);
  
  // Tell parent about the new image list
  emit('imagesChanged', [...localImages.value]);
}

// Cleanup URLs when component unmounts
onUnmounted(() => {
  createdUrls.forEach(url => {
    URL.revokeObjectURL(url);
  });
  createdUrls.clear();
});
</script>