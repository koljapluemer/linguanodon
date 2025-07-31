import { VocabAndTranslationRepo } from '@/entities/vocab/VocabAndTranslationRepo';
import { ImmersionContentRepo } from '@/entities/immersion-content/ImmersionContentRepo';
import { ExampleRepo } from '@/entities/examples/ExampleRepo';
import { GoalRepo } from '@/entities/goals/GoalRepo';
import { NoteRepo } from '@/entities/notes/NoteRepo';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabAndTranslationRepo();
  const immersionRepo = new ImmersionContentRepo();
  const exampleRepo = new ExampleRepo();
  const goalRepo = new GoalRepo();
  const noteRepo = new NoteRepo();
  
  return {
    vocabRepo,
    immersionRepo,
    exampleRepo,
    goalRepo,
    noteRepo
  };
}

export function provideRepositories(app: { provide: (key: string, value: unknown) => void }) {
  const { vocabRepo, immersionRepo, exampleRepo, goalRepo, noteRepo } = setupRepositories();
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('immersionRepo', immersionRepo);
  app.provide('exampleRepo', exampleRepo);
  app.provide('goalRepo', goalRepo);
  app.provide('noteRepo', noteRepo);
  
  return { vocabRepo, immersionRepo, exampleRepo, goalRepo, noteRepo };
}