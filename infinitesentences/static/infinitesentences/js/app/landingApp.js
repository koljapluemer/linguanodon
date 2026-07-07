// @ts-check
// Port of infinite-sentences-frontend's src/pages/landing/LandingPage.vue

import { AppHeaderComponent } from "./components/AppHeader.js";
import { AppFooterComponent } from "./components/AppFooter.js";
import { iconMarkup } from "./icons.js";

export const LandingAppComponent = {
  components: {
    AppHeader: AppHeaderComponent,
    AppFooter: AppFooterComponent,
  },
  props: {
    config: { type: Object, required: true },
  },
  setup() {
    return {
      bookOpenIcon: iconMarkup("BookOpen", "w-6 h-6 text-primary"),
      messageIcon: iconMarkup("MessageSquareText", "w-6 h-6 text-primary"),
      brainIcon: iconMarkup("Brain", "w-6 h-6 text-primary"),
    };
  },
  template: `
    <AppHeader current-page="landing" :landing-url="config.landingUrl" :stats-url="config.statsUrl" :settings-url="config.settingsUrl" />

    <div class="max-w-2xl mx-auto w-full flex flex-col gap-12 py-8 px-4">
      <section class="flex flex-col items-center text-center gap-6">
        <div class="flex flex-col gap-2">
          <h1 class="text-4xl font-bold">Infinite Sentences</h1>
          <p class="text-lg opacity-70">Learn a language word by word and sentence by sentence.</p>
        </div>

        <a :href="config.selectNativeLanguageUrl" class="btn btn-primary btn-lg">Start learning</a>
        <small>Free, no sign-up.</small>

        <div class="w-full aspect-video bg-base-200 rounded-box flex items-center justify-center overflow-hidden">
          <img :src="config.screenshotUrl" alt="" class="w-full h-full object-cover">
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold text-center">How it works</h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="flex flex-col gap-2">
            <span v-html="bookOpenIcon"></span>
            <p class="font-semibold">Vocab first</p>
            <p class="opacity-70">You will be introduced and familiarized with vocabulary needed to understand a specific natural language sentence.</p>
          </div>

          <div class="flex flex-col gap-2">
            <span v-html="messageIcon"></span>
            <p class="font-semibold">Full sentence</p>
            <p class="opacity-70">Having all the words freshly in your mind, you will be prompted to make sense of a sentence in your target language containing the practiced words.</p>
          </div>

          <div class="flex flex-col gap-2">
            <span v-html="brainIcon"></span>
            <p class="font-semibold">Gain Intuition</p>
            <p class="opacity-70">Over time, you will learn more and more new words, solidify the known ones and get a feeling for how they are authentically used.</p>
          </div>
        </div>
      </section>
    </div>

    <AppFooter :api-languages-url="config.apiLanguagesUrl" :select-native-language-url="config.selectNativeLanguageUrl" />
  `,
};
