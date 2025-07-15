import { createEmptyCard } from 'ts-fsrs'
import { useToastsStore } from '@/components/ui/toasts/useToasts'
import { doesUnitOfMeaningExist } from '@/utils/unitOfMeaning/doesUnitOfMeaningExist'
import { isSetDownloaded } from '@/utils/set/isSetDownloaded'
import { isTaskExists } from '@/utils/task/isTaskExists'
import type { Set } from '@/entities/Set'
import type { Task } from '@/entities/Task'
import type { UnitOfMeaning, UnitOfMeaningIdentification, UnitOfMeaningLink } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { SetRepository } from '@/repositories/interfaces/SetRepository'
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'
import { getIsoLanguages } from '@/utils/language/getIsoLanguages'
import { generateTaskUidBasedOnLanguageAndContent } from '@/utils/task/generateTaskUidBasedOnLanguageAndContent'

// Remote data interfaces
export interface RemoteSet {
    name: string
    language: string
    tasks: RemoteTask[]
}

export interface RemoteTask {
    content: string
    language: string
    primaryUnitsOfMeaning: RemoteUnitOfMeaning[]
    secondaryUnitsOfMeaning?: RemoteUnitOfMeaning[]
}

export interface RemoteUnitOfMeaning {
    language: string
    content: string
    preNotes?: string
    postNotes?: string
    pronunciation?: string;
    seeAlso?: UnitOfMeaningIdentification[] // array of other unit of meanings referenced by "$language:$content"
    translations?: UnitOfMeaningIdentification[] // array of other unit of meanings referenced by "$language:$content"
    credits?: RemoteCredit[]
    links?: UnitOfMeaningLink[];
    explicitlyNotRelated?: UnitOfMeaningIdentification[]; // New field for explicitly not related units
}

export interface RemoteCredit {
    license: string
    owner?: string
    ownerLink?: string
    source?: string
    sourceLink?: string
}

/**
 * Downloads a specific set from the local public directory
 */
export async function downloadSet(filename: string, language: string): Promise<RemoteSet> {
  try {
    const response = await fetch(`/data/${language}/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to download set: ${response.status} ${response.statusText}`)
    }
    const setData = await response.json()
    return setData as RemoteSet
  } catch (error) {
    console.error(`Error downloading set ${filename} for language ${language}:`, error)
    throw error
  }
}

/**
 * Converts a remote unit of meaning to local format with ts-fsrs card
 */
function convertRemoteUnitToLocalUnit(remoteUnit: RemoteUnitOfMeaning): UnitOfMeaning {
  const credits = remoteUnit.credits ? remoteUnit.credits.map(credit => ({
    license: credit.license,
    owner: credit.owner,
    ownerLink: credit.ownerLink,
    source: credit.source,
    sourceLink: credit.sourceLink
  })) : []

  return {
    language: remoteUnit.language,
    content: remoteUnit.content,
    preNotes: remoteUnit.preNotes,
    postNotes: remoteUnit.postNotes,
    pronunciation: remoteUnit.pronunciation,
    translations: remoteUnit.translations || [],
    seeAlso: remoteUnit.seeAlso || [],
    explicitlyNotRelated: remoteUnit.explicitlyNotRelated || [],
    credits,
    links: remoteUnit.links || [],
    card: createEmptyCard()
  }
}

/**
 * Converts a remote task to local format
 */
function convertRemoteTaskToLocalTask(remoteTask: RemoteTask): Task {
  const primaryUnitUids = (remoteTask.primaryUnitsOfMeaning || []).map(unit => ({
    language: unit.language,
    content: unit.content
  }))
  const secondaryUnitUids = (remoteTask.secondaryUnitsOfMeaning || []).map(unit => ({
    language: unit.language,
    content: unit.content
  }))

  return {
    uid: generateTaskUidBasedOnLanguageAndContent(remoteTask.language, remoteTask.content),
    language: remoteTask.language,
    content: remoteTask.content,
    secondaryUnitsOfMeaning: secondaryUnitUids,
    primaryUnitsOfMeaning: primaryUnitUids,
    lastDownloadedAt: new Date(),
    lastPracticedAt: null,
    isCompleted: false,
    nextShownEarliestAt: new Date(),
    interval: 0,
    attempts: []
  }
}

