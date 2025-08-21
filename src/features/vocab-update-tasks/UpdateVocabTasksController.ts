import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import { VocabTaskCoordinator } from './VocabTaskCoordinator';
import { toRaw } from 'vue';

export class UpdateVocabTasksController {
  private coordinator = new VocabTaskCoordinator();

  constructor(
    private vocabRepo: VocabRepoContract,
    private translationRepo: TranslationRepoContract,
    private taskRepo: TaskRepoContract,
    private noteRepo: NoteRepoContract
  ) {}

  /**
   * Update tasks for a vocabulary unit based on its current progress level
   */
  async updateTasksForVocab(vocabUid: string): Promise<void> {
    const vocab = await this.vocabRepo.getVocabByUID(vocabUid);
    if (!vocab) return;

    const [translations, notes] = await Promise.all([
      this.translationRepo.getTranslationsByIds(vocab.translations),
      this.noteRepo.getNotesByUIDs(vocab.notes)
    ]);

    // Get what tasks should exist for this vocab's current state
    const applicableTasks = this.coordinator.generateApplicableTasks(vocab, translations, notes);
    const applicableTaskTypes = new Set(applicableTasks.map(t => t.taskType));

    // Get existing active tasks for this vocab
    const existingTasks = await this.taskRepo.getTasksByVocabId(vocab.uid);
    const activeTasks = existingTasks.filter(task => task.isActive);

    // Check if we already have the right tasks active
    const activeTaskTypes = new Set(activeTasks.map(t => t.taskType));
    const hasCorrectActiveTasks = [...applicableTaskTypes].every(type => activeTaskTypes.has(type)) &&
                                  [...activeTaskTypes].every(type => applicableTaskTypes.has(type));

    if (hasCorrectActiveTasks) {
      return; // Nothing to do
    }

    // Deactivate tasks that no longer apply
    const tasksToDeactivate = activeTasks.filter(task => !applicableTaskTypes.has(task.taskType));
    for (const task of tasksToDeactivate) {
      await this.taskRepo.saveTask(toRaw({ ...task, isActive: false }));
    }

    // Create missing tasks
    const existingTaskTypes = new Set(existingTasks.map(t => t.taskType));
    const tasksToCreate = applicableTasks.filter(task => !existingTaskTypes.has(task.taskType));
    const newTaskUids: string[] = [];

    for (const taskData of tasksToCreate) {
      await this.taskRepo.saveTask(toRaw(taskData));
      newTaskUids.push(taskData.uid);
    }

    // Update vocab with new task references if any were created
    if (newTaskUids.length > 0) {
      const updatedVocab: VocabData = {
        ...vocab,
        tasks: [...vocab.tasks, ...newTaskUids]
      };
      await this.vocabRepo.updateVocab(toRaw(updatedVocab));
    }
  }

  /**
   * Update tasks for multiple vocab units (batch operation)
   */
  async updateTasksForMultipleVocab(vocabUids: string[]): Promise<void> {
    for (const uid of vocabUids) {
      await this.updateTasksForVocab(uid);
    }
  }

  /**
   * Update tasks for all vocab in a language
   */
  async updateTasksForLanguage(language: string): Promise<void> {
    const vocabList = await this.vocabRepo.getDueVocabInLanguage(language);
    const vocabUids = vocabList.map(v => v.uid);
    await this.updateTasksForMultipleVocab(vocabUids);
  }
}