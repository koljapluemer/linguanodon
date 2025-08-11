import { UpdateVocabTasksController } from './UpdateVocabTasksController';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';

let controller: UpdateVocabTasksController | null = null;

export function initializeUpdateVocabTasksService(
  vocabRepo: VocabAndTranslationRepoContract,
  taskRepo: TaskRepoContract
) {
  controller = new UpdateVocabTasksController(vocabRepo, taskRepo);
}

export async function updateVocabTasks(vocabUid: string): Promise<void> {
  if (!controller) {
    throw new Error('UpdateVocabTasksService not initialized');
  }
  await controller.updateTasksForVocab(vocabUid);
}

export async function updateMultipleVocabTasks(vocabUids: string[]): Promise<void> {
  if (!controller) {
    throw new Error('UpdateVocabTasksService not initialized');
  }
  await controller.updateTasksForMultipleVocab(vocabUids);
}

export async function updateLanguageVocabTasks(language: string): Promise<void> {
  if (!controller) {
    throw new Error('UpdateVocabTasksService not initialized');
  }
  await controller.updateTasksForLanguage(language);
}