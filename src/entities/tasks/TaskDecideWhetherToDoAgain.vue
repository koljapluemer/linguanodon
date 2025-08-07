<template>
  <div class="space-y-4">
    <div class="text-center">
      <h3 class="text-lg font-semibold mb-2">Do you want to practice this again?</h3>
      <p class="text-base-content/70 mb-4">This helps us understand your learning preferences</p>
    </div>

    <div class="flex justify-center gap-4">
      <button 
        class="btn btn-outline" 
        @click="handleDecision(false)"
      >
        No, I'm good
      </button>
      <button 
        class="btn btn-primary" 
        @click="handleDecision(true)"
      >
        Yes, show me more
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'decision', wantToDoAgain: boolean): void;
}

const emit = defineEmits<Emits>();

const handleDecision = (wantToDoAgain: boolean) => {
  emit('decision', wantToDoAgain);
};
</script>