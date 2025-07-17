import type { Exercise } from '@/utils/exercise/types/exerciseTypes'

export interface ExerciseGeneratorInterface<Args extends unknown[] = unknown[]> {
  generateExercises: (...args: Args) => Promise<Exercise[]>
  getUid: (exercise: Exercise) => { uid: string, humanReadable: string }
}
