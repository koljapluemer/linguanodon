import type { ExampleData } from './ExampleData';

export interface ExampleRepoContract {
  // CRUD operations
  getAllExamples(): Promise<ExampleData[]>;
  getExampleById(id: string): Promise<ExampleData | undefined>;
  saveExample(example: Partial<ExampleData>): Promise<ExampleData>;
  updateExample(example: ExampleData): Promise<void>;
  deleteExample(id: string): Promise<void>;

  // Task-related queries
  getExamplesForFreeTranslate(): Promise<ExampleData[]>;
  
  // Vocab-related queries
  getExamplesForVocabPractice(): Promise<ExampleData[]>;
}