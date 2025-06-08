<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import type { UnitOfMeaning, LearningGoal } from '@/types/learning'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()

const parentId = computed(() => route.params.subGoalId as string)
const parentGoal = computed(() => store.goals.find(g => g._id === parentId.value))

const parentTitle = computed(() => parentGoal.value?.title || '')

const units = computed(() => 
  store.unitsOfMeaning.filter(u => u.subGoalId === parentId.value)
)

const newUnit = ref({
  targetLanguage: '',
  translation: ''
})

const handleSubmit = async () => {
  if (!newUnit.value.targetLanguage && !newUnit.value.translation) return
  
  try {
    await store.createUnitOfMeaning({
      subGoalId: parentId.value,
      targetLanguage: newUnit.value.targetLanguage,
      translation: newUnit.value.translation,
      type: 'unit_of_meaning'
    })
    newUnit.value = { targetLanguage: '', translation: '' }
  } catch (error) {
    console.error('Failed to create unit of meaning:', error)
  }
}

const handleDelete = async (unitId: string) => {
  try {
    await store.deleteUnitOfMeaning(unitId)
  } catch (error) {
    console.error('Failed to delete unit of meaning:', error)
  }
}

onMounted(() => {
  if (!parentGoal.value) {
    router.push({ name: 'goals' })
  }
})
</script>

<template>
  <div class="units-view">
    <div class="header">
      <h2>Units of Meaning</h2>
      <p class="parent-title">for {{ parentTitle }}</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="unit-form">
      <div class="form-group">
        <label for="targetLanguage">Target Language (🇪🇬)</label>
        <input
          id="targetLanguage"
          v-model="newUnit.targetLanguage"
          type="text"
          placeholder="Enter target language text..."
        />
      </div>
      
      <div class="form-group">
        <label for="translation">Translation (🇬🇧)</label>
        <input
          id="translation"
          v-model="newUnit.translation"
          type="text"
          placeholder="Enter translation..."
        />
      </div>
      
      <p class="hint">Note: You can fill in either or both fields</p>
      
      <button type="submit" class="submit-button">Add Unit</button>
    </form>
    
    <div class="units-list">
      <div v-for="unit in units" :key="unit._id" class="unit-card">
        <div class="unit-content">
          <div v-if="unit.targetLanguage" class="target-language">
            <span class="flag">🇪🇬</span>
            {{ unit.targetLanguage }}
          </div>
          <div v-if="unit.translation" class="translation">
            <span class="flag">🇬🇧</span>
            {{ unit.translation }}
          </div>
        </div>
        <button @click="handleDelete(unit._id)" class="delete-button">
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
  margin-bottom: 2rem;
  text-align: center;
}

.parent-title {
  color: #666;
  margin-top: 0.5rem;
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

.hint {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
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
}

.target-language,
.translation {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.flag {
  margin-right: 0.5rem;
}

.delete-button {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-button:hover {
  background: #d32f2f;
}
</style> 