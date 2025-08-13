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
  <div class="inline-flex items-center gap-2 flex-wrap">
    <a 
      :href="link.url" 
      target="_blank" 
      rel="noopener noreferrer"
      class="link link-primary inline-flex items-center gap-1 hover:link-hover"
    >
      {{ displayText }}
      <ExternalLink :size="14" />
    </a>
    
    <!-- Owner badge -->
    <div v-if="link.owner" class="badge badge-outline badge-sm">
      <a 
        v-if="link.ownerLink" 
        :href="link.ownerLink"
        target="_blank"
        rel="noopener noreferrer"
        class="link link-hover"
      >
        {{ link.owner }}
      </a>
      <span v-else>{{ link.owner }}</span>
    </div>
    
    <!-- License badge -->
    <div v-if="link.license" class="badge badge-outline badge-sm">
      {{ link.license }}
    </div>
  </div>
</template>