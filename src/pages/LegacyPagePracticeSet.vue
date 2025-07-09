<template>
  <div class="container mx-auto p-4">
    <PracticeSet :set-uid="setUid" />
  </div>
</template>

<script setup lang="ts">
import PracticeSet from '@/components/practice/set/PracticeSet.vue'

interface Props {
  setUid: string
}

defineProps<Props>()
</script>
