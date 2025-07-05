import type { UnitOfMeaningData } from "@/entities/UnitOfMeaningData"

/**
 * Downloads a specific unit of meaning, primarly used when downloading units related to a learning goal
 */
export async function fetchRemoteUnitOfMeaningByUID(unitUid: string): Promise<UnitOfMeaningData> {
  const lang = unitUid.split('_')[0]
  const url = `https://scintillating-empanada-730581.netlify.app/units_of_meaning/${lang}/${unitUid}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch unit ${unitUid} for ${lang}`)
  return await res.json()
}
