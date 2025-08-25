<script setup lang="ts">
import { computed } from 'vue';
import { ExternalLink, Edit } from 'lucide-vue-next';
import type { Link } from '@/shared/links/Link';

interface Props {
  link: Link;
  showEditButton?: boolean;
}

interface Emits {
  (e: 'edit'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const displayText = computed(() => {
  if (!props.link.url && !props.link.label) return '(Empty link)';
  return props.link.label || props.link.url;
});
</script>

<template>
  <div class="flex items-center gap-2">
    <a
      :href="link.url" 
      target="_blank" 
      rel="noopener noreferrer"
      class="btn btn-primary btn-lg"
    >
      {{ displayText }}
      <ExternalLink :size="14" />
    </a>
    
    <button
      v-if="showEditButton"
      type="button"
      @click="$emit('edit')"
      class="btn btn-sm btn-ghost"
    >
      <Edit class="w-4 h-4" />
    </button>
  </div>
</template>