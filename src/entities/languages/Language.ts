import type { LanguageIdentifier } from "@/shared/LanguageIdentifier";

// Represents a language available in the app, with user flags for MVP.
export interface Language extends LanguageIdentifier {
  isAddedByUser: boolean;
  isTarget: boolean;
  isNative: boolean;
} 