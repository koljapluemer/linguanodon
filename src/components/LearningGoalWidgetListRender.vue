<template>
  <div>
    <div v-if="learningGoals.length === 0" class="text-center py-8 text-gray-500">
      No goals yet
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <tbody>
          <LearningGoalWidgetRender
            v-for="learningGoal in learningGoals"
            :key="learningGoal.uid"
            :learning-goal="learningGoal"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LearningGoal } from '@/entities/LearningGoal'
import LearningGoalWidgetRender from './LearningGoalWidgetRender.vue'

interface Props {
  learningGoals: LearningGoal[]
}

defineProps<Props>()
</script>
