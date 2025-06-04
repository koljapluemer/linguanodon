<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLearningGoalsForLanguage } from '../backend/api'

interface LearningGoal {
  id: number;
  name: string;
}

const learningGoals = ref<LearningGoal[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await getLearningGoalsForLanguage()
    learningGoals.value = response.data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load learning goals'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="learning-goals">
    <h1>Learning Goals for Egyptian Arabic</h1>
    
    <div v-if="loading" class="loading">
      Loading...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="goals-list">
      <div v-for="goal in learningGoals" :key="goal.id" class="goal-item">
        {{ goal.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.learning-goals {
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
}

.error {
  color: red;
}

.goals-list {
  display: grid;
  gap: 10px;
}

.goal-item {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
