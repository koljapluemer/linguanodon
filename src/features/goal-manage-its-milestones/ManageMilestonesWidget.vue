<template>
  <div class="space-y-4">
    <div v-if="milestones.length === 0" class="text-center py-8 text-gray-500">
      No milestones yet. Add some below to track specific achievements for this goal.
    </div>
    
    <div v-else class="space-y-2">
      <div
        v-for="(milestone, index) in milestones"
        :key="index"
        class="flex items-center gap-3 p-3 border border-base-200 rounded-lg"
      >
        <input
          v-model="milestone.title"
          type="text"
          class="input input-sm input-bordered flex-1"
          @blur="updateMilestones"
          @keydown.enter="updateMilestones"
        />
        <button
          @click="removeMilestone(index)"
          class="btn btn-sm btn-error btn-outline"
        >
          Remove
        </button>
      </div>
    </div>

    <div class="divider">Add New Milestone</div>

    <div class="flex items-center gap-3">
      <input
        v-model="newMilestoneTitle"
        type="text"
        placeholder="e.g., count to 20 in your head, form five sentences using past tense"
        class="input input-bordered flex-1"
        @keydown.enter="addMilestone"
      />
      <button
        @click="addMilestone"
        :disabled="!newMilestoneTitle.trim()"
        class="btn btn-primary"
      >
        Add Milestone
      </button>
    </div>

    <div class="text-sm text-gray-500">
      Milestones are specific tasks you can do to check whether you've fulfilled this goal.
      They should be concrete, measurable achievements.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { TaskData } from '@/entities/tasks/TaskData';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const milestones = ref<TaskData[]>([]);
const newMilestoneTitle = ref('');

onMounted(() => {
  // Create a reactive copy of milestones
  milestones.value = [...props.goal.milestones];
});

async function addMilestone() {
  if (!newMilestoneTitle.value.trim()) return;
  
  const newMilestone: TaskData = {
    uid: crypto.randomUUID(),
    taskType: 'milestone',
    title: newMilestoneTitle.value.trim(),
    prompt: `Complete this milestone: ${newMilestoneTitle.value.trim()}`,
    evaluateCorrectnessAndConfidenceAfterDoing: false,
    decideWhetherToDoAgainAfterDoing: true,
    isActive: true,
    taskSize: 'small',
    associatedUnits: []
  };
  
  milestones.value.push(newMilestone);
  await updateMilestones();
  newMilestoneTitle.value = '';
}

async function removeMilestone(index: number) {
  if (!confirm('Are you sure you want to remove this milestone?')) return;
  
  milestones.value.splice(index, 1);
  await updateMilestones();
}

async function updateMilestones() {
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    milestones: milestones.value
  });
  
  emit('goal-updated', updatedGoal);
}
</script>