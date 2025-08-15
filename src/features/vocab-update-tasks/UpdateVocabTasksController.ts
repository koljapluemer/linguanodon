import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { toRaw } from 'vue';

export class UpdateVocabTasksController {
  constructor(
    private vocabRepo: VocabAndTranslationRepoContract,
    private taskRepo: TaskRepoContract
  ) {}

  /**
   * Update tasks for a vocabulary unit based on its current progress level
   */
  async updateTasksForVocab(vocabUid: string): Promise<void> {
    const vocab = await this.vocabRepo.getVocabByUID(vocabUid);
    if (!vocab) return;

    const translations = await this.vocabRepo.getTranslationsByIds(vocab.translations);
    if (translations.length === 0) return;

    // Check if we already have active tasks for the current level
    const hasActiveTasksForCurrentLevel = await this.checkActiveTasksForLevel(vocab);
    if (hasActiveTasksForCurrentLevel) {
      return; // No need to create new tasks
    }

    // Delete tasks that no longer apply to current level
    await this.deleteOutdatedTasks(vocab);
    
    // Get updated vocab after task deletion
    const updatedVocab = await this.vocabRepo.getVocabByUID(vocab.uid);
    if (!updatedVocab) return;
    
    // Generate appropriate tasks based on level
    const newTasks = await this.generateTasksForLevel(updatedVocab, translations);
    
    // Save new tasks and update vocab.tasks array
    const taskUids: string[] = [];
    
    for (const taskData of newTasks) {
      await this.taskRepo.saveTask(toRaw(taskData));
      taskUids.push(taskData.uid);
    }
    
    // Update vocab with new task references
    const finalVocab: VocabData = {
      ...updatedVocab,
      tasks: [...updatedVocab.tasks, ...taskUids]
    };
    
    await this.vocabRepo.updateVocab(toRaw(finalVocab));
  }

  /**
   * Check if vocab already has active tasks appropriate for its current level
   */
  private async checkActiveTasksForLevel(vocab: VocabData): Promise<boolean> {
    if (vocab.tasks.length === 0) return false;

    // Get existing tasks for this vocab
    const existingTasks = await this.taskRepo.getTasksByVocabId(vocab.uid);
    const activeTasks = existingTasks.filter(task => task.isActive);
    
    if (activeTasks.length === 0) return false;

    const level = vocab.progress.level;
    
    // Check if we have active tasks matching the current level
    for (const task of activeTasks) {
      const matchesLevel = this.taskMatchesLevel(task, level);
      if (matchesLevel) {
        return true; // Found an active task for this level
      }
    }
    
    return false;
  }

  /**
   * Check if a task matches the given level
   */
  private taskMatchesLevel(task: TaskData, level: number): boolean {
    switch (level) {
      case -1:
        return task.taskType === 'vocab-try-to-remember';
      case 0:
        return task.taskType === 'vocab-choose-from-options' && 
               task.title.includes('two-vocab-to-translation');
      case 1:
      case 2:
        return task.taskType === 'vocab-choose-from-options';
      case 3:
      case 4:
      default:
        return task.taskType === 'vocab-reveal';
    }
  }

  /**
   * Generate tasks based on vocab progress level (mirrors ExerciseGenerator logic)
   */
  private async generateTasksForLevel(vocab: VocabData, translations: TranslationData[]): Promise<TaskData[]> {
    const level = vocab.progress.level;
    const tasks: TaskData[] = [];
    const baseUid = `vocab-task-${vocab.uid}-${Date.now()}`;

    switch (level) {
      case -1:
        tasks.push(this.createTryToRememberTask(baseUid + '-remember', vocab, translations));
        break;
        
      case 0:
        tasks.push(this.createChooseFromOptionsTask(
          baseUid + '-choose-two', 
          vocab, 
          translations, 
          'vocab-to-translation', 
          2
        ));
        break;
        
      case 1:
        // Random choice between choose-from-four vocab→translation OR choose-from-two translation→vocab
        if (Math.random() < 0.5) {
          tasks.push(this.createChooseFromOptionsTask(
            baseUid + '-choose-four-vt', 
            vocab, 
            translations, 
            'vocab-to-translation', 
            4
          ));
        } else {
          tasks.push(this.createChooseFromOptionsTask(
            baseUid + '-choose-two-tv', 
            vocab, 
            translations, 
            'translation-to-vocab', 
            2
          ));
        }
        break;
        
      case 2:
        // Random choice between choose-from-four vocab→translation OR choose-from-four translation→vocab
        if (Math.random() < 0.5) {
          tasks.push(this.createChooseFromOptionsTask(
            baseUid + '-choose-four-vt', 
            vocab, 
            translations, 
            'vocab-to-translation', 
            4
          ));
        } else {
          tasks.push(this.createChooseFromOptionsTask(
            baseUid + '-choose-four-tv', 
            vocab, 
            translations, 
            'translation-to-vocab', 
            4
          ));
        }
        break;
        
      case 3:
        tasks.push(this.createRevealTask(baseUid + '-reveal', vocab, translations, false));
        break;
        
      case 4:
        // Random choice between reveal vocab→translation OR reveal translation→vocab(s)
        if (Math.random() < 0.5) {
          tasks.push(this.createRevealTask(baseUid + '-reveal', vocab, translations, false));
        } else {
          tasks.push(this.createRevealTask(baseUid + '-reveal-reverse', vocab, translations, true));
        }
        break;
        
      default:
        // Fallback for levels > 4
        tasks.push(this.createRevealTask(baseUid + '-reveal', vocab, translations, false));
        break;
    }

    return tasks;
  }

