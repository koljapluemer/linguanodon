import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Set } from '@/entities/Set'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaning as UnitOfMeaningEntity } from '@/entities/UnitOfMeaning'

// Import all initial set data
import setData1 from './initialSetData/أطلع.json'
import setData2 from './initialSetData/الشخص.json'
import setData3 from './initialSetData/جاهز.json'
import setData4 from './initialSetData/سيدي.json'
import setData5 from './initialSetData/الحزب.json'
import setData6 from './initialSetData/بتطلع.json'

interface InitialSetData {
  uid: string
  language: string
  tasks: string[]
  unitsOfMeaning: UnitOfMeaningEntity[]
}

/**
 * Converts initial set data JSON format to Set format
 * The JSON contains full UnitOfMeaning objects, but Set only needs UIDs
 */
function convertInitialDataToSet(data: InitialSetData): Set {
  return {
    uid: data.uid,
    language: data.language,
    tasks: data.tasks,
    unitsOfMeaning: data.unitsOfMeaning.map(unit => unit.uid)
  }
}

/**
 * Extracts all UnitOfMeaning objects from initial data
 */
function extractAllUnitsOfMeaning(dataArray: InitialSetData[]): UnitOfMeaning[] {
  const unitsMap = new Map<string, UnitOfMeaning>()
  
  dataArray.forEach(data => {
    data.unitsOfMeaning.forEach((unit: UnitOfMeaningEntity) => {
      unitsMap.set(unit.uid, {
        uid: unit.uid,
        language: unit.language,
        content: unit.content,
        linguType: unit.linguType,
        license: unit.license,
        owner: unit.owner,
        ownerLink: unit.ownerLink,
        source: unit.source,
        sourceLink: unit.sourceLink,
        translations: unit.translations
      })
    })
  })
  
  return Array.from(unitsMap.values())
}

export const useSetStore = defineStore('set', () => {
  const sets = ref<Set[]>([])
  const unitsOfMeaning = ref<UnitOfMeaning[]>([])

  /**
   * Seeds the store with initial data from JSON files
   */
  function seedInitialData() {
    const initialData: InitialSetData[] = [
      setData1, setData2, setData3, setData4, setData5, setData6
    ]
    
    sets.value = initialData.map(convertInitialDataToSet)
    unitsOfMeaning.value = extractAllUnitsOfMeaning(initialData)
  }

  /**
   * Gets all sets
   */
  const getAllSets = computed(() => sets.value)

  /**
   * Gets a specific set by UID
   */
  function getSetByUid(uid: string): Set | undefined {
    return sets.value.find(set => set.uid === uid)
  }

  /**
   * Gets all units of meaning for a specific set
   */
  function getUnitsOfMeaningForSet(setUid: string): UnitOfMeaning[] {
    const set = getSetByUid(setUid)
    if (!set) return []
    
    return unitsOfMeaning.value.filter((unit: UnitOfMeaning) => 
      set.unitsOfMeaning.includes(unit.uid)
    )
  }

  /**
   * Gets a specific unit of meaning by UID
   */
  function getUnitOfMeaningByUid(uid: string): UnitOfMeaning | undefined {
    return unitsOfMeaning.value.find(unit => unit.uid === uid)
  }

  return {
    sets,
    unitsOfMeaning,
    seedInitialData,
    getAllSets,
    getSetByUid,
    getUnitsOfMeaningForSet,
    getUnitOfMeaningByUid
  }
}, {
  persist: true
})
