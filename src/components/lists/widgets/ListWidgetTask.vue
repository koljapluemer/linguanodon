<template>
  <tr>
    <td class="font-medium">{{ task.content }}</td>
    <td>{{ task.language.toUpperCase() }}</td>
    <td class="text-sm text-gray-600">{{ task.unitsOfMeaning.length }}</td>
    <td class="text-sm text-gray-600">{{ task.primaryUnitsOfMeaning.length }}</td>
    <td>
      <span 
        :class="task.isCompleted ? 'badge badge-success' : 'badge badge-warning'"
      >
        {{ task.isCompleted ? 'Completed' : 'In Progress' }}
      </span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Task } from '@/entities/Task'

interface Props {
  task: Task
}

defineProps<Props>()
</script> 