import type { Component } from 'vue';

// Import all task widgets
import RenderTaskForAddingPronunciation from '@/tasks/task-vocab-add-pronunciation/RenderTaskForAddingPronunciation.vue';
import RenderAddVocabToResource from '@/tasks/task-resource-add-vocab/RenderAddVocabToResource.vue';
import RenderAddFactCardsToResource from '@/tasks/task-resource-add-fact-cards/RenderAddFactCardsToResource.vue';
import TaskAddSubGoals from '@/tasks/task-goal-add-sub-goals/TaskAddSubGoals.vue';
import TaskAddVocabToGoal from '@/tasks/task-goal-add-vocab/TaskAddVocabToGoal.vue';
import TaskVocabTryToRemember from '@/tasks/task-vocab-try-to-remember/TaskVocabTryToRemember.vue';
import TaskVocabReveal from '@/tasks/task-vocab-reveal/TaskVocabReveal.vue';
import TaskVocabChooseFromOptions from '@/tasks/task-vocab-single-choice/TaskVocabChooseFromOptions.vue';

export interface TaskRegistryEntry {
  component: Component;
  label: string;
  badgeClass: string;
}

export type TaskRegistry = Record<string, TaskRegistryEntry>;

export const taskRegistry: TaskRegistry = {
  'add-pronunciation': {
    component: RenderTaskForAddingPronunciation,
    label: 'Add Pronunciation',
    badgeClass: 'badge-secondary'
  },
  'add-vocab-to-resource': {
    component: RenderAddVocabToResource,
    label: 'Add Vocab',
    badgeClass: 'badge-accent'
  },
  'add-fact-cards-to-resource': {
    component: RenderAddFactCardsToResource,
    label: 'Add Fact Cards',
    badgeClass: 'badge-accent'
  },
  'add-sub-goals': {
    component: TaskAddSubGoals,
    label: 'Add Sub Goals',
    badgeClass: 'badge-info'
  },
  'add-vocab-to-goal': {
    component: TaskAddVocabToGoal,
    label: 'Add Vocab to Goal',
    badgeClass: 'badge-info'
  },
  'vocab-try-to-remember': {
    component: TaskVocabTryToRemember,
    label: 'Try to Remember',
    badgeClass: 'badge-success'
  },
  'vocab-reveal': {
    component: TaskVocabReveal,
    label: 'Reveal',
    badgeClass: 'badge-warning'
  },
  'vocab-choose-from-options': {
    component: TaskVocabChooseFromOptions,
    label: 'Multiple Choice',
    badgeClass: 'badge-error'
  }
};

export const TASK_REGISTRY_INJECTION_KEY = Symbol('taskRegistry');