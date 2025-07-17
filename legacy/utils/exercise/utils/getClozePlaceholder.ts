import { detectTextDirection } from './detectTextDirection'

/**
 * Creates cloze placeholders based on token direction (no span, just the placeholder string)
 */
export function getClozePlaceholder(token: string): string {
  const dir = detectTextDirection(token)
  return dir === 'rtl' ? '؟؟؟' : '???'
}
