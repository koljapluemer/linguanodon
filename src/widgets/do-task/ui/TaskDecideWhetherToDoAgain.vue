<template>
  <div class="big-card">
    <div class="card-body items-center text-center">
      <div class="card-title">Do you want to do this task again in the future?</div>

      <div class="card-actions flex justify-center gap-4">
        <button class="btn btn-secondary" @click="handleDecision(false)">
          No
        </button>
        <button class="btn btn-primary" @click="handleDecision(true)">
          Yes
        </button>
      </div>
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