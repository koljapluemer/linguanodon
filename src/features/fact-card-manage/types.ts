import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { NoteData } from '@/entities/notes/NoteData';

export interface FactCardFormData {
  uid?: string;
  language: string;
  front: string;
  back: string;
  notes: NoteData[];
  priority?: number;
  doNotPractice?: boolean;
}

export interface FactCardFormState {
  formData: FactCardFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
}

export function factCardDataToFormData(factCard: FactCardData, notes: NoteData[] = []): FactCardFormData {
  return {
    uid: factCard.uid,
    language: factCard.language,
    front: factCard.front || '',
    back: factCard.back || '',
    notes: notes,
    priority: factCard.priority,
    doNotPractice: factCard.doNotPractice
  };
}

export function formDataToFactCardData(formData: FactCardFormData, existingFactCard?: FactCardData): Omit<FactCardData, 'progress'> | FactCardData {
  const baseData: Omit<FactCardData, 'progress'> = {
    uid: formData.uid || crypto.randomUUID(),
    language: formData.language,
    front: formData.front,
    back: formData.back,
    notes: formData.notes.map(note => note.uid),
    priority: formData.priority ?? 1,
    doNotPractice: formData.doNotPractice,
    origins: existingFactCard?.origins ?? ['user-added']
  };

  // For updates, include existing progress
  if (existingFactCard) {
    return {
      ...baseData,
      progress: existingFactCard.progress
    };
  }

  return baseData;
}