import type { InjectionKey } from "vue";
import type { WordRepository, SentenceRepository, LinguisticUnitProgressRepository } from "@/entities/linguisticUnits";
import type { LanguageRepository } from "@/entities/languages/LanguageRepository";
import type { LearningEventRepository } from "@/entities/learning-events/LearningEventRepository";

export const wordRepoKey: InjectionKey<WordRepository> = Symbol("WordRepository");
export const sentenceRepoKey: InjectionKey<SentenceRepository> = Symbol("SentenceRepository");
export const languageRepoKey: InjectionKey<LanguageRepository> = Symbol("LanguageRepository");
export const learningEventRepoKey: InjectionKey<LearningEventRepository> = Symbol("LearningEventRepository");
export const linguisticUnitProgressRepoKey: InjectionKey<LinguisticUnitProgressRepository> = Symbol("LinguisticUnitProgressRepository"); 