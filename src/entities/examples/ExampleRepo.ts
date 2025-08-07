import { ExampleStorage } from './ExampleStorage';
import type { ExampleRepoContract } from './ExampleRepoContract';
import type { ExampleData } from './ExampleData';
import { createEmptyCard } from 'ts-fsrs';

export class ExampleRepo implements ExampleRepoContract {
  private storage = new ExampleStorage();

  private ensureExampleFields(example: ExampleData): ExampleData {
    return {
      ...example,
      content: example.content || '',
      translation: example.translation || '',
      situation: example.situation,
      associatedVocab: example.associatedVocab || [],
      tasks: example.tasks || [],
      notes: example.notes || [],
      links: example.links || [],
      prio: example.prio,
      doNotPractice: example.doNotPractice,
      license: example.license,
      owner: example.owner,
      sources: example.sources || []
    };
  }

  async getAllExamples(): Promise<ExampleData[]> {
    const examples = await this.storage.getAll();
    return examples.map(e => this.ensureExampleFields(e));
  }

  async getExampleById(uid: string): Promise<ExampleData | undefined> {
    const example = await this.storage.getById(uid);
    return example ? this.ensureExampleFields(example) : undefined;
  }

  async saveExample(example: Partial<ExampleData>): Promise<ExampleData> {
    const newExample: ExampleData = {
      uid: example.uid || crypto.randomUUID(),
      language: example.language || '',
      content: example.content,
      translation: example.translation,
      situation: example.situation,
      associatedVocab: example.associatedVocab || [],
      tasks: example.tasks || [],
      notes: example.notes || [],
      links: example.links || [],
      prio: example.prio,
      progress: example.progress || {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      },
      doNotPractice: example.doNotPractice,
      license: example.license,
      owner: example.owner,
      sources: example.sources || [],
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
    
    return allExamples.filter(example => {
      // Must not be user created
      if (example.isUserCreated) return false;
      
      // TODO: Update to use TaskRepo to check for free-translate tasks
      // For now, return true to enable all non-user-created examples
      return true;
    }).map(e => this.ensureExampleFields(e));
  }

  async getExamplesForVocabPractice(): Promise<ExampleData[]> {
    const allExamples = await this.storage.getAll();
    
    return allExamples.filter(example => {
      // Must not be user created
      if (example.isUserCreated) return false;
      
      // TODO: Update to use TaskRepo to check for free-translate tasks
      // For now, return true to enable all non-user-created examples
      return true;
    }).map(e => this.ensureExampleFields(e));
  }
}