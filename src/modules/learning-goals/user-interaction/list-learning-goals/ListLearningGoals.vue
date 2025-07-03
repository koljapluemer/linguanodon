<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Learning Goals</h1>
    <LearningGoalList :goals="learningGoals" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/modules/db/db-local/accessLocalDB'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'
import LearningGoalList from './LearningGoalList.vue'

const learningGoals = ref<LearningGoal[]>([])

/**
 * Loads all learning goals from the DB for display.
 */
async function loadData() {
  learningGoals.value = await db.learningGoals.toArray()
}

onMounted(loadData)
</script>
