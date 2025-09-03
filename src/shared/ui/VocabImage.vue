<template>
  <div class="aspect-square bg-base-200 rounded-lg overflow-hidden border">
    <img 
      :src="imageUrl" 
      :alt="image.alt || 'Vocabulary image'"
      class="w-full h-full object-cover"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import type { VocabImage } from '@/entities/vocab/VocabData';

const props = defineProps<{
  image: VocabImage;
}>();

// Track created URLs for cleanup
const createdUrl = ref<string | null>(null);

// Get image URL for display
const imageUrl = computed(() => {
  if (props.image.blob && props.image.blob instanceof Blob) {
    try {
      if (createdUrl.value) {
        URL.revokeObjectURL(createdUrl.value);
      }
      const url = URL.createObjectURL(props.image.blob);
      createdUrl.value = url;
      return url;
    } catch (error) {
      console.warn('Failed to create object URL for image blob:', error);
      return props.image.url || '';
    }
  }
  return props.image.url || '';
});

// Cleanup URLs when component unmounts
onUnmounted(() => {
  if (createdUrl.value) {
    URL.revokeObjectURL(createdUrl.value);
  }
});
</script>