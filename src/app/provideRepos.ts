import { provide } from "vue";
import { WordDexieRepository, SentenceDexieRepository, LinguisticUnitProgressDexieRepository } from "@/entities/linguisticUnits";
import { LanguageDexieRepository } from "@/entities/languages/LanguageDexieRepository";
import { LearningEventDexieRepository } from "@/entities/learning-events/LearningEventDexieRepository";
import { wordRepoKey, sentenceRepoKey, languageRepoKey, learningEventRepoKey, linguisticUnitProgressRepoKey } from "@/shared/injectionKeys";

/**
 * Provides Dexie-based repositories for all core entities.
 * Call this in the root App setup to make repos available via DI.
 */
export function provideRepositories() {
  provide(wordRepoKey, new WordDexieRepository());
  provide(sentenceRepoKey, new SentenceDexieRepository());
  provide(languageRepoKey, new LanguageDexieRepository());
  provide(learningEventRepoKey, new LearningEventDexieRepository());
  provide(linguisticUnitProgressRepoKey, new LinguisticUnitProgressDexieRepository());
} 