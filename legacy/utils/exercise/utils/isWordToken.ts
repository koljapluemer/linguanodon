/**
 * Determines if a token is a word (not punctuation or whitespace)
 */
export function isWordToken(token: string): boolean {
  // Word if it contains at least one letter
  return /[\p{L}]/u.test(token)
}
