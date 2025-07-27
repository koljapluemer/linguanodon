import type { VocabData } from '@/entities/vocab/vocab/VocabData';

export interface VocabFormData {
  id?: string;
  language: string;
  content: string;
  pronunciation: string;
  priority?: number;
  doNotPractice?: boolean;
  notes: Array<{
    content: string;
    showBeforeExercise: boolean;
  }>;
  links: Array<{
    label: string;
    url: string;
  }>;
}

export interface VocabFormState {
  formData: VocabFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
}

export function vocabDataToFormData(vocab: VocabData): VocabFormData {
  return {
    id: vocab.id,
    language: vocab.language,
    content: vocab.content || '',
    pronunciation: vocab.pronunciation || '',
    priority: vocab.priority,
    doNotPractice: vocab.doNotPractice,
    notes: vocab.notes ? [...vocab.notes] : [],
    links: vocab.links ? [...vocab.links] : []
  };
}

export function formDataToVocabData(formData: VocabFormData, existingVocab?: VocabData): Partial<VocabData> {
  const baseData: Partial<VocabData> = {
    language: formData.language,
    content: formData.content,
    pronunciation: formData.pronunciation,
    priority: formData.priority,
    doNotPractice: formData.doNotPractice,
    notes: formData.notes,
    links: formData.links
  };

  if (formData.id) {
    baseData.id = formData.id;
  }

  // Preserve existing data that's not in the form
  if (existingVocab) {
    baseData.translations = existingVocab.translations;
    baseData.associatedTasks = existingVocab.associatedTasks;
    baseData.progress = existingVocab.progress;
  }

  return baseData;
}