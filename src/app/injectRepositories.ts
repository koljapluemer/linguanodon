import { VocabAndTranslationRepo } from '@/entities/vocab/VocabAndTranslationRepo';
import { GoalRepo } from '@/entities/goals/GoalRepo';
import { NoteRepo } from '@/entities/notes/NoteRepo';
import { FactCardRepo } from '@/entities/factCards/FactCardRepo';
import { ResourceRepo } from '@/entities/resources/ResourceRepo';
import { ImmersionContentRepo } from '@/entities/immersion-content/ImmersionContentRepo';
import { TaskRepo } from '@/entities/tasks/TaskRepo';
import { LanguageRepo } from '@/entities/languages/LanguageRepo';
import { initializeUpdateVocabTasksService } from '@/features/vocab-update-tasks/updateVocabTasksService';
import { initializeUpdateGoalTasksService } from '@/features/goal-update-tasks/updateGoalTasksService';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabAndTranslationRepo();
  const goalRepo = new GoalRepo();
  const noteRepo = new NoteRepo();
  const factCardRepo = new FactCardRepo();
  const resourceRepo = new ResourceRepo();
  const immersionContentRepo = new ImmersionContentRepo();
  const taskRepo = new TaskRepo();
  const languageRepo = new LanguageRepo();
  
  return {
    vocabRepo,
    goalRepo,
    noteRepo,
    factCardRepo,
    resourceRepo,
    immersionContentRepo,
    taskRepo,
    languageRepo
  };
}

export function provideRepositories(app: { provide: (key: string | symbol, value: unknown) => void }) {
  const { vocabRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, immersionContentRepo, taskRepo, languageRepo } = setupRepositories();
  
  // Initialize the vocab tasks service
  initializeUpdateVocabTasksService(vocabRepo, taskRepo);
  
  // Initialize the goal tasks service
  initializeUpdateGoalTasksService(goalRepo, taskRepo);
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('goalRepo', goalRepo);
  app.provide('noteRepo', noteRepo);
  app.provide('factCardRepo', factCardRepo);
  app.provide('resourceRepo', resourceRepo);
  app.provide('immersionContentRepo', immersionContentRepo);
  app.provide('taskRepo', taskRepo);
  app.provide('languageRepo', languageRepo);
  
  return { vocabRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, immersionContentRepo, taskRepo, languageRepo };
}