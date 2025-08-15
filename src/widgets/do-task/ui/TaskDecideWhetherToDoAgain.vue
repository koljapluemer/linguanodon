<template>
  <div>
    <h3 class="text-center text-lg font-semibold mb-2">Do you want to do this task again in the future?</h3>

    <div class="flex justify-center gap-4">
      <button class="btn btn-secondary" @click="handleDecision(false)">
        No
      </button>
      <button class="btn btn-primary" @click="handleDecision(true)">
        Yes
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