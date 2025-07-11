import type { InjectionKey } from 'vue'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'
import type { ExerciseRepository } from '@/repositories/interfaces/ExerciseRepository'
import type { SetRepository } from '@/repositories/interfaces/SetRepository'

export const unitOfMeaningRepositoryKey = Symbol() as InjectionKey<UnitOfMeaningRepository>
export const languageRepositoryKey = Symbol() as InjectionKey<LanguageRepository>
export const taskRepositoryKey = Symbol() as InjectionKey<TaskRepository>
export const exerciseRepositoryKey = Symbol() as InjectionKey<ExerciseRepository>
export const setRepositoryKey = Symbol() as InjectionKey<SetRepository> 