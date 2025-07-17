import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { ExerciseChooseFromTwo } from '@/entities/Exercises'
import type { UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'
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
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Finds a suitable incorrect answer from the unit repository
 */
async function findIncorrectAnswer(
  correctAnswer: string,
  language: string,
  unitRepository: UnitOfMeaningRepository
): Promise<string> {
  try {
    const allUnits = await unitRepository.getAllUnitsOfMeaningByLanguage(language)
    const candidates = allUnits.filter(unit => {
      const content = unit.content
      if (content.toLowerCase() === correctAnswer.toLowerCase()) return false
      const lengthRatio = content.length / correctAnswer.length
      if (lengthRatio < 0.5 || lengthRatio > 1.5) return false
      const distance = levenshteinDistance(content.toLowerCase(), correctAnswer.toLowerCase())
      if (distance < 2) return false
      return true
    })
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length)
      return candidates[randomIndex].content
    }
    return correctAnswer + 'x'
  } catch (error) {
    console.warn('Failed to find incorrect answer from repository:', error)
    return correctAnswer + 'x'
  }
}

/**
 * Calculates the Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      )
    }
  }
  return matrix[str2.length][str1.length]
}

/**
 * Generator for choose-from-two exercises for a unit of meaning in a specific language.
 */
export const chooseFromTwoGenerator: ExerciseGeneratorInterface<[
  UnitOfMeaning,
  string,
  UnitOfMeaningRepository
]> = {
  /**
   * Produces all choose-from-two exercises for a unit and target language using the given repository.
   */
  generateExercises: async (unit, targetLanguage, unitRepository) => {
    const exercises: ExerciseChooseFromTwo[] = []
    const targetTranslations = unit.translations.filter(ref => ref.language === targetLanguage)
    if (targetTranslations.length === 0) {
      return []
    }
    for (const translation of targetTranslations) {
      const translationTokens = splitIntoTokens(translation.content)
      const translationWordIndexes = translationTokens.map((t, i) => isWordToken(t) ? i : -1).filter(i => i !== -1)
      if (translationWordIndexes.length <= 1) continue
      for (const wordIdx of translationWordIndexes) {
        const word = translationTokens[wordIdx]
        if (word.length < 3) continue
        const clozeContent = makeClozeTokens(translationTokens, wordIdx)
        const contextText = unit.content
        const incorrectAnswer = await findIncorrectAnswer(word, translation.language, unitRepository)
        const incorrectRef = unit.translations.find(t => t.language === translation.language && t.content === incorrectAnswer)
        const secondaryUnits: UnitOfMeaningIdentification[] = [
          { language: translation.language, content: translation.content }
        ]
        if (incorrectRef) {
          secondaryUnits.push({ language: incorrectRef.language, content: incorrectRef.content })
        }
        const exercise: ExerciseChooseFromTwo = {
          type: 'choose-from-two',
          front: wrapWithDirection(clozeContent),
          correctAnswer: word,
          incorrectAnswer: incorrectAnswer,
          context: contextText,
          instruction: 'Fill in the blank with the correct word',
          primaryUnitOfMeaning: { language: unit.language, content: unit.content },
          secondaryUnitsOfMeaning: secondaryUnits,
          uid: '',
          humanReadableName: ''
        }
        const { uid, humanReadable } = chooseFromTwoGenerator.getUid(exercise)
        exercise.uid = uid
        exercise.humanReadableName = humanReadable
        exercises.push(exercise)
      }
    }
    return exercises
  },
  /**
   * Returns the UID and a human-readable string for a given choose-from-two exercise.
   */
  getUid: (exercise) => {
    if (exercise.type !== 'choose-from-two') throw new Error('Not a choose-from-two exercise')
    const uid = `choosefromtwo_${hashString(exercise.front)}_${hashString(exercise.correctAnswer)}_${hashString(exercise.incorrectAnswer)}`
    const humanReadable = `ChooseFromTwo: ${exercise.primaryUnitOfMeaning.language} | ${exercise.front}`
    return { uid, humanReadable }
  }
} 