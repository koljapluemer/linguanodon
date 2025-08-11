import { ProposeAddPronunciation } from './proposers/ProposeAddPronunciation';
import { ProposeFreeTranslate } from './proposers/ProposeFreeTranslate';
import { ProposeAddSubGoals } from './proposers/ProposeAddSubGoals';
import { ProposeAddVocabToGoal } from './proposers/ProposeAddVocabToGoal';
import { ProposeAddExamplesToGoal } from './proposers/ProposeAddExamplesToGoal';
import { ProposeAddMilestones } from './proposers/ProposeAddMilestones';
import { ProposeResource } from './proposers/ProposeResource';
import type { TaskType } from '@/entities/tasks/TaskData';
import type { TaskProposerContract } from './TaskProposerContract';

export interface TaskDefinition {
  taskType: TaskType;
  proposer: TaskProposerContract;
}

export const TASK_REGISTRY: Record<TaskType, TaskDefinition> = {
  'add-pronunciation': {
    taskType: 'add-pronunciation',
    proposer: new ProposeAddPronunciation()
  },
  'free-translate': {
    taskType: 'free-translate',
    proposer: new ProposeFreeTranslate()
  },
  'add-sub-goals': {
    taskType: 'add-sub-goals',
    proposer: new ProposeAddSubGoals()
  },
  'add-vocab-to-goal': {
    taskType: 'add-vocab-to-goal',
    proposer: new ProposeAddVocabToGoal()
  },
  'add-examples-to-goal': {
    taskType: 'add-examples-to-goal',
    proposer: new ProposeAddExamplesToGoal()
  },
  'add-milestones': {
    taskType: 'add-milestones',
    proposer: new ProposeAddMilestones()
  },
  'add-vocab-to-resource': {
    taskType: 'add-vocab-to-resource',
    proposer: new ProposeResource() // TODO: Create specific proposer
  },
  'add-examples-to-resource': {
    taskType: 'add-examples-to-resource',
    proposer: new ProposeResource() // TODO: Create specific proposer
  },
  'add-fact-cards-to-resource': {
    taskType: 'add-fact-cards-to-resource',
    proposer: new ProposeResource() // TODO: Create specific proposer
  },
  'complete-goal': {
    taskType: 'complete-goal',
    proposer: new ProposeResource() // Placeholder
  },
  'milestone': {
    taskType: 'milestone',
    proposer: new ProposeResource() // Placeholder
  },
  'vocab-try-to-remember': {
    taskType: 'vocab-try-to-remember',
    proposer: new ProposeResource() // Placeholder - vocab tasks handled separately
  },
  'vocab-reveal': {
    taskType: 'vocab-reveal',
    proposer: new ProposeResource() // Placeholder - vocab tasks handled separately
  },
  'vocab-choose-from-options': {
    taskType: 'vocab-choose-from-options',
    proposer: new ProposeResource() // Placeholder - vocab tasks handled separately
  }
};

export function getTaskDefinition(taskType: TaskType): TaskDefinition | undefined {
  return TASK_REGISTRY[taskType];
}