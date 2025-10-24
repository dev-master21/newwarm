// frontend/src/i18n/index.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translations
import enTranslations from './locales/en.json'
import ruTranslations from './locales/ru.json'
import thTranslations from './locales/th.json'
import frTranslations from './locales/fr.json'
import esTranslations from './locales/es.json'

const resources = {
  en: { translation: enTranslations },
  ru: { translation: ruTranslations },
  th: { translation: thTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // По умолчанию английский
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n