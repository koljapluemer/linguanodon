import { provide } from "vue";
import { WordDexieRepository } from "@/entities/words/WordDexieRepository";
import { SentenceDexieRepository } from "@/entities/sentences/SentenceDexieRepository";
import { LanguageDexieRepository } from "@/entities/languages/LanguageDexieRepository";
import { wordRepoKey, sentenceRepoKey, languageRepoKey } from "@/shared/injectionKeys";

/**
 * Provides Dexie-based repositories for all core entities.
 * Call this in the root App setup to make repos available via DI.
 */
export function provideRepositories() {
  provide(wordRepoKey, new WordDexieRepository());
  provide(sentenceRepoKey, new SentenceDexieRepository());
  provide(languageRepoKey, new LanguageDexieRepository());
} 