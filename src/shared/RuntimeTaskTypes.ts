import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { ExampleData } from '@/entities/examples/ExampleData';
import type { GoalData } from '@/entities/goals/GoalData';
import type { ResourceData } from '@/entities/resources/ResourceData';

export type RuntimeTask = 
  | { 
      taskType: 'add-pronunciation'; 
      data: { vocabId: string; vocab: VocabData } 
    }
  | { 
      taskType: 'immersion-content'; 
      data: { contentId: string; content: ImmersionContentData } 
    }
  | { 
      taskType: 'free-translate'; 
      data: { exampleId: string; example: ExampleData } 
    }
  | { 
      taskType: 'add-sub-goals'; 
      data: { goalId: string; goal: GoalData } 
    }
  | { 
      taskType: 'add-vocab-to-goal'; 
      data: { goalId: string; goal: GoalData } 
    }
  | { 
      taskType: 'add-examples-to-goal'; 
      data: { goalId: string; goal: GoalData } 
    }
  | { 
      taskType: 'add-milestones'; 
      data: { goalId: string; goal: GoalData } 
    }
  | { 
      taskType: 'resource'; 
      data: { resourceId: string; resource: ResourceData } 
    };

export interface TaskProposer<T = RuntimeTask> {
  proposeTask(): Promise<T | null>;
}

export interface TaskDefinition<T = RuntimeTask> {
  taskType: string;
  proposer: TaskProposer<T>;
}