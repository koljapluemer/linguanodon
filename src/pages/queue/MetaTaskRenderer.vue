<script setup lang="ts">
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import RenderTaskForAddingPronunciation from '@/widgets/task-for-adding-pronunciation/RenderTaskForAddingPronunciation.vue';
import RenderTaskForImmersionContent from '@/widgets/task-for-immersion-content/RenderTaskForImmersionContent.vue';
import FreeTranslateTaskWidget from '@/widgets/free-translate-task/FreeTranslateTaskWidget.vue';

interface Props {
  task: RuntimeTask;
}

interface Emits {
  (e: 'finished'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleFinished = () => {
  emit('finished');
};
</script>

<template>
  <div>
    <RenderTaskForAddingPronunciation
      v-if="task.taskType === 'add-pronunciation'"
      :vocab="task.data.vocab"
      @finished="handleFinished"
    />
    
    <RenderTaskForImmersionContent
      v-else-if="task.taskType === 'immersion-content'"
      :content="task.data.content"
      @finished="handleFinished"
    />
    
    <FreeTranslateTaskWidget
      v-else-if="task.taskType === 'free-translate'"
      :task-data="task.data"
      @complete="handleFinished"
    />
    
    <!-- Fallback for unknown task types -->
    <div v-else class="alert alert-error">
      <span>Unknown task type</span>
      <button class="btn btn-sm" @click="handleFinished">
        Skip
      </button>
    </div>
  </div>
</template>