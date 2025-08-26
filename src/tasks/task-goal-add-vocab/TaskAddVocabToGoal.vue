<template>
  <div v-if="goal">
    <h2 class="text-2xl font-bold mb-6">{{ goal.title }}</h2>

    <ManageGoalVocab 
      :goal="goal"
      @goal-updated="handleGoalUpdate"
    />

    <div v-if="!showDoneSection" class="flex gap-2 mt-6">
      <button @click="handleSkip" class="btn btn-outline">Skip</button>
      <button @click="handleSkipAndDisable" class="btn btn-outline">Skip & Disable</button>
      <button @click="handleDone" :disabled="!hasChanges" class="btn btn-primary">Done</button>
    </div>

    <div v-if="showDoneSection" class="mt-6">
      <TaskDecideWhetherToDoAgain 
        question="Do you want to add more vocabulary in the future?"
        @decision="handleFinishDecision" 
      />
    </div>
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { Task } from '@/entities/tasks/Task';
import ManageGoalVocab from '@/widgets/manage-goal-vocab/ManageGoalVocab.vue';
import TaskDecideWhetherToDoAgain from '@/shared/TaskDecideWhetherToDoAgain.vue';

interface Props {
  task: Task;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const goal = ref<GoalData | null>(null);
const hasChanges = ref(false);
const showDoneSection = ref(false);

async function loadGoal() {
  const goalUid = props.task.associatedGoals?.[0];
  if (!goalUid) {
    console.error('No goal association found in task');
    return;
  }
  
  const loadedGoal = await goalRepo.getById(goalUid);
  if (!loadedGoal) {
    console.error(`Goal with id ${goalUid} not found`);
    return;
  }
  goal.value = loadedGoal;
}

function handleGoalUpdate(updatedGoal: GoalData) {
  goal.value = updatedGoal;
  hasChanges.value = true;
}

const handleSkip = async () => {
  if (!goal.value) return;
  
  try {
    // Just update lastShownAt - no other changes
    await goalRepo.update(goal.value.uid, {
      lastShownAt: new Date()
    });
    
    emit('finished');
  } catch (error) {
    console.error('Error skipping goal:', error);
    emit('finished');
  }
};

const handleSkipAndDisable = async () => {
  if (!goal.value) return;
  
  try {
    // Set finishedAddingKnowledge to true
    const updatedGoal = {
      ...JSON.parse(JSON.stringify(goal.value)),
      finishedAddingKnowledge: true,
      lastShownAt: new Date()
    };
    await goalRepo.update(goal.value.uid, updatedGoal);
    
    emit('finished');
  } catch (error) {
    console.error('Error disabling goal:', error);
    emit('finished');
  }
};

const handleDone = () => {
  showDoneSection.value = true;
};

const handleFinishDecision = async (wantToDoAgain: boolean) => {
  if (!goal.value) return;
  
  try {
    const updatedGoal = {
      ...JSON.parse(JSON.stringify(goal.value)),
      finishedAddingKnowledge: !wantToDoAgain,
      lastShownAt: new Date()
    };
    await goalRepo.update(goal.value.uid, updatedGoal);
    
    emit('finished');
  } catch (error) {
    console.error('Error finishing goal:', error);
    emit('finished');
  }
};

onMounted(loadGoal);
</script>