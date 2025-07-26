import type { TaskDefinition } from '@/shared/RuntimeTaskTypes';
import { ProposeAddPronunciation } from './proposers/ProposeAddPronunciation';
import { ProposeImmersionContent } from './proposers/ProposeImmersionContent';

export const TASK_REGISTRY: Record<string, TaskDefinition> = {
  'add-pronunciation': {
    taskType: 'add-pronunciation',
    proposer: new ProposeAddPronunciation()
  },
  'immersion-content': {
    taskType: 'immersion-content', 
    proposer: new ProposeImmersionContent()
  }
};

export function getTaskDefinition(taskType: string): TaskDefinition | undefined {
  return TASK_REGISTRY[taskType];
}