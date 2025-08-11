import { VocabAndTranslationRepo } from '@/entities/vocab/VocabAndTranslationRepo';
import { ExampleRepo } from '@/entities/examples/ExampleRepo';
import { GoalRepo } from '@/entities/goals/GoalRepo';
import { NoteRepo } from '@/entities/notes/NoteRepo';
import { FactCardRepo } from '@/entities/factCards/FactCardRepo';
import { ResourceRepo } from '@/entities/resources/ResourceRepo';
import { TaskRepo } from '@/entities/tasks/TaskRepo';
import { LanguageRepo } from '@/entities/languages/LanguageRepo';
import { taskRegistry, TASK_REGISTRY_INJECTION_KEY } from './taskRegistry';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabAndTranslationRepo();
  const exampleRepo = new ExampleRepo();
  const goalRepo = new GoalRepo();
  const noteRepo = new NoteRepo();
  const factCardRepo = new FactCardRepo();
  const resourceRepo = new ResourceRepo();
  const taskRepo = new TaskRepo();
  const languageRepo = new LanguageRepo();
  
  return {
    vocabRepo,
    exampleRepo,
    goalRepo,
    noteRepo,
    factCardRepo,
    resourceRepo,
    taskRepo,
    languageRepo
  };
}

export function provideRepositories(app: { provide: (key: string | symbol, value: unknown) => void }) {
  const { vocabRepo, exampleRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, taskRepo, languageRepo } = setupRepositories();
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('exampleRepo', exampleRepo);
  app.provide('goalRepo', goalRepo);
  app.provide('noteRepo', noteRepo);
  app.provide('factCardRepo', factCardRepo);
  app.provide('resourceRepo', resourceRepo);
  app.provide('taskRepo', taskRepo);
  app.provide('languageRepo', languageRepo);
  app.provide(TASK_REGISTRY_INJECTION_KEY, taskRegistry);
  
  return { vocabRepo, exampleRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, taskRepo, languageRepo };
}