// @ts-check
// Port of infinite-sentences-frontend's src/dumb/AppFooter.vue - reads the
// persisted language preference itself (self-contained across all pages),
// same as the original's own store usage. RouterLink navigation becomes
// plain <a href> full-page navigation. The original's Firebase-backed
// feedback modal is dropped (no Django-side equivalent yet).

import { createLanguagePreferencesStore } from "../store.js";
import { loadLanguages } from "../api.js";

const { ref, onMounted } = window.Vue;

export const AppFooterComponent = {
  props: {
    apiLanguagesUrl: { type: String, required: true },
    selectNativeLanguageUrl: { type: String, required: true },
  },
  setup(props) {
    const languagePreferences = createLanguagePreferencesStore();
    const show = ref(languagePreferences.hasLanguagesSet);
    const nativeLabel = ref(languagePreferences.nativeIso ?? "");
    const targetLabel = ref(languagePreferences.targetIso ?? "");

    onMounted(async () => {
      if (!languagePreferences.hasLanguagesSet) return;
      try {
        const languages = await loadLanguages(props.apiLanguagesUrl);
        const native = languages[languagePreferences.nativeIso];
        const target = languages[languagePreferences.targetIso];
        if (native) nativeLabel.value = native.symbols?.[0] || native.displayName;
        if (target) targetLabel.value = target.symbols?.[0] || target.displayName;
      } catch (error) {
        console.warn("Failed to load language display info:", error);
      }
    });

    return { show, nativeLabel, targetLabel };
  },
  template: `
    <footer v-if="show" class="text-center py-2 opacity-70 mt-10 flex flex-col gap-2">
      <div class="flex items-center justify-center gap-4">
        <div>
          <a class="link" :href="selectNativeLanguageUrl">{{ nativeLabel }}</a>
          <span class="mx-1">&rarr;</span>
          <a class="link" :href="selectNativeLanguageUrl">{{ targetLabel }}</a>
        </div>
      </div>
      <hr>
      <div class="text-sm">
        <p>Made by <a class="link" href="https://koljasam.com/" target="_blank">Kolja Sam</a>.</p>
        <p>All data stays on your device. <a href="https://github.com/koljapluemer/infinite-sentences-frontend" class="link">Open Source</a>, no ads, no sign-up, no BS.</p>
      </div>
    </footer>
  `,
};
