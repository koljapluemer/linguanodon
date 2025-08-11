import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';

export interface VocabFormData {
  id?: string;
  language: string;
  content: string;
  translations: TranslationData[];
  priority?: number;
  doNotPractice?: boolean;
  notes: NoteData[];
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

export function vocabDataToFormData(vocab: VocabData, notes: NoteData[] = [], translations: TranslationData[] = []): VocabFormData {
  return {
    id: vocab.uid,
    language: vocab.language,
    content: vocab.content || '',
    translations: translations,
    priority: vocab.priority,
    doNotPractice: vocab.doNotPractice,
    notes: notes,
    links: vocab.links ? [...vocab.links] : []
  };
}

export function formDataToVocabData(formData: VocabFormData, existingVocab?: VocabData): Partial<VocabData> {
  const baseData: Partial<VocabData> = {
    language: formData.language,
    content: formData.content,
    translations: formData.translations.map(translation => translation.uid),
    priority: formData.priority,
    doNotPractice: formData.doNotPractice,
    notes: formData.notes.map(note => note.uid),
    links: formData.links
  };

  if (formData.id) {
    baseData.uid = formData.id;
  }

  // Preserve existing data that's not in the form
  if (existingVocab) {
    baseData.tasks = existingVocab.tasks;
    baseData.progress = existingVocab.progress;
  }

  return baseData;
}