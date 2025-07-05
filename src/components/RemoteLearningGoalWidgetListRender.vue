<template>
  <div>
    <div v-if="learningGoals.length === 0" class="text-center py-8 text-gray-500">
      No remote learning goals available for this language.
    </div>
    
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <RemoteLearningGoalWidgetController
        v-for="learningGoal in learningGoals"
        :key="learningGoal.uid"
        :learning-goal="learningGoal"
      />
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
