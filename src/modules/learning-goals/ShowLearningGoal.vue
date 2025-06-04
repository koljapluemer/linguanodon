<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUnitsOfMeaningForLearningGoal } from '../units-of-meaning/getUnitsOfMeaningForLearningGoal'

interface UnitOfMeaning {
  id: number;
  name: string;
}

const route = useRoute()
const units = ref<UnitOfMeaning[]>([])
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(1)

async function loadUnits() {
  const learningGoalId = Number(route.params.id)
  if (isNaN(learningGoalId)) {
    error.value = 'Invalid learning goal ID'
    loading.value = false
    return
  }

  try {
    const response = await getUnitsOfMeaningForLearningGoal(learningGoalId, currentPage.value)
    units.value = response.data
    totalPages.value = response.pagination.total_pages
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load units of meaning'
  } finally {
    loading.value = false
  }
}

async function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await loadUnits()
  }
}

async function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    await loadUnits()
  }
}

onMounted(() => {
  loadUnits()
})
</script>

<template>
  <div class="learning-goal-detail">
    <h1>Learning Goal #{{ route.params.id }}</h1>
    
    <div v-if="loading" class="loading">
      Loading...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else>
      <div class="units-list">
        <h2>Units of Meaning</h2>
        <div v-for="unit in units" :key="unit.id" class="unit-item">
          {{ unit.name }}
        </div>
      </div>

      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="previousPage"
          class="pagination-button"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          :disabled="currentPage === totalPages" 
          @click="nextPage"
          class="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.learning-goal-detail {
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
}

.error {
  color: red;
}

.units-list {
  margin: 20px 0;
}

.unit-item {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
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
