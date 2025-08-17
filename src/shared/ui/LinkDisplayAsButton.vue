<script setup lang="ts">
import { computed } from 'vue';
import { ExternalLink } from 'lucide-vue-next';
import type { Link } from '@/shared/Link';

interface Props {
  link: Link;
}

const props = defineProps<Props>();

const displayText = computed(() => props.link.label || props.link.url);
</script>

<template>
    <a
      :href="link.url" 
      target="_blank" 
      rel="noopener noreferrer"
      class="btn btn-primary btn-lg"
    >
      {{ displayText }}
      <ExternalLink :size="14" />
    </a>
    
</template>