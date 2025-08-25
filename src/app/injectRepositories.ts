import { VocabRepo } from '@/entities/vocab/VocabRepo';
import { TranslationRepo } from '@/entities/translations/TranslationRepo';
import { GoalRepo } from '@/entities/goals/GoalRepo';
import { NoteRepo } from '@/entities/notes/NoteRepo';
import { FactCardRepo } from '@/entities/fact-cards/FactCardRepo';
import { ResourceRepo } from '@/entities/resources/ResourceRepo';
import { ImmersionContentRepo } from '@/entities/immersion-content/ImmersionContentRepo';
import { LanguageRepo } from '@/entities/languages/LanguageRepo';
import { LocalSetRepo } from '@/entities/local-sets/LocalSetRepo';

export function setupRepositories() {
  // Create repository instances
  const vocabRepo = new VocabRepo();
  const translationRepo = new TranslationRepo();
  const goalRepo = new GoalRepo();
  const noteRepo = new NoteRepo();
  const factCardRepo = new FactCardRepo();
  const resourceRepo = new ResourceRepo();
  const immersionContentRepo = new ImmersionContentRepo();
  const languageRepo = new LanguageRepo();
  const localSetRepo = new LocalSetRepo();
  
  return {
    vocabRepo,
    translationRepo,
    goalRepo,
    noteRepo,
    factCardRepo,
    resourceRepo,
    immersionContentRepo,
    languageRepo,
    localSetRepo
  };
}

export function provideRepositories(app: { provide: (key: string | symbol, value: unknown) => void }) {
  const { vocabRepo, translationRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, immersionContentRepo, languageRepo, localSetRepo } = setupRepositories();
  
  app.provide('vocabRepo', vocabRepo);
  app.provide('translationRepo', translationRepo);
  app.provide('goalRepo', goalRepo);
  app.provide('noteRepo', noteRepo);
  app.provide('factCardRepo', factCardRepo);
  app.provide('resourceRepo', resourceRepo);
  app.provide('immersionContentRepo', immersionContentRepo);
  app.provide('languageRepo', languageRepo);
  app.provide('localSetRepo', localSetRepo);
  
  return { vocabRepo, translationRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, immersionContentRepo, languageRepo, localSetRepo };
}