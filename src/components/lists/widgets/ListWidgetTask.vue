<template>
  <tr>
    <td class="font-medium">{{ task.content }}</td>
    <td>{{ task.language }}</td>
    <td class="text-sm ">{{ task.primaryUnitsOfMeaning.length }}</td>
    <td class="text-sm ">{{ task.primaryUnitsOfMeaning.length + (task.secondaryUnitsOfMeaning?.length || 0) }}</td>
    <td>
      <router-link
        :to="{ name: 'practice-task', params: { taskId: task.uid } }"
        class="btn btn-primary btn-sm"
        :class="{ 'btn-disabled': !canPractice }"
        :tabindex="canPractice ? 0 : -1"
        :aria-disabled="!canPractice"
      >
        Practice
      </router-link>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/entities/Task'

interface Props {
  task: Task
}

const props = defineProps<Props>()

/**
 * Check if task can be practiced (has units of meaning)
 */
const canPractice = computed(() => 
  props.task.primaryUnitsOfMeaning.length > 0 || (props.task.secondaryUnitsOfMeaning?.length || 0) > 0
)
</script> 