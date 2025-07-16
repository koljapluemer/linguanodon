import type { Card } from 'ts-fsrs'
import { FSRS } from 'ts-fsrs'

/**
 * Returns the retrievability (probability of recall) for a card at key time points: 1 day, 1 week, 1 year from now.
 * Values are in the range 0-100 (percent).
 */
export function getRetrievabilityAtKeyPoints(card: Card, now: Date = new Date()) {
  const fsrs = new FSRS({})
  const msInDay = 24 * 60 * 60 * 1000

  const in1Day = fsrs.get_retrievability(card, new Date(now.getTime() + 1 * msInDay), false)
  const in1Week = fsrs.get_retrievability(card, new Date(now.getTime() + 7 * msInDay), false)
  const in1Year = fsrs.get_retrievability(card, new Date(now.getTime() + 365 * msInDay), false)

  return {
    in1Day: Math.round(in1Day * 100),
    in1Week: Math.round(in1Week * 100),
    in1Year: Math.round(in1Year * 100)
  }
}

/**
 * Returns the retrievability (probability of recall) for a card after a given number of minutes from now.
 * Value is in the range 0-100 (percent).
 */
export function getRetrievabilityInMinutes(card: Card, minutes: number, now: Date = new Date()): number | null {
  if (!card) return null
  try {
    const fsrs = new FSRS({})
    const future = new Date(now.getTime() + minutes * 60 * 1000)
    const value = fsrs.get_retrievability(card, future, false)
    return Math.round(value * 100)
  } catch {
    return null
  }
}
