import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';

export type RuntimeTask = 
  | { 
      taskType: 'add-pronunciation'; 
      data: { vocabId: string; vocab: VocabData } 
    }
  | { 
      taskType: 'immersion-content'; 
      data: { contentId: string; content: ImmersionContentData } 
    };

export interface TaskProposer<T = RuntimeTask> {
  proposeTask(): Promise<T | null>;
}

export interface TaskDefinition<T = RuntimeTask> {
  taskType: string;
  proposer: TaskProposer<T>;
}