import type { TaskData } from '@/entities/tasks/Task';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomFromArray } from '@/shared/arrayUtils';
import { getRandomActiveTaskForVocab } from '../utils/getRandomActiveTaskForVocab';

const MAX_NEW_VOCAB_FROM_GOAL = 3;

export class GoalBasedStrategy extends BaseLessonStrategy {
  constructor(dependencies: LessonStrategyDependencies) {
    super(dependencies);
  }

  protected async generateCoreTasks(
    languages: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _targetTaskCount: number
  ): Promise<TaskData[]> {
    const tasks: TaskData[] = [];
    const usedVocabIds = new Set<string>();
    
    try {
      // Get all incomplete goals
      const incompleteGoals = await this.goalRepo.getIncompleteGoals();
      console.log(`[GoalBasedStrategy] Found ${incompleteGoals.length} incomplete goals`);
      
      // Filter goals that have vocab in active languages and at least one active task
      const eligibleGoals = [];
      for (const goal of incompleteGoals) {
        if (languages.includes(goal.language) && goal.vocab.length > 0 && goal.tasks.length > 0) {
          // Check if goal has at least one active task
          const goalTasks = await Promise.all(
            goal.tasks.map(taskId => this.taskRepo.getTaskById(taskId))
          );
          const activeTasks = goalTasks.filter(task => task && task.isActive);
          
          if (activeTasks.length > 0) {
            eligibleGoals.push(goal);
          }
        }
      }
      
      console.log(`[GoalBasedStrategy] Found ${eligibleGoals.length} eligible goals with active tasks`);
      
      if (eligibleGoals.length === 0) {
        return tasks;
      }
      
      // Pick a random eligible goal
      const selectedGoal = randomFromArray(eligibleGoals);
      if (!selectedGoal) {
        return tasks;
      }
      
      console.log(`[GoalBasedStrategy] Selected goal: ${selectedGoal.title} (${selectedGoal.uid})`);
      
      // Pick a random task from the goal
      const goalTasks = await Promise.all(
        selectedGoal.tasks.map(taskId => this.taskRepo.getTaskById(taskId))
      );
      const activeTasks = goalTasks.filter(task => task && task.isActive);
      const randomTask = randomFromArray(activeTasks);
      
      if (randomTask) {
        console.log(`[GoalBasedStrategy] Adding random task from goal: ${randomTask.taskType}`);
        tasks.push(randomTask);
        
        // Mark associated vocab as used
        if (randomTask.associatedVocab) {
          randomTask.associatedVocab.forEach(vocabUid => usedVocabIds.add(vocabUid));
        }
      }
      
      // Find new/unseen vocab attached to this goal (max 3)
      const unusedVocabIds = selectedGoal.vocab.filter(vocabId => !usedVocabIds.has(vocabId));
      const newVocab = await this.vocabRepo.getUnseenVocabByIds(unusedVocabIds);
      
      console.log(`[GoalBasedStrategy] Found ${newVocab.length} unseen vocab in goal`);
      
      const selectedNewVocab = newVocab.slice(0, MAX_NEW_VOCAB_FROM_GOAL);
      for (const vocab of selectedNewVocab) {
        const task = await getRandomActiveTaskForVocab(this.taskRepo, vocab.uid);
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
        const task = await getRandomActiveTaskForVocab(this.taskRepo, vocab.uid);
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