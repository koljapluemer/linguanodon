<template>
  <div>
    <ListRenderTasks
      :tasks="tasks"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/repositories/pinia/taskStore'
import ListRenderTasks from '@/components/lists/render/ListRenderTasks.vue'
import type { Task } from '@/entities/Task'

const taskStore = useTaskStore()

const tasks = computed<Task[]>(() => taskStore.getAllTasks())
</script> 