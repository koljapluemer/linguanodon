<script setup lang="ts">
import { ref, computed } from 'vue';
export interface TaskEvaluation {
  correctnessRating: number; // 1-5 range slider
  difficultyRating: number;  // 1-5 range slider
  wantToDoAgain: 'no' | 'yes' | 'maybe';
}

interface Props {
  showDifficultyRating?: boolean;
  showDoAgainDecision?: boolean;
}

interface Emits {
  (e: 'finished', evaluation: TaskEvaluation): void;
}

const props = withDefaults(defineProps<Props>(), {
  showDifficultyRating: true,
  showDoAgainDecision: true,
});

const emit = defineEmits<Emits>();

const correctnessRating = ref<number | null>(null);
const difficultyRating = ref<number | null>(null);
const wantToDoAgain = ref<'no' | 'yes' | 'maybe' | null>(null);

const isFormValid = computed(() => {
  const correctnessValid = !props.showDifficultyRating || correctnessRating.value !== null;
  const difficultyValid = !props.showDifficultyRating || difficultyRating.value !== null;
  const doAgainValid = !props.showDoAgainDecision || wantToDoAgain.value !== null;
  
  return correctnessValid && difficultyValid && doAgainValid;
});

const handleSubmit = () => {
  if (!isFormValid.value) return;
  
  const evaluation: TaskEvaluation = {
    correctnessRating: correctnessRating.value || 0,
    difficultyRating: difficultyRating.value || 0,
    wantToDoAgain: wantToDoAgain.value || 'maybe'
  };
  
  emit('finished', evaluation);
};
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-bold mb-2">How was that task?</h3>
      <p class="text-base-content/70">Please rate your experience</p>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body space-y-6">
        <!-- Correctness Rating -->
        <div v-if="showDifficultyRating" class="form-control">
          <label class="label">
            <span class="label-text">How well did you do?</span>
            <span class="label-text-alt">{{ correctnessRating ?? '?' }}/5</span>
          </label>
          <input 
            v-model.number="correctnessRating"
            type="range" 
            min="1" 
            max="5" 
            class="range range-primary" 
          />
          <div class="w-full flex justify-between text-xs px-2">
            <span>Poor</span>
            <span>Perfect</span>
          </div>
        </div>

        <!-- Difficulty Rating -->
        <div v-if="showDifficultyRating" class="form-control">
          <label class="label">
            <span class="label-text">How difficult was it?</span>
            <span class="label-text-alt">{{ difficultyRating ?? '?' }}/5</span>
          </label>
          <input 
            v-model.number="difficultyRating"
            type="range" 
            min="1" 
            max="5" 
            class="range range-secondary" 
          />
          <div class="w-full flex justify-between text-xs px-2">
            <span>Easy</span>
            <span>Very Hard</span>
          </div>
        </div>

        <!-- Want to do again -->
        <div v-if="showDoAgainDecision" class="form-control">
          <label class="label">
            <span class="label-text">Do this task again in the future?</span>
          </label>
          <div class="flex gap-2 justify-center">
            <button 
              class="btn btn-sm"
              :class="{ 'btn-error': wantToDoAgain === 'no', 'btn-outline': wantToDoAgain !== 'no' }"
              @click="wantToDoAgain = 'no'"
            >
              No
            </button>
            <button 
              class="btn btn-sm"
              :class="{ 'btn-warning': wantToDoAgain === 'maybe', 'btn-outline': wantToDoAgain !== 'maybe' }"
              @click="wantToDoAgain = 'maybe'"
            >
              Maybe
            </button>
            <button 
              class="btn btn-sm"
              :class="{ 'btn-success': wantToDoAgain === 'yes', 'btn-outline': wantToDoAgain !== 'yes' }"
              @click="wantToDoAgain = 'yes'"
            >
              Yes
            </button>
          </div>
        </div>
        
        <!-- Show message if no evaluation components are shown -->
        <div v-if="!showDifficultyRating && !showDoAgainDecision" class="text-center text-base-content/70">
          <p>Task completed successfully!</p>
        </div>
      </div>
    </div>

    <div class="flex justify-center">
      <button 
        class="btn btn-primary" 
        :disabled="!isFormValid"
        @click="handleSubmit"
      >
        Continue
      </button>
    </div>
  </div>
</template>