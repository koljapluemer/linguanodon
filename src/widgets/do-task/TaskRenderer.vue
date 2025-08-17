<template>
  <div class="space-y-4">
    <!-- Task Prompt -->
    <div class="space-y-2">
      <p class="text-base-content/70">{{ props.task.prompt }}</p>
    </div>

    <!-- Task Controls or Rating/Decision Components -->
    <div v-if="!isDone">
      <!-- Task Action Buttons -->
      <TaskButtonsDisableSkipDone
        :isDoneEnabled="mayBeConsideredDone"
        @done="handleDone"
        @notNow="handleNotNow"
        @skipAndDeactivate="handleSkipAndDeactivate"
      />
    </div>
    
    <div v-else-if="showDifficultyRating">
      <!-- Difficulty Rating Component -->
      <TaskEvaluateDifficulty @rating="handleDifficultyRating" />
    </div>
    
    <div v-else-if="showDecisionComponent">
      <!-- Do Again Decision Component -->
      <TaskDecideWhetherToDoAgain @decision="handleDoAgainDecision" />
    </div>

    <!-- Actual Task Component -->
    <div v-if="!isDone">
      <component
        :is="getTaskComponent(props.task.taskType)"
        v-if="getTaskComponent(props.task.taskType)"
        :task="props.task"
        @finished="handleTaskFinished"
        @complete="handleTaskFinished"
        @task-completed="handleTaskFinished"
        @taskWasDone="handleTaskWasDone"
        @taskNowMayBeConsideredDone="handleTaskNowMayBeConsideredDone"
        @taskNowMayNotBeConsideredDone="handleTaskNowMayNotBeConsideredDone"
      />
      
      <div v-else class="alert alert-error">
        <div>
          <p class="text-sm opacity-70">Task type: {{ props.task.taskType }}</p>
          <p class="text-sm opacity-70">Unable to load task component.</p>
        </div>
        <button class="btn btn-sm" @click="handleSkipAndDeactivate">
          Skip Task
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { toRaw } from 'vue';
import { taskRegistry } from './taskRegistry';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/factCards/FactCardRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';
import type { Rating } from 'ts-fsrs';
import TaskButtonsDisableSkipDone from './ui/TaskButtonsDisableSkipDone.vue';
import TaskEvaluateDifficulty from './ui/TaskEvaluateDifficulty.vue';
import TaskDecideWhetherToDoAgain from './ui/TaskDecideWhetherToDoAgain.vue';

interface Props {
  task: TaskData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  finished: [];
}>();

// Injected repositories
const taskRepo = inject<TaskRepoContract>('taskRepo');
const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
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
function handleTaskWasDone() {
  // Task component indicates it's done
}

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
    console.error('Error finishing task:', error);
    emit('finished');
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
    console.error('Error skipping task:', error);
    emit('finished');
  }
}

async function updateAssociatedEntities() {
  // Update associated vocab
  if (props.task.associatedVocab?.length && vocabRepo) {
    console.log('TaskRenderer: Processing associated vocab:', props.task.associatedVocab);
    console.log('TaskRenderer: Task isOneTime:', props.task.isOneTime);
    console.log('TaskRenderer: Difficulty rating:', difficultyRating.value);
    
    for (const vocabUid of props.task.associatedVocab) {
      console.log(`TaskRenderer: Processing vocab UID: ${vocabUid}`);
      
      if (props.task.isOneTime) {
        // Just update last review time
        console.log(`TaskRenderer: Updating last review for one-time task, vocab: ${vocabUid}`);
        await vocabRepo.updateLastReview(vocabUid);
        console.log(`TaskRenderer: Successfully updated last review for vocab: ${vocabUid}`);
      } else if (difficultyRating.value) {
        // Score the vocab
        console.log(`TaskRenderer: Scoring vocab ${vocabUid} with rating: ${difficultyRating.value}`);
        await vocabRepo.scoreVocab(vocabUid, difficultyRating.value);
        console.log(`TaskRenderer: Successfully scored vocab: ${vocabUid}`);
      } else {
        console.log(`TaskRenderer: No action taken for vocab ${vocabUid} - not one-time and no difficulty rating`);
      }
      
      // Update vocab tasks after scoring/reviewing
      if (taskRepo && noteRepo) {
        console.log(`TaskRenderer: Updating tasks for vocab: ${vocabUid}`);
        const updateVocabTasksController = new UpdateVocabTasksController(vocabRepo, taskRepo, noteRepo);
        await updateVocabTasksController.updateTasksForVocab(vocabUid);
        console.log(`TaskRenderer: Successfully updated tasks for vocab: ${vocabUid}`);
      }
    }
  } else {
    console.log('TaskRenderer: No associated vocab to process');
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