import { VocabAndTranslationRepo } from '@/entities/vocab/VocabAndTranslationRepo';
import { ImmersionContentRepo } from '@/entities/immersion-content/ImmersionContentRepo';
import { TASK_REGISTRY } from '@/pages/queue/propose-which-task-to-do/TaskRegistry';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabAndTranslationRepo();
  const immersionRepo = new ImmersionContentRepo();
  
  // Configure task proposers with repositories
  const addPronunciationProposer = TASK_REGISTRY['add-pronunciation'].proposer as { setVocabRepo?: (repo: VocabAndTranslationRepo) => void };
  if (addPronunciationProposer.setVocabRepo) {
    addPronunciationProposer.setVocabRepo(vocabRepo);
  }
  
  const immersionContentProposer = TASK_REGISTRY['immersion-content'].proposer as { setImmersionRepo?: (repo: ImmersionContentRepo) => void };
  if (immersionContentProposer.setImmersionRepo) {
    immersionContentProposer.setImmersionRepo(immersionRepo);
  }
  
  return {
    vocabRepo,
    immersionRepo
  };
}

export function provideRepositories(app: { provide: (key: string, value: unknown) => void }) {
  const { vocabRepo, immersionRepo } = setupRepositories();
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('immersionRepo', immersionRepo);
  
  return { vocabRepo, immersionRepo };
}