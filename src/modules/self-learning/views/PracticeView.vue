<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import type { Exercise, ExerciseFlashcard, ExerciseCloze, ExerciseFindTranslation } from '@/types/learning'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()

const parentGoal = computed(() => 
  store.goals.find(g => g._id === route.params.goalId)
)

const exercises = computed(() => {
  const subGoals = store.subGoals.filter(sg => sg.parentId === route.params.goalId)
  const units = store.unitsOfMeaning.filter(u => 
    subGoals.some(sg => sg._id === u.subGoalId)
  )
  return store.exercises.filter(e => 
    units.some(u => u._id === e.unitId) && !e.done
  )
})

const currentExercise = ref<Exercise | null>(null)
const showAnswer = ref(false)
const exerciseCount = ref(0)
const totalExercises = ref(5)

const handleNext = async () => {
  if (!currentExercise.value) return
  
  try {
    await store.markExerciseDone(currentExercise.value._id)
    exerciseCount.value++
    
    if (exerciseCount.value >= totalExercises.value) {
      router.push({ name: 'random-goal' })
    } else {
      const remainingExercises = exercises.value.filter(e => e._id !== currentExercise.value!._id)
      if (remainingExercises.length > 0) {
        currentExercise.value = remainingExercises[Math.floor(Math.random() * remainingExercises.length)]
        showAnswer.value = false
      } else {
        router.push({ name: 'random-goal' })
      }
    }
  } catch (error) {
    console.error('Failed to mark exercise as done:', error)
  }
}

const handleNotNow = () => {
  exerciseCount.value++
  
  if (exerciseCount.value >= totalExercises.value) {
    router.push({ name: 'random-goal' })
  } else {
    const remainingExercises = exercises.value.filter(e => e._id !== currentExercise.value!._id)
    if (remainingExercises.length > 0) {
      currentExercise.value = remainingExercises[Math.floor(Math.random() * remainingExercises.length)]
      showAnswer.value = false
    } else {
      router.push({ name: 'random-goal' })
    }
  }
}

const handleDelete = async () => {
  if (!currentExercise.value) return
  
  try {
    await store.deleteExercise(currentExercise.value._id)
    exerciseCount.value++
    
    if (exerciseCount.value >= totalExercises.value) {
      router.push({ name: 'random-goal' })
    } else {
      const remainingExercises = exercises.value.filter(e => e._id !== currentExercise.value!._id)
      if (remainingExercises.length > 0) {
        currentExercise.value = remainingExercises[Math.floor(Math.random() * remainingExercises.length)]
        showAnswer.value = false
      } else {
        router.push({ name: 'random-goal' })
      }
    }
  } catch (error) {
    console.error('Failed to delete exercise:', error)
  }
}

onMounted(() => {
  if (!parentGoal.value) {
    router.push({ name: 'goals' })
    return
  }
  
  if (exercises.value.length === 0) {
    router.push({ name: 'random-goal' })
    return
  }
  
  currentExercise.value = exercises.value[Math.floor(Math.random() * exercises.value.length)]
})
</script>

<template>
  <div class="practice-view">
    <div class="header">
      <div class="parent-info">
        <h2>Practice</h2>
        <div class="breadcrumb">
          <span>{{ parentGoal?.title }}</span>
        </div>
      </div>
      <div class="progress">
        <div class="progress-text">
          Exercise {{ exerciseCount + 1 }} of {{ totalExercises }}
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${((exerciseCount + 1) / totalExercises) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>
    
    <div v-if="currentExercise" class="exercise-card">
      <div class="exercise-content">
        <h3>{{ currentExercise.instruction }}</h3>
        
        <!-- Flashcard Exercise -->
        <div v-if="currentExercise.exerciseType === 'FLASHCARD'" class="flashcard">
          <div class="flashcard-front">
            {{ (currentExercise as ExerciseFlashcard).front }}
          </div>
          <div v-if="showAnswer" class="flashcard-back">
            {{ (currentExercise as ExerciseFlashcard).back }}
          </div>
        </div>
        
        <!-- Cloze Exercise -->
        <div v-else-if="currentExercise.exerciseType === 'CLOZE'" class="cloze">
          <div class="cloze-content">
            {{ (currentExercise as ExerciseCloze).content }}
          </div>
        </div>
        
        <!-- Find Translation Exercise -->
        <div v-else-if="currentExercise.exerciseType === 'FIND_TRANSLATION'" class="find-translation">
          <div class="target-language">
            {{ (currentExercise as ExerciseFindTranslation).targetLanguage }}
          </div>
          <div v-if="showAnswer" class="translation">
            {{ (currentExercise as ExerciseFindTranslation).translation }}
          </div>
        </div>
      </div>
      
      <div class="exercise-actions">
        <template v-if="currentExercise.exerciseType === 'FLASHCARD'">
          <button
            v-if="!showAnswer"
            @click="showAnswer = true"
            class="action-button reveal"
          >
            Reveal Answer
          </button>
          <button
            v-else
            @click="handleNext"
            class="action-button next"
          >
            Next Exercise
          </button>
        </template>
        
        <template v-else>
          <button
            v-if="!showAnswer"
            @click="showAnswer = true"
            class="action-button reveal"
          >
            Show Answer
          </button>
          <template v-else>
            <button @click="handleNext" class="action-button done">
              Done
            </button>
            <button @click="handleNotNow" class="action-button not-now">
              Not Now
            </button>
            <button @click="handleDelete" class="action-button delete">
              Delete
            </button>
          </template>
        </template>
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
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.progress-text {
  background: #e3f2fd;
  color: #1976D2;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: #e3f2fd;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1976D2;
  transition: width 0.3s ease;
}

.exercise-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.exercise-content {
  margin-bottom: 2rem;
}

.exercise-content h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1.1rem;
}

.flashcard {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.5rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flashcard-back {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
  color: #666;
}

.cloze {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.find-translation {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.target-language {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.translation {
  color: #666;
  font-size: 1.2rem;
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

.reveal {
  background: #2196F3;
  color: white;
}

.reveal:hover {
  background: #1976D2;
}

.next {
  background: #4CAF50;
  color: white;
}

.next:hover {
  background: #45a049;
}

.done {
  background: #4CAF50;
  color: white;
}

.done:hover {
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