<template>
  <span>{{ displayText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

interface Props {
  vocabList: VocabData[];
  maxItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 8
});

const displayText = computed(() => {
  const vocabContents = props.vocabList
    .filter(vocab => vocab.content)
    .map(vocab => vocab.content!);
  
  const itemsToShow = vocabContents.slice(0, props.maxItems);
  const hasMore = vocabContents.length > props.maxItems;
  
  if (hasMore) {
    return `${itemsToShow.join(', ')}...`;
  }
  
  return itemsToShow.join(', ');
});
</script>