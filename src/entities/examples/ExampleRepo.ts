import { ExampleStorage } from './ExampleStorage';
import type { ExampleRepoContract } from './ExampleRepoContract';
import type { ExampleData } from './ExampleData';

export class ExampleRepo implements ExampleRepoContract {
  private storage = new ExampleStorage();

  private ensureExampleFields(example: ExampleData): ExampleData {
    return {
      ...example,
      content: example.content || '',
      translation: example.translation || '',
      associatedVocab: example.associatedVocab || [],
      associatedTasks: example.associatedTasks || []
    };
  }

  async getAllExamples(): Promise<ExampleData[]> {
    const examples = await this.storage.getAll();
    return examples.map(e => this.ensureExampleFields(e));
  }

  async getExampleById(id: string): Promise<ExampleData | undefined> {
    const example = await this.storage.getById(id);
    return example ? this.ensureExampleFields(example) : undefined;
  }

  async saveExample(example: Partial<ExampleData>): Promise<ExampleData> {
    const newExample: ExampleData = {
      uid: example.uid || crypto.randomUUID(),
      language: example.language || '',
      content: example.content,
      translation: example.translation,
      associatedVocab: example.associatedVocab || [],
      associatedTasks: example.associatedTasks || [],
      isUserCreated: example.isUserCreated ?? true,
      lastDownloadedAt: example.lastDownloadedAt || null
    };

    await this.storage.add(newExample);
    return newExample;
  }

  async updateExample(example: ExampleData): Promise<void> {
    await this.storage.update(example);
  }

  async deleteExample(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async getExamplesForFreeTranslate(): Promise<ExampleData[]> {
    const allExamples = await this.storage.getAll();
    const now = new Date();
    
    return allExamples.filter(example => {
      // Must not be user created
      if (example.isUserCreated) return false;
      
      // Check for existing free-translate task
      const freeTranslateTask = example.associatedTasks.find(task => task.taskType === 'free-translate');
      
      if (freeTranslateTask) {
        // Has task: check if due and wants to do again
        const isDue = !freeTranslateTask.nextShownEarliestAt || freeTranslateTask.nextShownEarliestAt <= now;
        const wantsToDoAgain = freeTranslateTask.wantToDoAgain;
        return isDue && wantsToDoAgain;
      } else {
        // No task: eligible if never done
        return true;
      }
    }).map(e => this.ensureExampleFields(e));
  }

  async getExamplesForVocabPractice(): Promise<ExampleData[]> {
    const allExamples = await this.storage.getAll();
    const now = new Date();
    
    return allExamples.filter(example => {
      // Must not be user created
      if (example.isUserCreated) return false;
      
      // Check if due for free-translate or never done
      const freeTranslateTask = example.associatedTasks.find(task => task.taskType === 'free-translate');
      const isDueOrNeverDone = !freeTranslateTask || 
                               !freeTranslateTask.nextShownEarliestAt || 
                               freeTranslateTask.nextShownEarliestAt <= now;
      
      return isDueOrNeverDone;
    }).map(e => this.ensureExampleFields(e));
  }
}