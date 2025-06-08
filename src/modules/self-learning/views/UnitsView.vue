<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import type { UnitOfMeaning } from '@/types/learning'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()

const parentSubGoal = computed(() => 
  store.subGoals.find(sg => sg._id === route.params.subGoalId)
)

const parentGoal = computed(() => 
  parentSubGoal.value ? store.goals.find(g => g._id === parentSubGoal.value!.parentId) : null
)

const units = computed(() => 
  store.unitsOfMeaning.filter(u => u.subGoalId === route.params.subGoalId)
)

const newUnit = ref({
  targetLanguage: '',
  translation: ''
})

const handleSubmit = async () => {
  if (!newUnit.value.targetLanguage.trim() && !newUnit.value.translation.trim()) return
  
  try {
    await store.createUnitOfMeaning({
      targetLanguage: newUnit.value.targetLanguage,
      translation: newUnit.value.translation,
      subGoalId: route.params.subGoalId as string,
      type: 'unit_of_meaning'
    })
    newUnit.value = { targetLanguage: '', translation: '' }
  } catch (error) {
    console.error('Failed to create unit of meaning:', error)
  }
}

const handleDelete = async (unit: UnitOfMeaning) => {
  try {
    await store.deleteUnitOfMeaning(unit._id)
  } catch (error) {
    console.error('Failed to delete unit of meaning:', error)
  }
}

onMounted(() => {
  if (!parentSubGoal.value) {
    router.push({ name: 'goals' })
  }
})
</script>

<template>
  <div class="units-view">
    <div class="header">
      <div class="parent-info">
        <h2>Learning Units</h2>
        <div class="breadcrumb">
          <span>{{ parentGoal?.title }}</span>
          <span class="separator">›</span>
          <span>{{ parentSubGoal?.title }}</span>
        </div>
      </div>
      <button @click="router.push({ name: 'subgoals', params: { goalId: parentGoal?._id } })" class="back-button">
        Back to Subgoals
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="unit-form">
      <div class="form-group">
        <label for="targetLanguage">Target Language (🇪🇬)</label>
        <input
          id="targetLanguage"
          v-model="newUnit.targetLanguage"
          type="text"
          placeholder="Enter word or phrase in target language"
        />
      </div>
      
      <div class="form-group">
        <label for="translation">Translation (🇬🇧)</label>
        <input
          id="translation"
          v-model="newUnit.translation"
          type="text"
          placeholder="Enter translation in your language"
        />
      </div>
      
      <p class="form-hint">
        Note: You can fill in either or both fields. Each field will generate appropriate exercises.
      </p>
      
      <button type="submit" class="submit-button">Add Unit</button>
    </form>
    
    <div class="units-list">
      <div v-for="unit in units" :key="unit._id" class="unit-card">
        <div class="unit-content">
          <div class="unit-field">
            <span class="flag">🇪🇬</span>
            <span class="text">{{ unit.targetLanguage }}</span>
          </div>
          <div class="unit-field">
            <span class="flag">🇬🇧</span>
            <span class="text">{{ unit.translation }}</span>
          </div>
        </div>
        <button @click="handleDelete(unit)" class="delete-button">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.units-view {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.parent-info {
  flex: 1;
}

.parent-info h2 {
  margin: 0 0 0.5rem 0;
}

.breadcrumb {
  color: #666;
  font-size: 0.9rem;
}

.separator {
  margin: 0 0.5rem;
  color: #999;
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

.unit-form {
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-hint {
  color: #666;
  font-size: 0.9rem;
  margin: 1rem 0;
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

.units-list {
  display: grid;
  gap: 1rem;
}

.unit-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.unit-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flag {
  font-size: 1.2rem;
}

.text {
  color: #333;
}

.delete-button {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 1rem;
}

.delete-button:hover {
  background: #d32f2f;
}
</style> 