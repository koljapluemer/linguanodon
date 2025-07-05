// this store is simply persisted to localstorage
// no need to bother with dexie

// complex language settings stuff tho: abstract the four groups, abstract moving to another group

import { defineStore } from "pinia";
import { ref } from "vue";
import type { UserSettings } from "@/entities/UserSettings";

export const useUserSettingsStore = defineStore(
  "userSettings",
  () => {
    const settings = ref<UserSettings>({
      primaryNativeLanguages: [],
      secondaryNativeLanguages: [],
      primaryTargetLanguages: [],
      secondaryTargetLanguages: []
    });

    /**
     * Gets the primary native language (first one in the array)
     */
    function getPrimaryNativeLanguage(): string | undefined {
      return settings.value.primaryNativeLanguages[0];
    }

    /**
     * Updates user settings
     */
    function updateSettings(newSettings: Partial<UserSettings>) {
      settings.value = { ...settings.value, ...newSettings };
    }

    return {
      // State
      settings,

      // Actions
      getPrimaryNativeLanguage,
      updateSettings,
    };
  },
  {
    persist: {
      key: "user-settings",
      storage: localStorage,
    },
  }
);