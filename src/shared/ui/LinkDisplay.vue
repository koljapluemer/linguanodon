<script setup lang="ts">
import { computed } from 'vue';
import { ExternalLink } from 'lucide-vue-next';

interface Props {
  url: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: ''
});

const displayText = computed(() => props.label || props.url);
</script>

<template>
  <a 
    :href="url" 
    target="_blank" 
    rel="noopener noreferrer"
    class="link link-primary inline-flex items-center gap-1 hover:link-hover"
  >
    {{ displayText }}
    <ExternalLink :size="14" />
  </a>
</template>