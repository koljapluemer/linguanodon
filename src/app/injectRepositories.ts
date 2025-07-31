import { VocabAndTranslationRepo } from '@/entities/vocab/VocabAndTranslationRepo';
import { ImmersionContentRepo } from '@/entities/immersion-content/ImmersionContentRepo';
import { ExampleRepo } from '@/entities/examples/ExampleRepo';
import { GoalRepo } from '@/entities/goals/GoalRepo';
import { NoteRepo } from '@/entities/notes/NoteRepo';
import { FactCardRepo } from '@/entities/factCards/FactCardRepo';
import { ResourceRepo } from '@/entities/resources/ResourceRepo';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabAndTranslationRepo();
  const immersionRepo = new ImmersionContentRepo();
  const exampleRepo = new ExampleRepo();
  const goalRepo = new GoalRepo();
  const noteRepo = new NoteRepo();
  const factCardRepo = new FactCardRepo();
  const resourceRepo = new ResourceRepo();
  
  return {
    vocabRepo,
    immersionRepo,
    exampleRepo,
    goalRepo,
    noteRepo,
    factCardRepo,
    resourceRepo
  };
}

export function provideRepositories(app: { provide: (key: string, value: unknown) => void }) {
  const { vocabRepo, immersionRepo, exampleRepo, goalRepo, noteRepo, factCardRepo, resourceRepo } = setupRepositories();
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('immersionRepo', immersionRepo);
  app.provide('exampleRepo', exampleRepo);
  app.provide('goalRepo', goalRepo);
  app.provide('noteRepo', noteRepo);
  app.provide('factCardRepo', factCardRepo);
  app.provide('resourceRepo', resourceRepo);
  
  return { vocabRepo, immersionRepo, exampleRepo, goalRepo, noteRepo, factCardRepo, resourceRepo };
}