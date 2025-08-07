import type { ResourceData } from '@/entities/resources/ResourceData';

export interface ImmersionContentFormData {
  uid?: string;
  title: string;
  prompt: string;
  content?: string;
  linkUrl?: string;
  linkLabel?: string;
  extraInfo?: string;
  language: string;
  priority: number;
}

export interface ImmersionContentFormState {
  formData: ImmersionContentFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
}

export function immersionContentToFormData(content: ResourceData): ImmersionContentFormData {
  return {
    uid: content.uid,
    title: content.title,
    prompt: '', // Default empty since ResourceData no longer has prompt
    content: content.content,
    linkUrl: content.link?.url,
    linkLabel: content.link?.label,
    extraInfo: '', // Default empty since ResourceData no longer has extraInfo
    language: content.language,
    priority: content.priority
  };
}

export function formDataToImmersionContent(
  formData: ImmersionContentFormData, 
  existingContent?: ResourceData
): Partial<ResourceData> {
  const baseData: Partial<ResourceData> = {
    title: formData.title,
    content: formData.content,
    language: formData.language,
    priority: formData.priority,
    isImmersionContent: true
  };

  // Add link if URL is provided
  if (formData.linkUrl?.trim()) {
    baseData.link = {
      url: formData.linkUrl.trim(),
      label: formData.linkLabel?.trim() || 'Link'
    };
  }

  if (formData.uid) {
    baseData.uid = formData.uid;
  }

  // Preserve existing data that's not in the form
  if (existingContent) {
    baseData.vocab = existingContent.vocab;
    baseData.examples = existingContent.examples;
    baseData.factCards = existingContent.factCards;
    baseData.notes = existingContent.notes;
    baseData.tasks = existingContent.tasks;
    baseData.lastShownAt = existingContent.lastShownAt;
  }

  return baseData;
}