<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import type { SubGoal } from '@/types/learning'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()

const parentGoal = computed(() => 
  store.goals.find(g => g._id === route.params.goalId)
)

const subGoals = computed(() => 
  store.subGoals.filter(sg => sg.parentId === route.params.goalId)
)

const newSubGoal = ref({
  title: '',
  description: ''
})

const handleSubmit = async () => {
  if (!newSubGoal.value.title.trim()) return
  
  try {
    await store.createSubGoal({
      title: newSubGoal.value.title,
      description: newSubGoal.value.description,
      parentId: route.params.goalId as string,
      type: 'sub_goal'
    })
    newSubGoal.value = { title: '', description: '' }
  } catch (error) {
    console.error('Failed to create subgoal:', error)
  }
}

const handleDelete = async (subGoal: SubGoal) => {
  try {
    await store.deleteSubGoal(subGoal._id)
  } catch (error) {
    console.error('Failed to delete subgoal:', error)
  }
}

const handleAddUnits = (subGoal: SubGoal) => {
  router.push({ 
    name: 'units', 
    params: { subGoalId: subGoal._id } 
  })
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
      <div class="parent-goal">
        <h2>Subgoals for: {{ parentGoal?.title }}</h2>
        <p v-if="parentGoal?.description" class="parent-description">
          {{ parentGoal.description }}
        </p>
      </div>
      <button @click="router.push({ name: 'goals' })" class="back-button">
        Back to Goals
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="subgoal-form">
      <div class="form-group">
        <label for="title">New Subgoal Title</label>
        <input
          id="title"
          v-model="newSubGoal.title"
          type="text"
          placeholder="What specific aspect do you want to learn?"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="description">Description (optional)</label>
        <textarea
          id="description"
          v-model="newSubGoal.description"
          placeholder="Add some details about this subgoal..."
          rows="3"
        />
      </div>
      
      <button type="submit" class="submit-button">Add Subgoal</button>
    </form>
    
    <div class="subgoals-list">
      <div v-for="subGoal in subGoals" :key="subGoal._id" class="subgoal-card">
        <div class="subgoal-header">
          <h3>{{ subGoal.title }}</h3>
          <div class="subgoal-actions">
            <button @click="handleAddUnits(subGoal)" class="action-button add">
              Add Units
            </button>
            <button @click="handleDelete(subGoal)" class="action-button delete">
              Delete
            </button>
          </div>
        </div>
        <p v-if="subGoal.description" class="subgoal-description">
          {{ subGoal.description }}
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.parent-goal {
  flex: 1;
}

.parent-goal h2 {
  margin: 0 0 0.5rem 0;
}

.parent-description {
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.back-button {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 1rem;
}

.back-button:hover {
  background: #757575;
}

.subgoal-form {
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

.subgoals-list {
  display: grid;
  gap: 1rem;
}

.subgoal-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subgoal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.subgoal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.subgoal-actions {
  display: flex;
  gap: 0.5rem;
}

.subgoal-description {
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

.add {
  background: #2196F3;
  color: white;
}

.add:hover {
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