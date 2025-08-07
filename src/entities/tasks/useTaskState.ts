import { ref, inject, computed, toRaw, type Ref } from 'vue';
import type { Task } from './Task';
import type { TaskRepoContract } from './TaskRepoContract';

export function useTaskState(task: Ref<Task | null> | (() => Task | null), emit: (event: 'finished') => void) {
  const taskRef = typeof task === 'function' ? computed(task) : task;
  const taskRepo = inject<TaskRepoContract>('taskRepo');
  if (!taskRepo) {
    throw new Error('TaskRepo not provided');
  }

  type TaskState = 'task' | 'evaluation' | 'do-again-decision';
  const currentState = ref<TaskState>('task');
  const isDoneEnabled = ref(false);

  const enableDone = () => {
    isDoneEnabled.value = true;
  };

  const disableDone = () => {
    isDoneEnabled.value = false;
  };

  const handleDone = () => {
    if (!taskRef.value) return;
    
    if (taskRef.value.evaluateCorrectnessAndConfidenceAfterDoing) {
      currentState.value = 'evaluation';
    } else if (taskRef.value.decideWhetherToDoAgainAfterDoing) {
      currentState.value = 'do-again-decision';
    } else {
      emit('finished');
    }
  };

  const handleSkipAndDeactivate = async () => {
    if (!taskRef.value) return;
    
    // Deep clone to strip all reactivity
    const updatedTask = JSON.parse(JSON.stringify(toRaw(taskRef.value)));
    updatedTask.isActive = false;
    
    try {
      await taskRepo.saveTask(updatedTask);
    } catch (error) {
      console.error('Failed to deactivate task:', error);
    }
    emit('finished');
  };

  const handleNotNow = () => {
    emit('finished');
  };

  const handleEvaluation = async (evaluation: { correctnessRating: number; difficultyRating: number }) => {
    if (!taskRef.value) return;
    
    // Deep clone to strip all reactivity
    const updatedTask = JSON.parse(JSON.stringify(toRaw(taskRef.value)));
    updatedTask.lastShownAt = new Date();
    updatedTask.lastDifficultyRating = evaluation.difficultyRating;
    updatedTask.lastCorrectnessRating = evaluation.correctnessRating;
    
    try {
      await taskRepo.saveTask(updatedTask);
    } catch (error) {
      console.error('Failed to save task evaluation:', error);
    }
    
    if (taskRef.value.decideWhetherToDoAgainAfterDoing) {
      currentState.value = 'do-again-decision';
    } else {
      emit('finished');
    }
  };

  const handleDoAgainDecision = async () => {
    emit('finished');
  };

  return {
    currentState,
    isDoneEnabled,
    enableDone,
    disableDone,
    handleDone,
    handleSkipAndDeactivate,
    handleNotNow,
    handleEvaluation,
    handleDoAgainDecision
  };
}