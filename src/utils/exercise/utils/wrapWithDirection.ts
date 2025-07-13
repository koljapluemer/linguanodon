import { detectTextDirection } from './detectTextDirection'

/**
 * Wraps text in appropriate dir attribute based on detected direction of the text
 */
export function wrapWithDirection(text: string): string {
  const direction = detectTextDirection(text)
  return `<div dir="${direction}">${text}</div>`
}
