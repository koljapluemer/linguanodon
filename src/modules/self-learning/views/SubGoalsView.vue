<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import type { LearningGoal } from '@/types/learning'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()

const parentGoal = computed(() => 
  store.goals.find(g => g._id === route.params.goalId)
)

const childGoals = computed(() => 
  store.childGoals(route.params.goalId as string)
)

const newGoal = ref({
  title: '',
  description: '',
  parentIds: [route.params.goalId as string]
})

const handleSubmit = async () => {
  if (!newGoal.value.title.trim()) return
  
  try {
    await store.createGoal({
      ...newGoal.value,
      type: 'learning_goal'
    })
    newGoal.value = {
      title: '',
      description: '',
      parentIds: [route.params.goalId as string]
    }
  } catch (error) {
    console.error('Failed to create goal:', error)
  }
}

const handleDelete = async (goal: LearningGoal) => {
  try {
    if (goal._id) {
      await store.deleteGoal(goal._id)
    }
  } catch (error) {
    console.error('Failed to delete goal:', error)
  }
}

const handleAddUnits = (goal: LearningGoal) => {
  if (goal._id) {
    router.push({ 
      name: 'units', 
      params: { subGoalId: goal._id } 
    })
  }
}

onMounted(() => {
  if (!parentGoal.value) {
    router.push({ name: 'goals' })
  }
})
</script>

<template>
  <div class="subgoals-view">
    <div class="header">
      <h2>Child Goals</h2>
      <p class="parent-title">for {{ parentGoal?.title }}</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="goal-form">
      <div class="form-group">
        <label for="title">New Child Goal Title</label>
        <input
          id="title"
          v-model="newGoal.title"
          type="text"
          placeholder="What do you want to learn?"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="description">Description (optional)</label>
        <textarea
          id="description"
          v-model="newGoal.description"
          placeholder="Add some details about your goal..."
          rows="3"
        />
      </div>
      
      <button type="submit" class="submit-button">Add Child Goal</button>
    </form>
    
    <div class="goals-list">
      <div v-for="goal in childGoals" :key="goal._id" class="goal-card">
        <div class="goal-header">
          <h3>{{ goal.title }}</h3>
          <div class="goal-actions">
            <button @click="handleAddUnits(goal)" class="action-button add-units">
              Add Units
            </button>
            <button @click="handleDelete(goal)" class="action-button delete">
              Delete
            </button>
          </div>
        </div>
        <p v-if="goal.description" class="goal-description">
          {{ goal.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subgoals-view {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.parent-title {
  color: #666;
  margin-top: 0.5rem;
}

.goal-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.submit-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
}

.submit-button:hover {
  background: #45a049;
}

.goals-list {
  display: grid;
  gap: 1rem;
}

.goal-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.goal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.goal-description {
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-units {
  background: #2196F3;
  color: white;
}

.add-units:hover {
  background: #1976D2;
}

.delete {
  background: #f44336;
  color: white;
}

.delete:hover {
  background: #d32f2f;
}
</style> 