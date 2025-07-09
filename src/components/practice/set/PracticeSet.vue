<template>
  <div v-if="error" class="text-center py-8">
    <div class="alert alert-error max-w-md mx-auto">
      <span>{{ error }}</span>
    </div>
    <button @click="goBack" class="btn btn-primary mt-4">
      Back to Sets
    </button>
  </div>
  
  <div v-else-if="!exercises.length" class="text-center py-8">
    <div class="alert alert-warning max-w-md mx-auto">
      <span>No exercises available for this set.</span>
    </div>
    <button @click="goBack" class="btn btn-primary mt-4">
      Back to Sets
    </button>
  </div>
  
  <div v-else>
    <!-- Progress bar -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm">Progress</span>
        <span class="text-sm">{{ currentExerciseIndex + 1 }} / {{ exercises.length }}</span>
      </div>
      <progress 
        class="progress progress-primary w-full" 
        :value="currentExerciseIndex + 1" 
        :max="exercises.length"
      ></progress>
    </div>
    
    <!-- Current exercise -->
    <ExerciseFlashcardControl
      :exercise="currentExercise"
      @score="handleScore"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSetStore } from '@/stores/setStore'
import { useToastsStore } from '@/components/ui/toasts/useToasts'
import ExerciseFlashcardControl from '@/components/practice/exercise/ExerciseFlashcardControl.vue'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'
import { useExerciseStore } from '@/stores/exerciseStore'
import { Rating } from 'ts-fsrs'

interface Props {
  setUid: string
}

const props = defineProps<Props>()

const router = useRouter()
const setStore = useSetStore()
const toastsStore = useToastsStore()
const exerciseStore = useExerciseStore()

const exercises = ref<ExerciseFlashcard[]>([])
const currentExerciseIndex = ref(0)
const error = ref<string>('')

const currentExercise = computed(() => 
  exercises.value[currentExerciseIndex.value]
)

/**
 * Initializes exercises for the set
 */
function initializeExercises() {
  const set = setStore.getSetByUid(props.setUid)
  if (!set) {
    error.value = 'Set not found'
    return
  }
  
  // For now, we'll show an error since we don't have the units linked to sets yet
  // This would need to be implemented based on how sets relate to units
  error.value = 'Practice functionality not yet implemented for downloaded sets'
}

/**
 * Handles exercise scoring and progression
 */
function handleScore(exercise: ExerciseFlashcard, rating: Rating) {
  exerciseStore.recordExerciseRating(exercise, rating)
  
  // Move to next exercise or complete
  if (currentExerciseIndex.value < exercises.value.length - 1) {
    currentExerciseIndex.value++
  } else {
    // Practice session completed
    toastsStore.addToast({
      type: 'success',
      message: 'Practice session completed! Great job!'
    })
    goBack()
  }
}

/**
 * Navigates back to sets list
 */
function goBack() {
  router.push('/remote-sets')
}

onMounted(() => {
  initializeExercises()
})
</script>
