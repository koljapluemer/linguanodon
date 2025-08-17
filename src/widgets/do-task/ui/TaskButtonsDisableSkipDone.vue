<template>
  <div class="big-card">
    <div class="card-body  items-center text-center">
      <div class="card-actions">
        <button class="btn" @click="$emit('skipAndDeactivate')">
          Skip and Deactivate
        </button>
        <button class="btn" @click="$emit('notNow')">
          Not now
        </button>
        <button class="btn btn-primary" :disabled="!isDoneEnabled" @click="$emit('done')" v-if="showDoneButton">
          Done
        </button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
interface Props {
  isDoneEnabled: boolean;
  showDoneButton: boolean
}

interface Emits {
  (e: 'skipAndDeactivate'): void;
  (e: 'notNow'): void;
  (e: 'done'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>