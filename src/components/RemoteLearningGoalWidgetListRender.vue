<template>
  <div>
    <div v-if="learningGoals.length === 0" class="text-center py-8 text-gray-500">
      No remote learning goals available for this language.
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra w-full">

        <tbody>
          <RemoteLearningGoalWidgetController
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
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'
import RemoteLearningGoalWidgetController from './RemoteLearningGoalWidgetController.vue'

interface Props {
  learningGoals: LearningGoalSummary[]
}

defineProps<Props>()
</script>
