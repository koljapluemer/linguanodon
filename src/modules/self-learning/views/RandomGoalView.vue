<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import type { LearningGoal } from '@/types/learning'

const router = useRouter()
const store = useLearningStore()

const selectedGoal = ref<LearningGoal | null>(null)
const showDeleteConfirm = ref(false)

// Get a random goal that has no parents (is a main goal)
const randomGoal = computed(() => {
  const mainGoals = store.goals.filter(g => !g.parentIds || g.parentIds.length === 0)
  if (mainGoals.length === 0) return null
  return mainGoals[Math.floor(Math.random() * mainGoals.length)]
})

const hasUnits = computed(() => {
  if (!selectedGoal.value) return false
  const units = store.unitsOfMeaning.filter(u => u.subGoalId === selectedGoal.value!._id)
  return units.length > 0
})

const handleEdit = () => {
  if (selectedGoal.value) {
    router.push({ 
      name: 'subgoals', 
      params: { goalId: selectedGoal.value._id } 
    })
  }
}

const handleDelete = async () => {
  if (!selectedGoal.value?._id) return
  
  try {
    // Delete all child goals first
    const childGoals = store.goals.filter(g => g.parentIds?.includes(selectedGoal.value!._id!))
    for (const childGoal of childGoals) {
      if (childGoal._id) {
        await store.deleteGoal(childGoal._id)
      }
    }
    
    // Delete all associated units and their exercises
    const units = store.unitsOfMeaning.filter(u => u.subGoalId === selectedGoal.value!._id)
    for (const unit of units) {
      if (unit._id) {
        const exercises = store.getExercisesForUnit(unit._id)
        for (const exercise of exercises) {
          if (exercise._id) {
            await store.deleteExercise(exercise._id)
          }
        }
        await store.deleteUnitOfMeaning(unit._id)
      }
    }
    
    // Delete the goal itself
    await store.deleteGoal(selectedGoal.value._id)
    selectedGoal.value = null
    showDeleteConfirm.value = false
  } catch (error) {
    console.error('Failed to delete goal:', error)
  }
}

const handlePractice = () => {
  if (selectedGoal.value) {
    router.push({ 
      name: 'practice', 
      params: { goalId: selectedGoal.value._id } 
    })
  }
}

const handleAddUnits = () => {
  if (selectedGoal.value) {
    router.push({ 
      name: 'units', 
      params: { subGoalId: selectedGoal.value._id } 
    })
  }
}

onMounted(() => {
  selectedGoal.value = randomGoal.value
})
</script>

<template>
  <div class="random-goal-view">
    <h2>Your Learning Goal</h2>
    
    <div v-if="selectedGoal" class="goal-card">
      <div class="goal-header">
        <h3>{{ selectedGoal.title }}</h3>
        <div class="goal-actions">
          <button @click="handleEdit" class="action-button edit">
            Edit Goal
          </button>
          <button @click="showDeleteConfirm = true" class="action-button delete">
            Delete Goal
          </button>
        </div>
      </div>
      
      <p class="goal-description">{{ selectedGoal.description }}</p>
      
      <div class="goal-options">
        <button
          v-if="hasUnits"
          @click="handlePractice"
          class="primary-button"
        >
          Practice
        </button>
        <button
          @click="handleAddUnits"
          class="primary-button"
        >
          Add Units of Meaning
        </button>
      </div>
    </div>
    
    <div v-else class="no-goals">
      <p>No learning goals available. Create one to get started!</p>
      <button @click="router.push({ name: 'goals' })" class="primary-button">
        Create Goal
      </button>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal">
        <h3>Delete Goal</h3>
        <p>Are you sure you want to delete this goal? This will also delete all associated subgoals, units, and exercises.</p>
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="cancel-button">
            Cancel
          </button>
          <button @click="handleDelete" class="delete-button">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.random-goal-view {
  max-width: 600px;
  margin: 0 auto;
}

.goal-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.goal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.goal-description {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.goal-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.primary-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.primary-button:hover {
  background: #45a049;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit {
  background: #2196F3;
  color: white;
}

.edit:hover {
  background: #1976D2;
}

.delete {
  background: #f44336;
  color: white;
}

.delete:hover {
  background: #d32f2f;
}

.no-goals {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  margin-top: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background: #757575;
}

.delete-button {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button:hover {
  background: #d32f2f;
}
</style> 