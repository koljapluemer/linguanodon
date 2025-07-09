<template>
  <tr>
    <td class="font-medium">{{ task.content }}</td>
    <td>{{ task.language.toUpperCase() }}</td>
    <td class="text-sm ">{{ task.unitsOfMeaning.length }}</td>
    <td class="text-sm ">{{ task.primaryUnitsOfMeaning.length }}</td>
    <td>
      <span 
        :class="task.isCompleted ? 'badge badge-success' : 'badge badge-warning'"
      >
        {{ task.isCompleted ? 'Completed' : 'In Progress' }}
      </span>
    </td>
    <td>
      <button 
        @click="startPractice"
        class="btn btn-primary btn-sm"
        :disabled="!canPractice"
      >
        Practice
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Task } from '@/entities/Task'

interface Props {
  task: Task
}

const props = defineProps<Props>()
const router = useRouter()

/**
 * Check if task can be practiced (has units of meaning)
 */
const canPractice = computed(() => 
  props.task.unitsOfMeaning.length > 0 || props.task.primaryUnitsOfMeaning.length > 0
)

/**
 * Navigate to practice page for this task
 */
function startPractice() {
  const taskId = encodeURIComponent(`${props.task.language}:${props.task.content}`)
  router.push(`/practice-task/${taskId}`)
}
</script> 