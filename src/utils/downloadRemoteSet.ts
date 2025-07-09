import { createEmptyCard } from 'ts-fsrs'
import { downloadSet, type RemoteSet, type RemoteTask, type RemoteUnitOfMeaning } from '@/utils/getRemoteSet'
import { useSetStore } from '@/stores/setStore'
import { useTaskStore } from '@/stores/taskStore'
import { useUnitOfMeaningStore } from '@/stores/unitOfMeaningStore'
import { useToastsStore } from '@/components/ui/toasts/useToasts'
import type { Set } from '@/entities/Set'
import type { Task } from '@/entities/Task'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

/**
 * Converts a remote unit of meaning to local format with ts-fsrs card
 */
function convertRemoteUnitToLocalUnit(remoteUnit: RemoteUnitOfMeaning): UnitOfMeaning {
  const credits = remoteUnit.credits ? remoteUnit.credits.map(credit => ({
    license: credit.license,
    owner: credit.owner || '',
    ownerLink: credit.ownerLink || '',
    source: credit.source || '',
    sourceLink: credit.sourceLink || ''
  })) : []

  return {
    uid: `${remoteUnit.language}_${remoteUnit.content}_${remoteUnit.notes || 'unit'}`,
    language: remoteUnit.language,
    content: remoteUnit.content,
    notes: remoteUnit.notes || '',
    translations: remoteUnit.translations || [],
    seeAlso: [],
    credits,
    card: createEmptyCard()
  }
}

/**
 * Converts a remote task to local format
 */
function convertRemoteTaskToLocalTask(remoteTask: RemoteTask): Task {
  const primaryUnitUids = (remoteTask.primaryUnitsOfMeaning || []).map(unit => 
    `${unit.language}_${unit.content}_${unit.notes || 'unit'}`
  )
  const allUnitUids = remoteTask.unitsOfMeaning 
    ? [...primaryUnitUids, ...remoteTask.unitsOfMeaning.map(unit => 
        `${unit.language}_${unit.content}_${unit.notes || 'unit'}`
      )]
    : primaryUnitUids

  return {
    language: remoteTask.language,
    content: remoteTask.content,
    unitsOfMeaning: allUnitUids,
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
export async function downloadAndPersistSet(filename: string, language: string) {
  const setStore = useSetStore()
  const taskStore = useTaskStore()
  const unitStore = useUnitOfMeaningStore()
  const toastsStore = useToastsStore()

  try {
    // Download remote set data
    const remoteSet = await downloadSet(filename, language)
    
    // Check if set already exists
    const setExists = setStore.isSetDownloaded(remoteSet.language, remoteSet.name)
    if (setExists) {
      toastsStore.addToast({
        type: 'warning',
        message: `Set "${remoteSet.name}" already downloaded. No new data added.`
      })
      return
    }

    // Convert and add units of meaning
    const allUnits = new Map<string, UnitOfMeaning>()
    let newUnitsCount = 0
    let skippedUnitsCount = 0

    for (const task of remoteSet.tasks) {
      // Add primary units
      for (const unit of (task.primaryUnitsOfMeaning || [])) {
        const unitId = `${unit.language}_${unit.content}_${unit.notes || 'unit'}`
        if (!unitStore.isUnitExists(unit.language, unit.content)) {
          const localUnit = convertRemoteUnitToLocalUnit(unit)
          allUnits.set(unitId, localUnit)
          newUnitsCount++
        } else {
          skippedUnitsCount++
        }
      }
      
      // Add secondary units
      if (task.unitsOfMeaning) {
        for (const unit of task.unitsOfMeaning) {
          const unitId = `${unit.language}_${unit.content}_${unit.notes || 'unit'}`
          if (!unitStore.isUnitExists(unit.language, unit.content)) {
            const localUnit = convertRemoteUnitToLocalUnit(unit)
            allUnits.set(unitId, localUnit)
            newUnitsCount++
          } else {
            skippedUnitsCount++
          }
        }
      }
    }

    // Add units to store
    for (const unit of allUnits.values()) {
      unitStore.addUnit(unit)
    }

    // Convert and add tasks
    let newTasksCount = 0
    let skippedTasksCount = 0

    for (const remoteTask of remoteSet.tasks) {
      if (!taskStore.isTaskExists(remoteTask.language, remoteTask.content)) {
        const localTask = convertRemoteTaskToLocalTask(remoteTask)
        taskStore.addTask(localTask)
        newTasksCount++
      } else {
        skippedTasksCount++
      }
    }

    // Convert and add set
    const localSet = convertRemoteSetToLocalSet(remoteSet)
    setStore.addDownloadedSet(localSet)

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