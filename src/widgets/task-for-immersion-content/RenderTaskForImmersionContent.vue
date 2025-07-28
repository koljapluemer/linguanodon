<script setup lang="ts">
import { ref } from 'vue';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { TaskEvaluation } from '@/shared/ExerciseTypes';
import EvaluateTaskWidget from '@/features/evaluate-task-widget/EvaluateTaskWidget.vue';
import ManageVocabOfImmersionContentWidget from '@/features/manage-vocab-of-immersion-content/ManageVocabOfImmersionContentWidget.vue';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';

interface Props {
  content: ImmersionContentData;
}

interface Emits {
  (e: 'finished'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

type TaskState = 'task' | 'evaluation';
const currentState = ref<TaskState>('task');

const handleTaskCompleted = () => {
  currentState.value = 'evaluation';
};

const handleTaskSkipped = async () => {
  // Set nextShownEarliestAt to tomorrow for immersion content
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // TODO: Update immersion content with nextShownEarliestAt
  
  emit('finished');
};

const handleEvaluationFinished = (evaluation: TaskEvaluation) => {
  // TODO: Store evaluation in immersion content data
  emit('finished');
};
</script>

<template>
  <div>
    <div v-if="currentState === 'task'" class="space-y-6">
      <!-- Task Instructions with Markdown -->
      <div class="space-y-4">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-2">{{ content.title }}</h2>
          <div class="text-base-content/70">
            <MarkdownRenderer :content="content.prompt" />
          </div>
        </div>

        <div v-if="content.extraInfo" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <MarkdownRenderer :content="content.extraInfo" />
          </div>
        </div>
      </div>

      <!-- Vocab Management -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Associated Vocabulary</h3>
          <ManageVocabOfImmersionContentWidget 
            :content-uid="content.uid"
            :show-existing-associated-vocab="false"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
        <button class="btn btn-sm btn-ghost" @click="handleTaskSkipped">
          Skip
        </button>
        <button class="btn btn-primary" @click="handleTaskCompleted">
          Mark as Completed
        </button>
      </div>
    </div>

    <EvaluateTaskWidget 
      v-else-if="currentState === 'evaluation'"
      @finished="handleEvaluationFinished"
    />
  </div>
</template>