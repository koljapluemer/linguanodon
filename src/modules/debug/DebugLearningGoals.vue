<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Debug: Learning Goals</h1>
    <button class="btn btn-error mb-4" @click="deleteAll">Delete All Learning Goals</button>
    <table class="table w-full">
      <thead>
        <tr>
          <th>UID</th>
          <th>Name</th>
          <th>Language</th>
          <th>Units of Meaning</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="goal in learningGoals" :key="goal.uid">
          <td>{{ goal.uid }}</td>
          <td>{{ goal.name }}</td>
          <td>{{ goal.language }}</td>
          <td>{{ goal.unitsOfMeaning.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/modules/db/db-local/accessLocalDB'
import type { LearningGoal } from '@/modules/learning-goals/types/LearningGoal'

const learningGoals = ref<LearningGoal[]>([])

async function loadGoals() {
  learningGoals.value = await db.learningGoals.toArray()
}

async function deleteAll() {
  await db.learningGoals.clear()
  await loadGoals()
}

onMounted(loadGoals)
</script>
