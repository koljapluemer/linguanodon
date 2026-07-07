// @ts-check
// Port of infinite-sentences-frontend's src/pages/settings/SettingsPage.vue

import { AppHeaderComponent } from "./components/AppHeader.js";
import { AppFooterComponent } from "./components/AppFooter.js";
import { createLanguagePreferencesStore, createUserSettingsStore } from "./store.js";
import { loadLanguages } from "./api.js";

const { ref, watch, onMounted } = window.Vue;

export const SettingsAppComponent = {
  components: {
    AppHeader: AppHeaderComponent,
    AppFooter: AppFooterComponent,
  },
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const userSettingsStore = createUserSettingsStore();
    const languageStore = createLanguagePreferencesStore();

    const dailyGoal = ref(userSettingsStore.dailySentenceGoal);
    const nativeLabel = ref("");
    const targetLabel = ref("");
    const hasLanguagesSet = ref(languageStore.hasLanguagesSet);

    watch(dailyGoal, (value) => {
      userSettingsStore.setDailySentenceGoal(value);
    });

    onMounted(async () => {
      if (!languageStore.hasLanguagesSet) return;
      try {
        const languages = await loadLanguages(props.config.apiLanguagesUrl);
        const native = languages[languageStore.nativeIso];
        const target = languages[languageStore.targetIso];
        nativeLabel.value = native?.symbols?.[0] || native?.displayName || languageStore.nativeIso;
        targetLabel.value = target?.symbols?.[0] || target?.displayName || languageStore.targetIso;
      } catch (error) {
        console.warn("Failed to load language display info:", error);
      }
    });

    function changeNativeLanguage() {
      languageStore.clearLanguages();
      window.location.href = props.config.selectNativeLanguageUrl;
    }

    function changeTargetLanguage() {
      window.location.href = props.config.selectTargetLanguageUrlTemplate.replace(
        "__NATIVE_ISO__",
        languageStore.nativeIso
      );
    }

    return { dailyGoal, nativeLabel, targetLabel, hasLanguagesSet, changeNativeLanguage, changeTargetLanguage };
  },
  template: `
    <AppHeader current-page="settings" :landing-url="config.landingUrl" :stats-url="config.statsUrl" :settings-url="config.settingsUrl" />

    <div class="max-w-md mx-auto w-full p-4">
      <fieldset class="fieldset">
        <label for="daily-goal" class="label">Daily sentence goal</label>
        <input id="daily-goal" v-model.number="dailyGoal" type="number" name="daily-goal" class="input" min="1" placeholder="10">
      </fieldset>

      <div v-if="hasLanguagesSet" class="mt-6">
        <h2 class="text-xl font-semibold mb-3">Languages</h2>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="opacity-70">Native language</span>
            <button class="link" type="button" @click="changeNativeLanguage">{{ nativeLabel }}</button>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-70">Target language</span>
            <button class="link" type="button" @click="changeTargetLanguage">{{ targetLabel }}</button>
          </div>
        </div>
      </div>
    </div>

    <AppFooter :api-languages-url="config.apiLanguagesUrl" :select-native-language-url="config.selectNativeLanguageUrl" />
  `,
};
