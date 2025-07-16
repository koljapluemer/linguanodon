import { fsrs } from 'ts-fsrs'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { Grade } from 'ts-fsrs'
import type { UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'

/**
 * Scores the card for a UnitOfMeaning using ts-fsrs and persists the update.
 * Logs errors to the console if anything fails.
 */
export async function scoreUnitOfMeaning(
  repository: UnitOfMeaningRepository,
  identification: UnitOfMeaningIdentification,
  rating: Grade
): Promise<void> {
  try {
    const unit = await repository.findUnitOfMeaning(identification.language, identification.content)
    if (!unit) {
      console.error('UnitOfMeaning not found for scoring:', identification)
      return
    }
    const scheduler = fsrs() // default params
    const now = new Date()
    const { card: updatedCard } = scheduler.next(unit.card, now, rating)
    unit.card = updatedCard
    // Persist by re-adding (since no update method exists)
    await repository.addUnitOfMeaning(unit)
  } catch (err) {
    console.error('Failed to score UnitOfMeaning:', identification, err)
  }
}
