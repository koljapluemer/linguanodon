<template>
  <fieldset :class="fieldsetClasses">
    <legend v-if="legend" class="fieldset-legend">{{ legend }}</legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  legend?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
}>();

const fieldsetClasses = computed(() => [
  'fieldset bg-base-200 border-base-300 rounded-box border p-4',
  {
    'w-sm': props.size === 'sm',
    'w-md': props.size === 'md', 
    'w-lg': props.size === 'lg',
    'flex flex-wrap gap-4': props.layout === 'horizontal'
  }
]);
</script>

<style scoped>
@reference "tailwindcss";

.fieldset-legend {
  @apply text-lg font-semibold px-2;
}
</style>