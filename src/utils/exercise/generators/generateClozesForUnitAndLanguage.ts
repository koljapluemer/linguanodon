import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { ExerciseFlashcard } from '@/entities/Exercises'
import type { ExerciseGeneratorInterface } from './ExerciseGeneratorInterface'
import { splitIntoTokens } from '@/utils/exercise/utils/splitIntoTokens'
import { isWordToken } from '@/utils/exercise/utils/isWordToken'
import { makeClozeTokens } from '@/utils/exercise/utils/makeClozeTokens'
import { wrapWithDirection } from '@/utils/exercise/utils/wrapWithDirection'

/**
 * Simple hash function for generating readable, unique-enough strings for UIDs.
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

/**
 * Generator for cloze (fill-in-the-blank) flashcard exercises for a unit of meaning.
 */
export const clozeGenerator: ExerciseGeneratorInterface<[
  UnitOfMeaning,
  string
]> = {
  /**
   * Produces all cloze (fill-in-the-blank) flashcard exercises for a unit and target language.
   */
  generateExercises: (unit, targetLanguage) => {
    const exercises: ExerciseFlashcard[] = []
    const targetTranslations = unit.translations.filter(ref => ref.language === targetLanguage)
    if (targetTranslations.length === 0) {
      return Promise.resolve([])
    }
    const tokens = splitIntoTokens(unit.content)
    const wordIndexes = tokens.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)
    if (wordIndexes.length <= 1) {
      return Promise.resolve([])
    }
    wordIndexes.forEach((wordIdx) => {
      const word = tokens[wordIdx]
      if (word.length < 3) return
      const clozeContent = makeClozeTokens(tokens, wordIdx)
      const contextText = targetTranslations.map(ref => ref.content).join(' / ')
      const front = `${wrapWithDirection(clozeContent)}<div class="text-2xl">${wrapWithDirection(contextText)}</div>`
      const back = `${wrapWithDirection(unit.content.replace(word, `<mark>${word}</mark>`))}<div class="text-2xl">${wrapWithDirection(contextText)}</div>`
      const exercise: ExerciseFlashcard = {
        type: 'flashcard',
        front,
        back,
        instruction: 'Fill in the blank',
        primaryUnitOfMeaning: { language: unit.language, content: unit.content },
        secondaryUnitsOfMeaning: targetTranslations.map(t => ({ language: t.language, content: t.content })),
        uid: '',
        humanReadableName: ''
      }
      const { uid, humanReadable } = clozeGenerator.getUid(exercise)
      exercise.uid = uid
      exercise.humanReadableName = humanReadable
      exercises.push(exercise)
    })
    for (const translation of targetTranslations) {
      const translationTokens = splitIntoTokens(translation.content)
      const translationWordIndexes = translationTokens.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)
      if (translationWordIndexes.length <= 1) continue
      translationWordIndexes.forEach((wordIdx) => {
        const word = translationTokens[wordIdx]
        if (word.length < 3) return
        const clozeContent = makeClozeTokens(translationTokens, wordIdx)
        const contextText = unit.content
        const front = `${wrapWithDirection(clozeContent)}<div class="text-2xl">${wrapWithDirection(contextText)}</div>`
        const back = `${wrapWithDirection(translation.content.replace(word, `<mark>${word}</mark>`))}<div class="text-2xl">${wrapWithDirection(contextText)}</div>`
        const exercise: ExerciseFlashcard = {
          type: 'flashcard',
          front,
          back,
          instruction: 'Fill in the blank',
          primaryUnitOfMeaning: { language: unit.language, content: unit.content },
          secondaryUnitsOfMeaning: [{ language: translation.language, content: translation.content }],
          uid: '',
          humanReadableName: ''
        }
        const { uid, humanReadable } = clozeGenerator.getUid(exercise)
        exercise.uid = uid
        exercise.humanReadableName = humanReadable
        exercises.push(exercise)
      })
    }
    return Promise.resolve(exercises)
  },
  /**
   * Returns the UID and a human-readable string for a given cloze exercise.
   */
  getUid: (exercise) => {
    if (exercise.type !== 'flashcard') throw new Error('Not a flashcard exercise')
    const uid = `cloze_${hashString(exercise.front)}_${hashString(exercise.back)}`
    const humanReadable = `Cloze: ${exercise.primaryUnitOfMeaning.language} | ${exercise.front}`
    return { uid, humanReadable }
  }
}
