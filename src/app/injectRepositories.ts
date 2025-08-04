import { VocabAndTranslationRepo } from '@/entities/vocab/VocabAndTranslationRepo';
import { ExampleRepo } from '@/entities/examples/ExampleRepo';
import { GoalRepo } from '@/entities/goals/GoalRepo';
import { NoteRepo } from '@/entities/notes/NoteRepo';
import { FactCardRepo } from '@/entities/factCards/FactCardRepo';
import { ResourceRepo } from '@/entities/resources/ResourceRepo';
import { LanguageRepo } from '@/entities/languages/LanguageRepo';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabAndTranslationRepo();
  const exampleRepo = new ExampleRepo();
  const goalRepo = new GoalRepo();
  const noteRepo = new NoteRepo();
  const factCardRepo = new FactCardRepo();
  const resourceRepo = new ResourceRepo();
  const languageRepo = new LanguageRepo();
  
  return {
    vocabRepo,
    exampleRepo,
    goalRepo,
    noteRepo,
    factCardRepo,
    resourceRepo,
    languageRepo
  };
}

export function provideRepositories(app: { provide: (key: string, value: unknown) => void }) {
  const { vocabRepo, exampleRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, languageRepo } = setupRepositories();
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('exampleRepo', exampleRepo);
  app.provide('goalRepo', goalRepo);
  app.provide('noteRepo', noteRepo);
  app.provide('factCardRepo', factCardRepo);
  app.provide('resourceRepo', resourceRepo);
  app.provide('languageRepo', languageRepo);
  
  return { vocabRepo, exampleRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, languageRepo };
}