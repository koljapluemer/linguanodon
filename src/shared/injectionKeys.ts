import type { InjectionKey } from "vue";
import type { WordRepository } from "@/entities/words/WordRepository";
import type { SentenceRepository } from "@/entities/sentences/SentenceRepository";
import type { LanguageRepository } from "@/entities/languages/LanguageRepository";
import type { LearningEventRepository } from "@/entities/learning-events/LearningEventRepository";

export const wordRepoKey: InjectionKey<WordRepository> = Symbol("WordRepository");
export const sentenceRepoKey: InjectionKey<SentenceRepository> = Symbol("SentenceRepository");
export const languageRepoKey: InjectionKey<LanguageRepository> = Symbol("LanguageRepository");
export const learningEventRepoKey: InjectionKey<LearningEventRepository> = Symbol("LearningEventRepository"); 