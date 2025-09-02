<template>
  <div class="space-y-2">
    <LanguageDisplay v-if="languageData" :language="languageData" variant="short" />
    <TaskPrompt :prompt="props.task.prompt" />
    <component :is="getTaskComponent(props.task.taskType)" :task="props.task" @finished="handleTaskFinished" />
  </div>
</template>

<script setup lang="ts">
import { taskRegistry } from './taskRegistry';
import type { Task } from '@/entities/tasks/Task';
import { inject, onMounted, ref } from 'vue';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import LanguageDisplay from '@/entities/languages/LanguageDisplay.vue';
import TaskPrompt from './TaskPrompt.vue';

interface Props {
  task: Task;
}

const props = defineProps<Props>();
const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const languageData = ref<LanguageData | null>(null);

onMounted(async () => {
  const lang = await languageRepo.getByCode(props.task.language);
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