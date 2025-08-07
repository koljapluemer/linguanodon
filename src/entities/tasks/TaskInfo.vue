<template>
  <div class="space-y-4">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-2">{{ task.title }}</h2>
      <div class="text-base-content/70">
        <MarkdownRenderer :content="task.prompt" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from './Task';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';

interface Props {
  task: Task;
}

defineProps<Props>();
</script>