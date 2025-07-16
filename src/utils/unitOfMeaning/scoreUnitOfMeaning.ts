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
  rating: Grade,
  mode: 'both' | 'onlyPrimary'
): Promise<void> {
  try {
    const unit = await repository.findUnitOfMeaning(identification.language, identification.content)
    if (!unit) {
      console.error('UnitOfMeaning not found for scoring:', identification)
      return
    }
    const scheduler = fsrs() // default params
    const now = new Date()
    if (mode === 'both') {
      console.log('[scoreUnitOfMeaning] BEFORE (both)', { card: unit.card, secondaryCard: unit.secondaryCard, identification, rating })
      const { card: updatedCard } = scheduler.next(unit.card, now, rating)
      const { card: updatedSecondaryCard } = scheduler.next(unit.secondaryCard, now, rating)
      unit.card = updatedCard
      unit.secondaryCard = updatedSecondaryCard
      console.log('[scoreUnitOfMeaning] AFTER (both)', { updatedCard, updatedSecondaryCard })
    } else if (mode === 'onlyPrimary') {
      console.log('[scoreUnitOfMeaning] BEFORE (onlySecondary)', { secondaryCard: unit.secondaryCard, identification, rating })
      const { card: updatedSecondaryCard } = scheduler.next(unit.secondaryCard, now, rating)
      unit.secondaryCard = updatedSecondaryCard
      console.log('[scoreUnitOfMeaning] AFTER (onlySecondary)', { updatedSecondaryCard })
    }
    // Persist by upserting (safe for both new and existing)
    await repository.upsertUnitOfMeaning(unit)
  } catch (err) {
    console.error('Failed to score UnitOfMeaning:', identification, err)
  }
}
