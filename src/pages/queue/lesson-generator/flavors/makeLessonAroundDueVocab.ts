import type { TaskData } from '@/entities/tasks/Task';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';

export class DueVocabStrategy extends BaseLessonStrategy {
  constructor(dependencies: LessonStrategyDependencies) {
    super(dependencies);
  }
  protected async generateCoreTasks(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _languages: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _targetTaskCount: number
  ): Promise<TaskData[]> {
    // For due vocab strategy, core tasks are just due vocab - same as fillup
    return [];
  }
}

