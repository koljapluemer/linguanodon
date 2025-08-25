import type { Task } from '@/entities/tasks/Task';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomFromArray } from '@/shared/arrayUtils';
import { getRandomGeneratedTaskForVocab } from '../utils/getRandomGeneratedTaskForVocab';
import { generateAddSubGoals, canGenerateAddSubGoals } from '../task-generator/generateAddSubGoals';
import { generateAddVocabToGoal, canGenerateAddVocabToGoal } from '../task-generator/generateAddVocabToGoal';

const MAX_NEW_VOCAB_FROM_GOAL = 3;

export class GoalBasedStrategy extends BaseLessonStrategy {
  constructor(dependencies: LessonStrategyDependencies) {
    super(dependencies);
  }

  protected async generateCoreTasks(
    languages: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _targetTaskCount: number
  ): Promise<Task[]> {
    const tasks: Task[] = [];
    const usedVocabIds = new Set<string>();
    
    try {
      // Get all incomplete goals
      const incompleteGoals = await this.goalRepo.getIncompleteGoals();
      console.log(`[GoalBasedStrategy] Found ${incompleteGoals.length} incomplete goals`);
      
      // Filter goals that can generate tasks and have vocab in active languages
      const eligibleGoals = incompleteGoals.filter(goal =>
        languages.includes(goal.language) &&
        (canGenerateAddSubGoals(goal) || canGenerateAddVocabToGoal(goal) || goal.vocab.length > 0)
      );
      
      console.log(`[GoalBasedStrategy] Found ${eligibleGoals.length} eligible goals that can generate tasks`);
      
      if (eligibleGoals.length === 0) {
        return tasks;
      }
      
      // Pick a random eligible goal
      const selectedGoal = randomFromArray(eligibleGoals);
      if (!selectedGoal) {
        return tasks;
      }
      
      console.log(`[GoalBasedStrategy] Selected goal: ${selectedGoal.title} (${selectedGoal.uid})`);
      
      // Generate appropriate task for the goal
      const availableGenerators = [];
      if (canGenerateAddSubGoals(selectedGoal)) {
        availableGenerators.push(() => generateAddSubGoals(selectedGoal));
      }
      if (canGenerateAddVocabToGoal(selectedGoal)) {
        availableGenerators.push(() => generateAddVocabToGoal(selectedGoal));
      }
      
      if (availableGenerators.length > 0) {
        const randomGenerator = randomFromArray(availableGenerators);
        if (randomGenerator) {
          const generatedTask = randomGenerator();
          console.log(`[GoalBasedStrategy] Generated task for goal: ${generatedTask.taskType}`);
          tasks.push(generatedTask);
          
          // Mark associated vocab as used
          if (generatedTask.associatedVocab) {
            generatedTask.associatedVocab.forEach(vocabUid => usedVocabIds.add(vocabUid));
          }
        }
      }
      
      // Find new/unseen vocab attached to this goal (max 3)
      const unusedVocabIds = selectedGoal.vocab.filter(vocabId => !usedVocabIds.has(vocabId));
      const newVocab = await this.vocabRepo.getUnseenVocabByIds(unusedVocabIds);
      
      console.log(`[GoalBasedStrategy] Found ${newVocab.length} unseen vocab in goal`);
      
      const selectedNewVocab = newVocab.slice(0, MAX_NEW_VOCAB_FROM_GOAL);
      for (const vocab of selectedNewVocab) {
        const task = await getRandomGeneratedTaskForVocab(vocab);
        if (task) {
          console.log(`[GoalBasedStrategy] Generated task ${task.taskType} for new vocab: ${vocab.content}`);
          tasks.push(task);
          usedVocabIds.add(vocab.uid);
        }
      }
      
      // Find seen and due vocab attached to this goal
      const remainingUnusedVocabIds = selectedGoal.vocab.filter(vocabId => !usedVocabIds.has(vocabId));
      const dueVocab = await this.vocabRepo.getDueVocabByIds(remainingUnusedVocabIds);
      
      console.log(`[GoalBasedStrategy] Found ${dueVocab.length} due vocab in goal`);
      
      for (const vocab of dueVocab) {
        const task = await getRandomGeneratedTaskForVocab(vocab);
        if (task) {
          console.log(`[GoalBasedStrategy] Generated task ${task.taskType} for due vocab: ${vocab.content}`);
          tasks.push(task);
          usedVocabIds.add(vocab.uid);
        }
      }
      
      console.log(`[GoalBasedStrategy] Total core tasks generated: ${tasks.length}`);
      return tasks;
      
    } catch (error) {
      console.error(`[GoalBasedStrategy] Error generating core tasks:`, error);
      return [];
    }
  }
}