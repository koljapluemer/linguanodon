<template>
  <table class="table table-zebra w-full">
    <tbody>
      <tr v-for="goal in goals" :key="goal.uid">
        <td class="text-lg font-semibold">{{ goal.name }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'

defineProps<{ goals: LearningGoal[] }>()
</script>
