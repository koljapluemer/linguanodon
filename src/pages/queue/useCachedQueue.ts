import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import { useQueuePreloader } from './useQueuePreloader';
import { useQueueStateMachine } from './useQueueStateMachine';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';

export function useCachedQueue(
  vocabRepo: VocabAndTranslationRepoContract,
  goalRepo: GoalRepoContract,
  resourceRepo: ResourceRepoContract,
  taskRepo: TaskRepoContract,
  languageRepo: LanguageRepoContract,
  immersionContentRepo: ImmersionContentRepoContract
) {
  // Initialize preloader
  const preloader = useQueuePreloader(vocabRepo, goalRepo, resourceRepo, taskRepo, languageRepo, immersionContentRepo);
  
  // Initialize vocab task controller
  const vocabTaskController = new UpdateVocabTasksController(vocabRepo, taskRepo);
  
  // Initialize state machine with preloader and vocab task controller
  const stateMachine = useQueueStateMachine(preloader, vocabTaskController, vocabRepo);

  // Return the state machine interface with consistent naming for PageQueue
  return {
    // State
    state: stateMachine.state,
    
    // Current items
    currentTask: stateMachine.currentTask,
    
    // Status checks
    hasTasksAvailable: () => preloader.hasTaskReady() || stateMachine.currentTask.value !== null,
    
    // Actions (updated to use state machine)
    initializeQueue: stateMachine.initialize,
    completeCurrentTask: stateMachine.completeCurrentTask,
    
    // Computed helpers
    isLoading: stateMachine.isLoading,
    hasError: stateMachine.hasError,
    isEmpty: stateMachine.isEmpty,
    
    // Debug access
    preloaderStatus: preloader.status,
    stateMachineDebug: {
      retry: stateMachine.retry
    }
  };
}