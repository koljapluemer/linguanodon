<template>
  <div class="max-w-2xl mx-auto">
    <!-- Task content -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title">Task</h2>
        <div class="text-lg p-4 bg-base-200 rounded-lg">
          {{ task.content }}
        </div>
      </div>
    </div>

    <!-- Evaluation form -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">How did you do?</h2>
        
        <!-- Ease scale -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">How difficult was this task?</span>
          </label>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Very Difficult</span>
            <div class="flex gap-4">
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="ease" 
                  :value="1" 
                  v-model="ease"
                  class="radio radio-primary"
                />
                <span class="text-sm">1</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="ease" 
                  :value="2" 
                  v-model="ease"
                  class="radio radio-primary"
                />
                <span class="text-sm">2</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="ease" 
                  :value="3" 
                  v-model="ease"
                  class="radio radio-primary"
                />
                <span class="text-sm">3</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="ease" 
                  :value="4" 
                  v-model="ease"
                  class="radio radio-primary"
                />
                <span class="text-sm">4</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="ease" 
                  :value="5" 
                  v-model="ease"
                  class="radio radio-primary"
                />
                <span class="text-sm">5</span>
              </label>
            </div>
            <span class="text-sm text-gray-600">Very Easy</span>
          </div>
        </div>

        <!-- Correctness scale -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">How correct was your answer?</span>
          </label>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Not Correct at All</span>
            <div class="flex gap-4">
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correctness" 
                  :value="1" 
                  v-model="correctness"
                  class="radio radio-primary"
                />
                <span class="text-sm">1</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correctness" 
                  :value="2" 
                  v-model="correctness"
                  class="radio radio-primary"
                />
                <span class="text-sm">2</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correctness" 
                  :value="3" 
                  v-model="correctness"
                  class="radio radio-primary"
                />
                <span class="text-sm">3</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correctness" 
                  :value="4" 
                  v-model="correctness"
                  class="radio radio-primary"
                />
                <span class="text-sm">4</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correctness" 
                  :value="5" 
                  v-model="correctness"
                  class="radio radio-primary"
                />
                <span class="text-sm">5</span>
              </label>
            </div>
            <span class="text-sm text-gray-600">Entirely Correct</span>
          </div>
        </div>

        <!-- Submit button -->
        <div class="card-actions justify-end">
          <button 
            @click="submitForm"
            :disabled="!isFormValid"
            class="btn btn-primary"
          >
            Complete Practice
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '@/entities/Task'

interface Props {
  task: Task
}

interface Emits {
  (e: 'submit', ease: number, correctness: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const ease = ref<number>(0)
const correctness = ref<number>(0)

/**
 * Check if form is valid (both scales selected)
 */
const isFormValid = computed(() => 
  ease.value > 0 && correctness.value > 0
)

/**
 * Submit the form
 */
function submitForm() {
  if (isFormValid.value) {
    emit('submit', ease.value, correctness.value)
  }
}
</script>
