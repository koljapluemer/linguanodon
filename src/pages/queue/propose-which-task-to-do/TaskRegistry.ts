import type { TaskDefinition } from '@/shared/RuntimeTaskTypes';
import { ProposeAddPronunciation } from './proposers/ProposeAddPronunciation';
import { ProposeImmersionContent } from './proposers/ProposeImmersionContent';
import { ProposeFreeTranslate } from './proposers/ProposeFreeTranslate';
import { ProposeAddSubGoals } from './proposers/ProposeAddSubGoals';
import { ProposeAddVocabToGoal } from './proposers/ProposeAddVocabToGoal';
import { ProposeAddExamplesToGoal } from './proposers/ProposeAddExamplesToGoal';
import { ProposeAddMilestones } from './proposers/ProposeAddMilestones';

export const TASK_REGISTRY: Record<string, TaskDefinition> = {
  'add-pronunciation': {
    taskType: 'add-pronunciation',
    proposer: new ProposeAddPronunciation()
  },
  'immersion-content': {
    taskType: 'immersion-content', 
    proposer: new ProposeImmersionContent()
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
  }
};

export function getTaskDefinition(taskType: string): TaskDefinition | undefined {
  return TASK_REGISTRY[taskType];
}