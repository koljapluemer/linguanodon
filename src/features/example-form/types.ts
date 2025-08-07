import type { ExampleData } from '@/entities/examples/ExampleData';

export interface ExampleFormData {
  id?: string;
  language: string;
  content?: string;
  translation?: string;
  associatedVocab: string[];
}

export interface ExampleFormState {
  formData: ExampleFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
}

export function exampleDataToFormData(example: ExampleData): ExampleFormData {
  return {
    id: example.uid,
    language: example.language,
    content: example.content,
    translation: example.translation,
    associatedVocab: example.associatedVocab
  };
}

export function formDataToExampleData(formData: ExampleFormData, existingExample?: ExampleData): ExampleData {
  const baseData: ExampleData = {
    uid: formData.id || crypto.randomUUID(),
    language: formData.language,
    content: formData.content,
    translation: formData.translation,
    associatedVocab: formData.associatedVocab,
    tasks: [],
    notes: [],
    links: [],
    progress: {
      due: new Date(),
      stability: 2.5,
      difficulty: 5.0,
      elapsed_days: 0,
      scheduled_days: 1,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      streak: 0,
      level: -1
    },
    isUserCreated: true,
    lastDownloadedAt: null
  };

  if (existingExample) {
    baseData.tasks = existingExample.tasks;
    baseData.notes = existingExample.notes;
    baseData.links = existingExample.links;
    baseData.progress = existingExample.progress;
    baseData.isUserCreated = existingExample.isUserCreated;
    baseData.lastDownloadedAt = existingExample.lastDownloadedAt;
  }

  return baseData;
}