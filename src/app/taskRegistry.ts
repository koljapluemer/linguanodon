import type { Component } from 'vue';

// Import all task widgets
import RenderTaskForAddingPronunciation from '@/widgets/task-for-adding-pronunciation/RenderTaskForAddingPronunciation.vue';
import RenderAddVocabToResource from '@/widgets/task-add-vocab-to-resource/RenderAddVocabToResource.vue';
import RenderAddFactCardsToResource from '@/widgets/task-add-fact-cards-to-resource/RenderAddFactCardsToResource.vue';
import TaskAddSubGoals from '@/widgets/TaskAddSubGoals.vue';
import TaskAddVocabToGoal from '@/widgets/TaskAddVocabToGoal.vue';
import TaskVocabTryToRemember from '@/widgets/TaskVocabTryToRemember.vue';
import TaskVocabReveal from '@/widgets/TaskVocabReveal.vue';
import TaskVocabChooseFromOptions from '@/widgets/TaskVocabChooseFromOptions.vue';

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