/**
 * Converts a remote set to local format
 */
function convertRemoteSetToLocalSet(remoteSet: RemoteSet): Set {
  return {
    uid: `${remoteSet.language}_${remoteSet.name}`,
    language: remoteSet.language,
    lastDownloadedAt: new Date()
  }
}

/**
 * Downloads and persists a set with all its data
 */
export async function downloadAndPersistSet(
  filename: string, 
  language: string, 
  unitRepository: UnitOfMeaningRepository,
  setRepository: SetRepository,
  taskRepository: TaskRepository,
  languageRepository: LanguageRepository
) {
  const toastsStore = useToastsStore()

  try {
    // Download remote set data
    const remoteSet = await downloadSet(filename, language)

    // --- Language check and add logic ---
    const userTargetLanguages = await languageRepository.getUserTargetLanguages()
    const isAlreadyTarget = userTargetLanguages.some((l: { code: string }) => l.code === remoteSet.language)
    if (!isAlreadyTarget) {
      const isoLanguages = getIsoLanguages()
      const isoMatch = isoLanguages.find(l => l.code === remoteSet.language)
      if (isoMatch) {
        await languageRepository.addUserTargetLanguage(remoteSet.language)
        toastsStore.addToast({
          type: 'info',
          message: `Added '${isoMatch.name}' to your target languages.`
        })
      } else {
        toastsStore.addToast({
          type: 'warning',
          message: `Language code '${remoteSet.language}' is not a recognized ISO language. Skipping adding to your target languages.`
        })
      }
    }
    // --- End language check ---
    
    // Check if set already exists
    const setExists = await isSetDownloaded(setRepository, remoteSet.language, remoteSet.name)
    if (setExists) {
      toastsStore.addToast({
        type: 'warning',
        message: `Set "${remoteSet.name}" already downloaded. No new data added.`
      })
      return
    }

    // Convert and add units of meaning
    let newUnitsCount = 0
    let skippedUnitsCount = 0

    for (const task of remoteSet.tasks) {
      // Add primary units
      for (const unit of (task.primaryUnitsOfMeaning || [])) {
        const exists = await doesUnitOfMeaningExist(unitRepository, unit.language, unit.content)
        if (!exists) {
          const localUnit = convertRemoteUnitToLocalUnit(unit)
          await unitRepository.addUnitOfMeaning(localUnit)
          newUnitsCount++
        } else {
          skippedUnitsCount++
        }
      }
      
      // Add secondary units
      if (task.secondaryUnitsOfMeaning) {
        for (const unit of task.secondaryUnitsOfMeaning) {
          const exists = await doesUnitOfMeaningExist(unitRepository, unit.language, unit.content)
          if (!exists) {
            const localUnit = convertRemoteUnitToLocalUnit(unit)
            await unitRepository.addUnitOfMeaning(localUnit)
            newUnitsCount++
          } else {
            skippedUnitsCount++
          }
        }
      }
    }

    // Convert and add tasks
    let newTasksCount = 0
    let skippedTasksCount = 0

    for (const remoteTask of remoteSet.tasks) {
      const taskExists = await isTaskExists(taskRepository, remoteTask.language, remoteTask.content)
      if (!taskExists) {
        const localTask = convertRemoteTaskToLocalTask(remoteTask)
        await taskRepository.addTask(localTask)
        newTasksCount++
      } else {
        skippedTasksCount++
      }
    }

    // Convert and add set
    const localSet = convertRemoteSetToLocalSet(remoteSet)
    await setRepository.addSet(localSet)

    // Show success toast
    const message = `Set "${remoteSet.name}" downloaded. Added ${newTasksCount} tasks and ${newUnitsCount} words/sentences.`
    const skippedMessage = skippedTasksCount > 0 || skippedUnitsCount > 0 
      ? ` (${skippedTasksCount} tasks and ${skippedUnitsCount} words/sentences skipped - already present)`
      : ''
    
    toastsStore.addToast({
      type: 'success',
      message: message + skippedMessage
    })

  } catch (error) {
    console.error('Error downloading set:', error)
    toastsStore.addToast({
      type: 'error',
      message: 'Failed to download set. Please try again.'
    })
  }
} 