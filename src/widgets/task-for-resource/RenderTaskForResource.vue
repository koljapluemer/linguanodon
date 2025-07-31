<script setup lang="ts">
import { ref } from 'vue';
import type { ResourceData } from '@/entities/resources/ResourceData';
import EvaluateTaskWidget from '@/features/evaluate-task-widget/EvaluateTaskWidget.vue';
import ManageVocabOfResourceWidget from '@/features/manage-vocab-of-resource/ManageVocabOfResourceWidget.vue';
import ManageExamplesOfResourceWidget from '@/features/manage-examples-of-resource/ManageExamplesOfResourceWidget.vue';
import ManageFactsOfResourceWidget from '@/features/manage-facts-of-resource/ManageFactsOfResourceWidget.vue';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';

interface Props {
  resource: ResourceData;
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
  // Set nextShownEarliestAt to tomorrow for resource
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // TODO: Update resource with nextShownEarliestAt
  
  emit('finished');
};

const handleEvaluationFinished = () => {
  // TODO: Store evaluation in resource data
  emit('finished');
};
</script>

<template>
  <div>
    <div v-if="currentState === 'task'" class="space-y-6">
      <!-- Task Instructions with Markdown -->
      <div class="space-y-4">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-2">{{ resource.title }}</h2>
          <div class="text-base-content/70">
            <MarkdownRenderer :content="resource.prompt || 'Extract important words, examples and facts from the resource'" />
          </div>
        </div>

        <div v-if="resource.extraInfo" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <MarkdownRenderer :content="resource.extraInfo" />
          </div>
        </div>
      </div>

      <!-- Vocabulary Management -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <ManageVocabOfResourceWidget :resource-uid="resource.uid" />
        </div>
      </div>

      <!-- Examples Management -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <ManageExamplesOfResourceWidget :resource-uid="resource.uid" />
        </div>
      </div>

      <!-- Facts Management -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <ManageFactsOfResourceWidget :resource-uid="resource.uid" />
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