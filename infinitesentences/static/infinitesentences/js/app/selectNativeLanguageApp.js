// @ts-check
// Port of infinite-sentences-frontend's src/pages/select-native-language/SelectNativeLanguagePage.vue

import { AppHeaderComponent } from "./components/AppHeader.js";
import { AppFooterComponent } from "./components/AppFooter.js";
import { LanguageSymbolsComponent } from "./elements/LanguageSymbols.js";
import { createLanguagePreferencesStore } from "./store.js";
import { loadLanguages, loadNativeLanguageIsos } from "./api.js";

const { ref, onMounted } = window.Vue;

export const SelectNativeLanguageAppComponent = {
  components: {
    AppHeader: AppHeaderComponent,
    AppFooter: AppFooterComponent,
    LanguageSymbols: LanguageSymbolsComponent,
  },
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const nativeLanguages = ref(/** @type {any[]} */ ([]));
    const loading = ref(false);
    const error = ref(false);

    /** @param {string} iso */
    function selectNativeLanguage(iso) {
      createLanguagePreferencesStore().clearLanguages();
      window.location.href = props.config.selectTargetLanguageUrlTemplate.replace("__NATIVE_ISO__", iso);
    }

    onMounted(async () => {
      try {
        loading.value = true;
        const [isos, languages] = await Promise.all([
          loadNativeLanguageIsos(props.config.apiNativeLanguagesUrl),
          loadLanguages(props.config.apiLanguagesUrl),
        ]);
        nativeLanguages.value = isos
          .map((iso) => ({ iso, displayName: languages[iso]?.displayName || iso, symbols: languages[iso]?.symbols || [] }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
      } catch (e) {
        console.error("Failed to load native languages:", e);
        error.value = true;
      } finally {
        loading.value = false;
      }
    });

    return { nativeLanguages, loading, error, selectNativeLanguage };
  },
  template: `
    <AppHeader current-page="select-native-language" :landing-url="config.landingUrl" :stats-url="config.statsUrl" :settings-url="config.settingsUrl" />

    <div class="max-w-2xl mx-auto w-full p-4">
      <h1 class="text-3xl font-bold mb-6">Select Your Native Language</h1>

      <div v-if="loading" class="alert">Loading languages...</div>
      <div v-else-if="error" class="alert alert-warning">Failed to load languages.</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="lang in nativeLanguages"
          :key="lang.iso"
          class="card shadow bg-white text-gray-700 hover:shadow-md cursor-pointer transition-shadow"
          type="button"
          @click="selectNativeLanguage(lang.iso)"
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
