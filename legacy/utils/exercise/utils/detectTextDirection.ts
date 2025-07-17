/**
 * Detect text direction ('rtl' or 'ltr') by majority vote of characters
 */
export function detectTextDirection(text: string): 'rtl' | 'ltr' {
  let rtl = 0, ltr = 0
  for (const char of text) {
    // RTL character ranges
    if (/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(char)) {
      rtl++
    }
    // LTR character ranges (Latin, Greek, Cyrillic, CJK, etc.)
    else if (/[A-Za-z\u0041-\u007A\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/.test(char)) {
      ltr++
    }
    // Numbers and other characters don't count for direction
  }
  // Default to LTR if equal or no directional characters found
  return rtl > ltr ? 'rtl' : 'ltr'
}
