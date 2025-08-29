import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';

export interface TaskGeneratorContext {
  vocabRepo: VocabRepoContract;
  translationRepo: TranslationRepoContract;
  resourceRepo: ResourceRepoContract;
  languageRepo: LanguageRepoContract;
  goalRepo: GoalRepoContract;
  noteRepo: NoteRepoContract;
  languageCodes: string[];
  vocabBlockList: string[];
}