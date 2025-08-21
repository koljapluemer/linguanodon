<template>
  <div class="space-y-4">

    <TaskPrompt :prompt="task.prompt"/>

    <TaskButtonsDisableSkipDone :showDoneButton="!isDone"  :isDoneEnabled="mayBeConsideredDone" @done="handleDone" @notNow="handleNotNow"
      @skipAndDeactivate="handleSkipAndDeactivate" v-if="!isDone" :key="task.uid" />
    <TaskEvaluateDifficulty @rating="handleDifficultyRating" v-if="isDone && showDifficultyRating" :key="task.uid" />
    <TaskDecideWhetherToDoAgain @decision="handleDoAgainDecision" v-if="isDone && showDecisionComponent" :key="task.uid" />


    <!-- Actual Task Component -->
    <div class="big-card">
      <component :is="getTaskComponent(props.task.taskType)" :task="props.task" @finished="handleTaskFinished"
        @taskNowMayBeConsideredDone="handleTaskNowMayBeConsideredDone"
        @taskNowMayNotBeConsideredDone="handleTaskNowMayNotBeConsideredDone" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { toRaw } from 'vue';
import { taskRegistry } from './taskRegistry';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/factCards/FactCardRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';
import type { Rating } from 'ts-fsrs';
import TaskButtonsDisableSkipDone from './ui/TaskButtonsDisableSkipDone.vue';
import TaskEvaluateDifficulty from './ui/TaskEvaluateDifficulty.vue';
import TaskDecideWhetherToDoAgain from './ui/TaskDecideWhetherToDoAgain.vue';
import TaskPrompt from '@/widgets/do-task/ui/TaskPrompt.vue';

interface Props {
  task: TaskData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  finished: [];
}>();

// Injected repositories
const taskRepo = inject<TaskRepoContract>('taskRepo');
const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const translationRepo = inject<TranslationRepoContract>('translationRepo');
const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const goalRepo = inject<GoalRepoContract>('goalRepo');
const noteRepo = inject<NoteRepoContract>('noteRepo');

if (!taskRepo) {
  throw new Error('TaskRepo not provided');
}

// Task state
const isDone = ref(false);
const mayBeConsideredDone = ref(false);
const showDifficultyRating = ref(false);
const showDecisionComponent = ref(false);
const difficultyRating = ref<Rating | null>(null);
const doAgainDecision = ref<boolean | null>(null);

function getTaskComponent(taskType: string) {
  return taskRegistry[taskType as keyof typeof taskRegistry];
}

// Task component event handlers

function handleTaskNowMayBeConsideredDone() {
  mayBeConsideredDone.value = true;
}

function handleTaskNowMayNotBeConsideredDone() {
  mayBeConsideredDone.value = false;
}

function handleTaskFinished() {
  // Legacy event handler for tasks that don't use the button system
  handleDone();
}

// Button event handlers
function handleDone() {
  isDone.value = true;

  // Check if we need to show difficulty rating
  if (props.task.evaluateDifficultyAfterDoing) {
    showDifficultyRating.value = true;
    return;
  }

  // Check if we need to show do-again decision
  if (props.task.decideWhetherToDoAgainAfterDoing) {
    showDecisionComponent.value = true;
    return;
  }

  // Neither rating nor decision needed, finish immediately
  finishTask();
}

function handleNotNow() {
  emit('finished');
}

function handleSkipAndDeactivate() {
  // Deactivate task and finish
  updateTaskAsSkipped();
}

// Rating and decision handlers
function handleDifficultyRating(rating: Rating) {
  difficultyRating.value = rating;
  showDifficultyRating.value = false;

  // Check if we need to show do-again decision
  if (props.task.decideWhetherToDoAgainAfterDoing) {
    showDecisionComponent.value = true;
    return;
  }

  // No decision needed, finish
  finishTask();
}

function handleDoAgainDecision(wantToDoAgain: boolean) {
  doAgainDecision.value = wantToDoAgain;
  showDecisionComponent.value = false;
  finishTask();
}

// Task completion logic
async function finishTask() {
  try {
    // Update task data
    const updatedTask: TaskData = {
      ...toRaw(props.task),
      lastShownAt: new Date(),
      ...(difficultyRating.value && { lastDifficultyRating: difficultyRating.value }),
      ...(props.task.isOneTime && { isActive: false }),
      ...(doAgainDecision.value !== null && { isActive: doAgainDecision.value })
    };

    await taskRepo!.saveTask(toRaw(updatedTask));

    // Update associated entities
    await updateAssociatedEntities();

    emit('finished');
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'QuotaExceededError') {
      console.error('Storage full, task completion may be incomplete:', error);
      emit('finished'); // Still emit to prevent hang
      return;
    }
    console.error('Error finishing task:', error);
    emit('finished'); // Always emit to prevent hang
  }
}

async function updateTaskAsSkipped() {
  try {
    const updatedTask: TaskData = {
      ...toRaw(props.task),
      lastShownAt: new Date(),
      isActive: false
    };

    await taskRepo!.saveTask(toRaw(updatedTask));
    emit('finished');
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'QuotaExceededError') {
      console.error('Storage full, task skip may be incomplete:', error);
      emit('finished'); // Still emit to prevent hang
      return;
    }
    console.error('Error skipping task:', error);
    emit('finished'); // Always emit to prevent hang
  }
}

async function updateAssociatedEntities() {
  // Update associated vocab
  if (props.task.associatedVocab?.length && vocabRepo) {
    for (const vocabUid of props.task.associatedVocab) {
      if (props.task.isOneTime) {
        // Just update last review time
        await vocabRepo.updateLastReview(vocabUid);
      } else if (difficultyRating.value) {
        // Score the vocab
        await vocabRepo.scoreVocab(vocabUid, difficultyRating.value);
      }

      // Update vocab tasks after scoring/reviewing
      if (taskRepo && noteRepo && translationRepo) {
        const updateVocabTasksController = new UpdateVocabTasksController(vocabRepo, translationRepo, taskRepo, noteRepo);
        await updateVocabTasksController.updateTasksForVocab(vocabUid);
      }
    }
  }

  // Update associated fact cards
  if (props.task.associatedFactCards?.length && factCardRepo) {
    for (const factCardUid of props.task.associatedFactCards) {
      if (props.task.isOneTime) {
        // Just update last review time
        await factCardRepo.updateLastReview(factCardUid);
      } else if (difficultyRating.value) {
        // Score the fact card
        await factCardRepo.scoreFactCard(factCardUid, difficultyRating.value);
      }
    }
  }

  // Update associated resources
  if (props.task.associatedResources?.length && resourceRepo) {
    for (const resourceUid of props.task.associatedResources) {
      const resource = await resourceRepo.getResourceById(resourceUid);
      if (resource) {
        const updatedResource = {
          ...resource,
          lastShownAt: new Date()
        };
        await resourceRepo.updateResource(toRaw(updatedResource));
      }
    }
  }

  // Update associated goals
  if (props.task.associatedGoals?.length && goalRepo) {
    for (const goalUid of props.task.associatedGoals) {
      const goal = await goalRepo.getById(goalUid);
      if (goal) {
        const updatedGoal = {
          ...goal,
          lastShownAt: new Date()
        };
        await goalRepo.update(goalUid, updatedGoal);
      }
    }
  }
}
</script>