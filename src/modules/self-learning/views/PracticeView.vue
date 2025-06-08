<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import type { Exercise } from '@/types/learning'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()

const parentGoal = computed(() => 
  store.goals.find(g => g._id === route.params.goalId)
)

const exercises = computed(() => {
  // Get all child goals
  const childGoals = store.childGoals(route.params.goalId as string)
  const allGoalIds = [route.params.goalId as string, ...childGoals.map(g => g._id)]
  
  // Get all units for these goals
  const units = store.unitsOfMeaning.filter(u => 
    allGoalIds.includes(u.subGoalId)
  )
  
  // Get all exercises for these units
  return store.exercises.filter(e => 
    units.some(u => u._id === e.unitId)
  )
})

const currentExercise = ref<Exercise | null>(null)
const showAnswer = ref(false)
const exerciseCount = ref(0)
const totalExercises = computed(() => exercises.value.length)

const handleNext = async () => {
  if (!currentExercise.value?._id) return
  
  try {
    await store.markExerciseDone(currentExercise.value._id)
    exerciseCount.value++
    
    if (exerciseCount.value >= 5) {
      router.push({ name: 'random-goal' })
    } else {
      loadRandomExercise()
    }
  } catch (error) {
    console.error('Failed to mark exercise as done:', error)
  }
}

const handleNotNow = () => {
  exerciseCount.value++
  if (exerciseCount.value >= 5) {
    router.push({ name: 'random-goal' })
  } else {
    loadRandomExercise()
  }
}

const handleDelete = async () => {
  if (!currentExercise.value?._id) return
  
  try {
    await store.deleteExercise(currentExercise.value._id)
    loadRandomExercise()
  } catch (error) {
    console.error('Failed to delete exercise:', error)
  }
}

const loadRandomExercise = () => {
  const availableExercises = exercises.value.filter(e => !e.done)
  if (availableExercises.length === 0) {
    router.push({ name: 'random-goal' })
    return
  }
  
  const randomIndex = Math.floor(Math.random() * availableExercises.length)
  currentExercise.value = availableExercises[randomIndex]
  showAnswer.value = false
}

onMounted(() => {
  if (!parentGoal.value) {
    router.push({ name: 'goals' })
    return
  }
  
  loadRandomExercise()
})
</script>

<template>
  <div class="practice-view">
    <div class="progress">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${(exerciseCount / totalExercises) * 100}%` }"
        ></div>
      </div>
      <p class="progress-text">
        Exercise {{ exerciseCount + 1 }} of {{ totalExercises }}
      </p>
    </div>
    
    <div v-if="currentExercise" class="exercise-card">
      <div class="exercise-content">
        <h3>{{ currentExercise.instruction }}</h3>
        
        <div v-if="currentExercise.exerciseType === 'flashcard'" class="flashcard">
          <div class="front">
            {{ (currentExercise as any).front }}
          </div>
          <div v-if="showAnswer" class="back">
            {{ (currentExercise as any).back }}
          </div>
          <button 
            v-if="!showAnswer" 
            @click="showAnswer = true"
            class="reveal-button"
          >
            Reveal Answer
          </button>
        </div>
        
        <div v-else-if="currentExercise.exerciseType === 'cloze'" class="cloze">
          {{ (currentExercise as any).content }}
        </div>
        
        <div v-else-if="currentExercise.exerciseType === 'find_translation'" class="find-translation">
          <div v-if="(currentExercise as any).targetLanguage">
            Find the translation for: {{ (currentExercise as any).targetLanguage }}
          </div>
          <div v-else>
            Find the target language for: {{ (currentExercise as any).translation }}
          </div>
        </div>
      </div>
      
      <div class="exercise-actions">
        <button 
          v-if="showAnswer || currentExercise.exerciseType !== 'flashcard'"
          @click="handleNext"
          class="action-button next"
        >
          Next
        </button>
        <button 
          v-if="showAnswer || currentExercise.exerciseType !== 'flashcard'"
          @click="handleNotNow"
          class="action-button not-now"
        >
          Not Now
        </button>
        <button 
          @click="handleDelete"
          class="action-button delete"
        >
          Delete
        </button>
      </div>
    </div>
    
    <div v-else class="no-exercises">
      <p>No exercises available for this goal.</p>
      <button @click="router.push({ name: 'random-goal' })" class="back-button">
        Back to Goals
      </button>
    </div>
  </div>
</template>

<style scoped>
.practice-view {
  max-width: 600px;
  margin: 0 auto;
}

.progress {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: #666;
  margin: 0;
}

.exercise-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.exercise-content {
  margin-bottom: 2rem;
}

.exercise-content h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.flashcard {
  text-align: center;
}

.front,
.back {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.reveal-button {
  background: #2196F3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.reveal-button:hover {
  background: #1976D2;
}

.cloze {
  font-size: 1.2rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.find-translation {
  font-size: 1.2rem;
  line-height: 1.6;
}

.exercise-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.next {
  background: #4CAF50;
  color: white;
}

.next:hover {
  background: #45a049;
}

.not-now {
  background: #FFC107;
  color: #333;
}

.not-now:hover {
  background: #FFA000;
}

.delete {
  background: #f44336;
  color: white;
}

.delete:hover {
  background: #d32f2f;
}

.no-exercises {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.back-button:hover {
  background: #757575;
}
</style> 