<template>
  <div>
    <p class="mb-4">{{ question }}</p>
    <div class="flex gap-2">
      <button @click="handleDecision(true)" class="btn btn-primary">{{ $t('common.yes') }}</button>
      <button @click="handleDecision(false)" class="btn btn-outline">{{ $t('common.no') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  question: string;
}

defineProps<Props>();

const emit = defineEmits<{
  decision: [wantToDoAgain: boolean];
}>();

const handleDecision = (wantToDoAgain: boolean) => {
  emit('decision', wantToDoAgain);
};
</script>