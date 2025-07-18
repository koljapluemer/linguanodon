// Represents a language available in the app, with user flags for MVP.
export interface Language {
  code: string; // ISO code, e.g. 'eng', 'apc'
  name: string;
  isAddedByUser: boolean;
  isTarget: boolean;
  isNative: boolean;
} 