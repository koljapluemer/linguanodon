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

    // Generate appropriate tasks based on level
    const newTasks = await this.generateTasksForLevel(vocab, translations);
    
    // Update existing tasks to inactive if they no longer apply
    await this.deactivateOutdatedTasks(vocab);
    
    // Save new tasks and update vocab.tasks array
    const taskUids: string[] = [];
    
    for (const taskData of newTasks) {
      await this.taskRepo.saveTask(toRaw(taskData));
      taskUids.push(taskData.uid);
    }
    
    // Update vocab with new task references
    const updatedVocab: VocabData = {
      ...vocab,
      tasks: [...vocab.tasks, ...taskUids]
    };
    
    await this.vocabRepo.updateVocab(toRaw(updatedVocab));
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
      evaluateCorrectnessAndConfidenceAfterDoing: false,
      decideWhetherToDoAgainAfterDoing: false,
      isActive: true,
      taskSize: 'small',
      associatedUnits: [{ type: 'Vocab', uid: vocab.uid }]
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
        evaluateCorrectnessAndConfidenceAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: false,
        isActive: true,
        taskSize: 'small',
        associatedUnits: [{ type: 'Vocab', uid: vocab.uid }]
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
        evaluateCorrectnessAndConfidenceAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: false,
        isActive: true,
        taskSize: 'small',
        associatedUnits: [{ type: 'Vocab', uid: vocab.uid }]
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
      evaluateCorrectnessAndConfidenceAfterDoing: false,
      decideWhetherToDoAgainAfterDoing: false,
      isActive: true,
      taskSize: 'small',
      associatedUnits: [{ type: 'Vocab', uid: vocab.uid }]
    };
  }

  /**
   * Deactivate tasks that no longer apply to current vocab level
   */
  private async deactivateOutdatedTasks(vocab: VocabData): Promise<void> {
    if (vocab.tasks.length === 0) return;

    // TODO: Implement batch getByIds or loop through individual gets
    const existingTasks: TaskData[] = [];
    const level = vocab.progress.level;

    for (const task of existingTasks) {
      let shouldDeactivate = false;

      // Deactivate tasks that don't match current level
      switch (level) {
        case -1:
          shouldDeactivate = task.taskType !== 'vocab-try-to-remember';
          break;
        case 0:
          shouldDeactivate = task.taskType !== 'vocab-choose-from-options' || 
                           !task.title.includes('two-vocab-to-translation');
          break;
        case 1:
        case 2:
          shouldDeactivate = task.taskType === 'vocab-try-to-remember';
          break;
        case 3:
          shouldDeactivate = task.taskType === 'vocab-choose-from-options';
          break;
        default:
          // Level 4+ keeps reveal tasks
          shouldDeactivate = task.taskType === 'vocab-choose-from-options';
          break;
      }

      if (shouldDeactivate && task.isActive) {
        const updatedTask: TaskData = { ...task, isActive: false };
        await this.taskRepo.saveTask(toRaw(updatedTask));
      }
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