<template>
  <div class="container mx-auto p-4">
    <PracticeTaskControl :task-id="taskId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PracticeTaskControl from '@/components/practice/task/PracticeTaskControl.vue'

const route = useRoute()

/**
 * Extract task ID from route params
 */
const taskId = computed(() => {
  const id = route.params.taskId as string
  return decodeURIComponent(id)
})
</script>
