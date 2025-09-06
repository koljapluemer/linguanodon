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

    <component :is="getTaskComponent(props.task.taskType)" :task="props.task" :repositories="repositories"
      :mode-context="props.modeContext" @finished="handleTaskFinished" />
  </div>
</template>

<script setup lang="ts">
import { taskRegistry } from './taskRegistry';
import type { Task } from '@/pages/practice/Task';
import { inject, onMounted, ref } from 'vue';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import LanguageDisplay from '@/entities/languages/LanguageDisplay.vue';

interface Props {
  task: Task;
  modeContext?: {
    setWrongVocabDueAgainImmediately?: boolean;
  };
}

const props = defineProps<Props>();
const languageData = ref<LanguageData | null>(null);

// Inject all repositories
const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const translationRepo = inject<TranslationRepoContract>('translationRepo');
const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
const languageRepo = inject<LanguageRepoContract>('languageRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const goalRepo = inject<GoalRepoContract>('goalRepo');
const noteRepo = inject<NoteRepoContract>('noteRepo');

if (!vocabRepo || !translationRepo || !factCardRepo || !languageRepo || !resourceRepo || !goalRepo || !noteRepo) {
  throw new Error('Required repositories not available');
}

const repositories: RepositoriesContextStrict = {
  vocabRepo,
  translationRepo,
  factCardRepo,
  languageRepo,
  resourceRepo,
  goalRepo,
  noteRepo
};

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