<script setup lang="ts">
import ElementInstruction from '@/shared/ui/ElementInstruction.vue';

interface Props {
  title: string;
  prompt: string;
  extraInfo?: string;
}

interface Emits {
  (e: 'completed'): void;
  (e: 'skipped'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleComplete = () => {
  emit('completed');
};

const handleSkip = () => {
  emit('skipped');
};
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-2">{{ title }}</h2>
      <ElementInstruction>{{ prompt }}</ElementInstruction>
    </div>

    <div v-if="extraInfo" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <p class="text-lg text-center">{{ extraInfo }}</p>
      </div>
    </div>

    <div class="flex justify-center gap-4">
      <button class="btn btn-sm btn-ghost" @click="handleSkip">
        Skip
      </button>
      <button class="btn btn-primary" @click="handleComplete">
        Mark as Completed
      </button>
    </div>
  </div>
</template>