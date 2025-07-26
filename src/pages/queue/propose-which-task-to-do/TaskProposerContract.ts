import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';

export interface TaskProposerContract {
  proposeTask(): Promise<RuntimeTask | null>;
}