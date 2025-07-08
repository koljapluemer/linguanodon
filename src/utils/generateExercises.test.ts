import { describe, it, expect } from 'vitest'
import { makeClozeTokens, detectTextDirection } from './generateExercises'

describe('makeClozeTokens', () => {
  it('should cloze the first word in an RTL sentence and not jump the placeholder', () => {
    // Example: sentence = "واستلبسوه ولاد الصف"
    // tokens = ["واستلبسوه", " ", "ولاد", " ", "الصف"]
    // Cloze first word (index 0)
    const tokens = ["واستلبسوه", " ", "ولاد", " ", "الصف"]
    const language = 'ar' // Arabic
    const clozed = makeClozeTokens(tokens, 0, language)
    // The expected output should have the placeholder in the correct position
    const expected = '<span dir="rtl">؟؟؟</span> ولاد الصف'
    expect(clozed).toBe(expected)
  })
})

describe('detectTextDirection', () => {
  it('detects LTR for German', () => {
    expect(detectTextDirection('Das ist ein Test.')).toBe('ltr')
  })
  it('detects LTR for English', () => {
    expect(detectTextDirection('This is a test.')).toBe('ltr')
  })
  it('detects RTL for Arabic', () => {
    expect(detectTextDirection('هذا اختبار')).toBe('rtl')
  })
  it('detects LTR for Japanese', () => {
    expect(detectTextDirection('これはテストです')).toBe('ltr')
  })
  it('detects LTR for Chinese', () => {
    expect(detectTextDirection('这是一个测试')).toBe('ltr')
  })
}) 