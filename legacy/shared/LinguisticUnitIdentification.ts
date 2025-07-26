export interface LinguisticUnitIdentification {
  language: string; // ISO code, e.g. 'eng', 'apc'
  content: string;  // The text of the word or sentence
  type: 'word' | 'sentence';
}