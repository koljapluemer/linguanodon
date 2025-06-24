<template>
  <span class="tag is-info is-light">{{ name }}</span>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>
