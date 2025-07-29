import { VocabAndTranslationRepo } from '@/entities/vocab/VocabAndTranslationRepo';
import { ImmersionContentRepo } from '@/entities/immersion-content/ImmersionContentRepo';
import { ExampleRepo } from '@/entities/examples/ExampleRepo';
import { GoalRepo } from '@/entities/goals/GoalRepo';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabAndTranslationRepo();
  const immersionRepo = new ImmersionContentRepo();
  const exampleRepo = new ExampleRepo();
  const goalRepo = new GoalRepo();
  
  return {
    vocabRepo,
    immersionRepo,
    exampleRepo,
    goalRepo
  };
}

export function provideRepositories(app: { provide: (key: string, value: unknown) => void }) {
  const { vocabRepo, immersionRepo, exampleRepo, goalRepo } = setupRepositories();
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('immersionRepo', immersionRepo);
  app.provide('exampleRepo', exampleRepo);
  app.provide('goalRepo', goalRepo);
  
  return { vocabRepo, immersionRepo, exampleRepo, goalRepo };
}