// CRUD
// get translations
// connect translation
// disconnect translation

import { defineStore } from "pinia";
import { ref, readonly } from "vue";
import type { UnitOfMeaning } from "@/entities/UnitOfMeaning";

export const useUnitOfMeaningStore = defineStore(
  "unitOfMeaning",
  () => {
    const unitsOfMeaning = ref<UnitOfMeaning[]>([]);

    /**
     * Creates a new unit of meaning
     */
    function createUnitOfMeaning(unit: Omit<UnitOfMeaning, "uid">) {
      const newUnit: UnitOfMeaning = {
        ...unit,
        uid: crypto.randomUUID(),
      };
      unitsOfMeaning.value.push(newUnit);
      return newUnit;
    }

    /**
     * Updates an existing unit of meaning
     */
    function updateUnitOfMeaning(uid: string, updates: Partial<UnitOfMeaning>) {
      const index = unitsOfMeaning.value.findIndex((unit) => unit.uid === uid);
      if (index === -1) {
        throw new Error("Unit of meaning not found");
      }

      unitsOfMeaning.value[index] = {
        ...unitsOfMeaning.value[index],
        ...updates,
      };
      return unitsOfMeaning.value[index];
    }

    /**
     * Deletes a unit of meaning by UID
     */
    function deleteUnitOfMeaning(uid: string) {
      const index = unitsOfMeaning.value.findIndex((unit) => unit.uid === uid);
      if (index === -1) {
        throw new Error("Unit of meaning not found");
      }

      unitsOfMeaning.value.splice(index, 1);
    }

    /**
     * Gets a unit of meaning by UID
     */
    function getUnitOfMeaning(uid: string): UnitOfMeaning | undefined {
      return unitsOfMeaning.value.find((unit) => unit.uid === uid);
    }

    /**
     * Gets all units of meaning
     */
    function getAllUnitsOfMeaning(): UnitOfMeaning[] {
      return unitsOfMeaning.value;
    }

    /**
     * Gets units of meaning by language
     */
    function getUnitsOfMeaningByLanguage(language: string): UnitOfMeaning[] {
      return unitsOfMeaning.value.filter((unit) => unit.language === language);
    }

    /**
     * Gets units of meaning by linguType
     */
    function getUnitsOfMeaningByType(linguType: string): UnitOfMeaning[] {
      return unitsOfMeaning.value.filter(
        (unit) => unit.linguType === linguType
      );
    }

    /**
     * Gets units of meaning by userCreated flag
     */
    function getUnitsOfMeaningByUserCreated(
      userCreated: boolean
    ): UnitOfMeaning[] {
      return unitsOfMeaning.value.filter(
        (unit) => unit.userCreated === userCreated
      );
    }

    /**
     * Adds multiple units of meaning in bulk
     */
    function addUnitsOfMeaningBulk(units: Omit<UnitOfMeaning, "uid">[]) {
      const newUnits: UnitOfMeaning[] = units.map((unit) => ({
        ...unit,
        uid: crypto.randomUUID(),
      }));
      unitsOfMeaning.value.push(...newUnits);
      return newUnits;
    }

    /**
     * Gets translations for a unit of meaning
     */
    function getTranslations(uid: string): UnitOfMeaning[] {
      const unit = getUnitOfMeaning(uid);
      if (!unit || !unit.translations) return [];

      return unit.translations
        .map((translationUid) => getUnitOfMeaning(translationUid))
        .filter(Boolean) as UnitOfMeaning[];
    }

    /**
     * Adds a translation to a unit of meaning
     */
    function addTranslation(unitUid: string, translationUid: string) {
      const unit = getUnitOfMeaning(unitUid);
      if (!unit) {
        throw new Error("Unit of meaning not found");
      }

      if (!unit.translations) {
        unit.translations = [];
      }

      if (!unit.translations.includes(translationUid)) {
        unit.translations.push(translationUid);
      }
    }

    /**
     * Removes a translation from a unit of meaning
     */
    function removeTranslation(unitUid: string, translationUid: string) {
      const unit = getUnitOfMeaning(unitUid);
      if (!unit || !unit.translations) {
        throw new Error("Unit of meaning or translations not found");
      }

      const index = unit.translations.indexOf(translationUid);
      if (index !== -1) {
        unit.translations.splice(index, 1);
      }
    }

    return {
      // State
      unitsOfMeaning: readonly(unitsOfMeaning),

      // Actions
      createUnitOfMeaning,
      updateUnitOfMeaning,
      deleteUnitOfMeaning,
      getUnitOfMeaning,
      getAllUnitsOfMeaning,
      getUnitsOfMeaningByLanguage,
      getUnitsOfMeaningByType,
      getUnitsOfMeaningByUserCreated,
      addUnitsOfMeaningBulk,
      getTranslations,
      addTranslation,
      removeTranslation,
    };
  },
  {
    persist: {
      key: "units-of-meaning",
      storage: localStorage,
    },
  }
);
