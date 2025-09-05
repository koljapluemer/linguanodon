<template>
  <div class="flex flex-col gap-4">
    <div class="card shadow">
      <div class="card-body">
        <div class="badge">
          <LanguageDisplay v-if="languageData" :language="languageData" />
        </div>
        <h2>
          {{ props.task.prompt }}
        </h2>
      </div>
    </div>

    <component :is="getTaskComponent(props.task.taskType)" :task="props.task" :repositories="props.repositories"
      :mode-context="props.modeContext" @finished="handleTaskFinished" />
  </div>
</template>

<script setup lang="ts">
import { taskRegistry } from './taskRegistry';
import type { Task } from '@/pages/practice/Task';
import { onMounted, ref } from 'vue';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import LanguageDisplay from '@/entities/languages/LanguageDisplay.vue';

interface Props {
  task: Task;
  repositories: RepositoriesContext;
  modeContext?: {
    setWrongVocabDueAgainImmediately?: boolean;
  };
}

const props = defineProps<Props>();
const languageData = ref<LanguageData | null>(null);

onMounted(async () => {
  if (!props.repositories.languageRepo) return;
  const lang = await props.repositories.languageRepo.getByCode(props.task.language);
  if (lang) languageData.value = lang;
});

const emit = defineEmits<{
  finished: [];
}>();

function getTaskComponent(taskType: string) {
  const taskInfo = taskRegistry[taskType as keyof typeof taskRegistry];
  return taskInfo?.component;
}

function handleTaskFinished() {
  emit('finished');
}
</script>