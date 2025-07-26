<script setup lang="ts">
interface Props {
  isExtraBig?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isExtraBig: false
});
</script>

<template>
  <div :class="props.isExtraBig ? 'text-4xl font-bold' : 'text-2xl font-semibold'">
    <slot />
  </div>
</template>
