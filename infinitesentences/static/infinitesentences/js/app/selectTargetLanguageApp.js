// @ts-check
// Port of infinite-sentences-frontend's src/pages/select-target-language/SelectTargetLanguagePage.vue

import { AppHeaderComponent } from "./components/AppHeader.js";
import { AppFooterComponent } from "./components/AppFooter.js";
import { LanguageSymbolsComponent } from "./elements/LanguageSymbols.js";
import { createLanguagePreferencesStore } from "./store.js";
import { loadLanguages, loadTargetLanguageIsos } from "./api.js";

const { ref, onMounted } = window.Vue;

export const SelectTargetLanguageAppComponent = {
  components: {
    AppHeader: AppHeaderComponent,
    AppFooter: AppFooterComponent,
    LanguageSymbols: LanguageSymbolsComponent,
  },
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const nativeLanguage = ref(/** @type {any} */ (null));
    const targetLanguages = ref(/** @type {any[]} */ ([]));
    const loading = ref(false);
    const error = ref(false);

    /** @param {string} targetIso */
    function selectTargetLanguage(targetIso) {
      createLanguagePreferencesStore().setLanguages(props.config.nativeIso, targetIso);
      window.location.href = props.config.practiceUrlTemplate.replace("__TARGET_ISO__", targetIso);
    }

    onMounted(async () => {
      try {
        loading.value = true;
        error.value = false;
        const [languages, targetIsos] = await Promise.all([
          loadLanguages(props.config.apiLanguagesUrl),
          loadTargetLanguageIsos(props.config.apiTargetLanguagesUrl),
        ]);
        const nativeInfo = languages[props.config.nativeIso];
        nativeLanguage.value = {
          iso: props.config.nativeIso,
          displayName: nativeInfo?.displayName || props.config.nativeIso,
          symbol: nativeInfo?.symbols?.[0] || "",
        };
        targetLanguages.value = targetIsos
          .map((iso) => ({ iso, displayName: languages[iso]?.displayName || iso, symbols: languages[iso]?.symbols || [] }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
      } catch (e) {
        console.error("Failed to load languages:", e);
        error.value = true;
      } finally {
        loading.value = false;
      }
    });

    return { nativeLanguage, targetLanguages, loading, error, selectTargetLanguage };
  },
  template: `
    <AppHeader current-page="select-target-language" :landing-url="config.landingUrl" :stats-url="config.statsUrl" :settings-url="config.settingsUrl" />

    <div class="max-w-2xl mx-auto w-full p-4">
      <h1 class="text-3xl font-bold mb-6">Select Target Language</h1>

      <div v-if="nativeLanguage" class="mb-6">
        <a :href="config.selectNativeLanguageUrl" class="opacity-70 hover:underline">&larr; Change native language</a>
        <div class="mt-2">
          <span class="opacity-70">You speak: </span>
          <span class="font-semibold">{{ nativeLanguage.symbol }} {{ nativeLanguage.displayName }}</span>
        </div>
      </div>

      <div v-if="loading" class="alert">Loading languages...</div>
      <div v-else-if="error" class="alert alert-warning">Failed to load languages for this native language.</div>
      <div v-else-if="targetLanguages.length === 0" class="alert">No target languages available for {{ nativeLanguage?.displayName || config.nativeIso }}.</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="lang in targetLanguages"
          :key="lang.iso"
          class="card shadow bg-white text-gray-700 hover:shadow-md cursor-pointer transition-shadow"
          type="button"
          @click="selectTargetLanguage(lang.iso)"
        >
          <div class="card-body gap-4 grid place-items-center text-center">
            <LanguageSymbols :symbols="lang.symbols" />
            <h2 class="text-2xl font-semibold">{{ lang.displayName }}</h2>
          </div>
        </button>
      </div>
    </div>

    <AppFooter :api-languages-url="config.apiLanguagesUrl" :select-native-language-url="config.selectNativeLanguageUrl" />
  `,
};
