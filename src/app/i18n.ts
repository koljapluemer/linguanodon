import { createI18n } from 'vue-i18n';

// Import locale messages
import en from '@/shared/locales/en.json';

const messages = {
  en,
};

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'en', // Default locale
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
});

export default i18n;