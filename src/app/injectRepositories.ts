import { VocabAndTranslationRepo } from '@/entities/vocab/VocabAndTranslationRepo';
import { ImmersionContentRepo } from '@/entities/immersion-content/ImmersionContentRepo';
import { ExampleRepo } from '@/entities/examples/ExampleRepo';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabAndTranslationRepo();
  const immersionRepo = new ImmersionContentRepo();
  const exampleRepo = new ExampleRepo();
  
  return {
    vocabRepo,
    immersionRepo,
    exampleRepo
  };
}

export function provideRepositories(app: { provide: (key: string, value: unknown) => void }) {
  const { vocabRepo, immersionRepo, exampleRepo } = setupRepositories();
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('immersionRepo', immersionRepo);
  app.provide('exampleRepo', exampleRepo);
  
  return { vocabRepo, immersionRepo, exampleRepo };
}