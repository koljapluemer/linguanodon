<script setup lang="ts">
import { onMounted } from 'vue'
import { useLearningGoals } from './useLearningGoals'
import { useRouter } from 'vue-router'

interface LearningGoal {
  id: number;
  name: string;
}

const router = useRouter()
const {
  goals,
  loading,
  error,
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  loadGoals,
  nextPage,
  previousPage
} = useLearningGoals()

function goToLearningGoal(id: number) {
  router.push(`/debug/learning-goals/${id}`)
}

onMounted(() => {
  loadGoals()
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
    
    <div v-else>
      <div class="goals-list">
        <div 
          v-for="goal in goals" 
          :key="goal.id" 
          class="goal-item"
          @click="goToLearningGoal(goal.id)"
        >
          {{ goal.name }}
        </div>
      </div>

      <div class="pagination">
        <button 
          :disabled="!hasPreviousPage" 
          @click="() => previousPage()"
          class="pagination-button"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          :disabled="!hasNextPage" 
          @click="() => nextPage()"
          class="pagination-button"
        >
          Next
        </button>
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
  margin-bottom: 20px;
}

.goal-item {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.goal-item:hover {
  background-color: #f0f0f0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pagination-button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background: #f0f0f0;
}

.page-info {
  font-size: 0.9em;
  color: #666;
}
</style>