  private createTryToRememberTask(uid: string, vocab: VocabData, translations: TranslationData[]): TaskData {
    const translationTexts = translations.map(t => t.content).join(', ');
    
    return {
      uid,
      taskType: 'vocab-try-to-remember',
      title: vocab.content || 'Unknown vocab',
      prompt: `How hard is this word to remember? Solution: ${translationTexts}`,
      evaluateDifficultyAfterDoing: false,
      decideWhetherToDoAgainAfterDoing: false,
      isOneTime: false,
      isActive: true,
      taskSize: 'small',
      associatedVocab: [vocab.uid]
    };
  }

  private createRevealTask(uid: string, vocab: VocabData, translations: TranslationData[], isReverse: boolean): TaskData {
    if (isReverse) {
      const randomTranslation = translations[Math.floor(Math.random() * translations.length)];
      const solution = vocab.content || '';
      
      return {
        uid,
        taskType: 'vocab-reveal',
        title: `reverse-${randomTranslation.content}`,
        prompt: `What vocab has this translation? Solution: ${solution}`,
        evaluateDifficultyAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: false,
        isOneTime: false,
        isActive: true,
        taskSize: 'small',
        associatedVocab: [vocab.uid]
      };
    } else {
      const translationTexts = translations.slice(0, 8).map(t => t.content).join(', ');
      const hasMore = translations.length > 8;
      const solution = hasMore ? `${translationTexts}...` : translationTexts;
      
      return {
        uid,
        taskType: 'vocab-reveal',
        title: vocab.content || 'Unknown vocab',
        prompt: `What does this mean? Solution: ${solution}`,
        evaluateDifficultyAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: false,
        isOneTime: false,
        isActive: true,
        taskSize: 'small',
        associatedVocab: [vocab.uid]
      };
    }
  }

  private createChooseFromOptionsTask(
    uid: string, 
    vocab: VocabData, 
    translations: TranslationData[], 
    direction: 'vocab-to-translation' | 'translation-to-vocab',
    optionCount: number
  ): TaskData {
    const isReverse = direction === 'translation-to-vocab';
    const title = isReverse 
      ? `${optionCount === 4 ? 'four' : 'two'}-translation-to-vocab-${vocab.content}`
      : `${optionCount === 4 ? 'four' : 'two'}-vocab-to-translation-${vocab.content}`;
    
    const prompt = isReverse 
      ? `Choose the correct vocab for: ${translations[0]?.content || ''}`
      : `Choose the correct translation for: ${vocab.content || ''}`;

    return {
      uid,
      taskType: 'vocab-choose-from-options',
      title,
      prompt,
      evaluateDifficultyAfterDoing: false,
      decideWhetherToDoAgainAfterDoing: false,
      isOneTime: false,
      isActive: true,
      taskSize: 'small',
      associatedVocab: [vocab.uid]
    };
  }

  /**
   * Delete tasks that no longer apply to current vocab level
   */
  private async deleteOutdatedTasks(vocab: VocabData): Promise<void> {
    if (vocab.tasks.length === 0) return;

    // Get existing tasks for this vocab
    const existingTasks = await this.taskRepo.getTasksByVocabId(vocab.uid);
    const level = vocab.progress.level;
    const tasksToDelete: string[] = [];
    const tasksToKeep: string[] = [];

    for (const task of existingTasks) {
      let shouldDelete = false;

      // Delete tasks that don't match current level
      switch (level) {
        case -1:
          shouldDelete = task.taskType !== 'vocab-try-to-remember';
          break;
        case 0:
          shouldDelete = task.taskType !== 'vocab-choose-from-options' || 
                           !task.title.includes('two-vocab-to-translation');
          break;
        case 1:
        case 2:
          shouldDelete = task.taskType === 'vocab-try-to-remember';
          break;
        case 3:
          shouldDelete = task.taskType === 'vocab-choose-from-options';
          break;
        default:
          // Level 4+ keeps reveal tasks
          shouldDelete = task.taskType === 'vocab-choose-from-options';
          break;
      }

      if (shouldDelete) {
        tasksToDelete.push(task.uid);
      } else {
        tasksToKeep.push(task.uid);
      }
    }

    // Delete outdated tasks
    for (const taskUid of tasksToDelete) {
      await this.taskRepo.deleteTask(taskUid);
      console.log(`Deleted outdated task: ${taskUid}`);
    }

    // Update vocab tasks array to only contain valid tasks
    if (tasksToDelete.length > 0) {
      const updatedVocab: VocabData = {
        ...vocab,
        tasks: tasksToKeep
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