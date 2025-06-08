<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import type { LearningGoal } from '@/types/learning'

const router = useRouter()
const store = useLearningStore()

const newGoal = ref({
  title: '',
  description: ''
})

const handleSubmit = async () => {
  if (!newGoal.value.title.trim()) return
  
  try {
    await store.createGoal({
      title: newGoal.value.title,
      description: newGoal.value.description,
      type: 'learning_goal'
    })
    newGoal.value = { title: '', description: '' }
  } catch (error) {
    console.error('Failed to create goal:', error)
  }
}

const handleEdit = (goal: LearningGoal) => {
  router.push({ 
    name: 'subgoals', 
    params: { goalId: goal._id } 
  })
}

const handleDelete = async (goal: LearningGoal) => {
  try {
    await store.deleteGoal(goal._id)
  } catch (error) {
    console.error('Failed to delete goal:', error)
  }
}
</script>

<template>
  <div class="goals-view">
    <div class="header">
      <h2>Learning Goals</h2>
      <button @click="router.push({ name: 'random-goal' })" class="random-button">
        Practice Random Goal
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="goal-form">
      <div class="form-group">
        <label for="title">New Goal Title</label>
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
      
      <button type="submit" class="submit-button">Add Goal</button>
    </form>
    
    <div class="goals-list">
      <div v-for="goal in store.goals" :key="goal._id" class="goal-card">
        <div class="goal-header">
          <h3>{{ goal.title }}</h3>
          <div class="goal-actions">
            <button @click="handleEdit(goal)" class="action-button edit">
              Edit
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
.goals-view {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.random-button {
  background: #2196F3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.random-button:hover {
  background: #1976D2;
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
</style> 