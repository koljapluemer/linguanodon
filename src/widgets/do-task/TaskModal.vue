<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"></button>
      </form>
      
      <TaskRenderer 
        v-if="task"
        :task="task"
        @finished="handleFinished"
      />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TaskRenderer from './TaskRenderer.vue';
import type { Task } from '@/entities/tasks/Task';

interface Props {
  task?: Task;
}

defineProps<Props>();

const emit = defineEmits<{
  finished: [];
}>();

const dialogRef = ref<HTMLDialogElement>();

function handleFinished() {
  emit('finished');
  close();
}

function show() {
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

defineExpose({
  show,
  close
});
</script>