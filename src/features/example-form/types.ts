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
    id: example.id,
    language: example.language,
    content: example.content,
    translation: example.translation,
    associatedVocab: example.associatedVocab
  };
}

export function formDataToExampleData(formData: ExampleFormData, existingExample?: ExampleData): ExampleData {
  const baseData: ExampleData = {
    id: formData.id || crypto.randomUUID(),
    language: formData.language,
    content: formData.content,
    translation: formData.translation,
    associatedVocab: formData.associatedVocab,
    associatedTasks: [],
    isUserCreated: true,
    lastDownloadedAt: null
  };

  if (existingExample) {
    baseData.associatedTasks = existingExample.associatedTasks;
    baseData.isUserCreated = existingExample.isUserCreated;
    baseData.lastDownloadedAt = existingExample.lastDownloadedAt;
  }

  return baseData;
}