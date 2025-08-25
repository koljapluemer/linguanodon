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
import type { TaskData } from '@/entities/tasks/Task';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
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
const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const goalRepo = inject<GoalRepoContract>('goalRepo');


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

  // Task completion simplified - no difficulty rating or do-again decisions

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
  // Simplified - no decision component needed with ad-hoc tasks

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
    // Tasks are ad-hoc, no need to update task data

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
    // Ad-hoc tasks don't need persistence, just emit finished
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
      // Update last review time (simplified since isOneTime is removed)
      await vocabRepo.updateLastReview(vocabUid);
      if (difficultyRating.value) {
        // Score the vocab if rating was provided
        await vocabRepo.scoreVocab(vocabUid, difficultyRating.value);
      }

      // Task updates are no longer needed with ad-hoc generation
    }
  }

  // Update associated fact cards
  if (props.task.associatedFactCards?.length && factCardRepo) {
    for (const factCardUid of props.task.associatedFactCards) {
      // Update last review time (simplified since isOneTime is removed)
      await factCardRepo.updateLastReview(factCardUid);
      if (difficultyRating.value) {
        // Score the fact card if rating was provided
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