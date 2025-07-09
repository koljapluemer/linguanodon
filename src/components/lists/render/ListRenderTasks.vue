<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Content</th>
          <th>Language</th>
          <th>Units of Meaning</th>
          <th>Primary Units</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <ListWidgetTask
          v-for="task in tasks"
          :key="`${task.language}_${task.content}`"
          :task="task"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import ListWidgetTask from '@/components/lists/widgets/ListWidgetTask.vue'
import type { Task } from '@/entities/Task'

interface Props {
  tasks: Task[]
}

defineProps<Props>()
</script> 