// frontend/src/components/admin/TranslationsEditor.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiTranslate,
  HiChevronDown,
  HiGlobe,
  HiSave,
  HiExclamation
} from 'react-icons/hi'
import propertyApi from '../../api/propertyApi'
import toast from 'react-hot-toast'

const TranslationsEditor = ({ translations, onUpdate, propertyId, onSave }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeLanguage, setActiveLanguage] = useState('ru')
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalTranslations, setOriginalTranslations] = useState([])

  // Отслеживаем изменения
  useEffect(() => {
    if (translations && originalTranslations.length > 0) {
      const changed = JSON.stringify(translations) !== JSON.stringify(originalTranslations)
      setHasChanges(changed)
    } else if (translations && originalTranslations.length === 0) {
      // Первая инициализация
      setOriginalTranslations(JSON.parse(JSON.stringify(translations)))
    }
  }, [translations, originalTranslations])

  const languages = [
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
  ]

  const getTranslation = (langCode) => {
    return translations.find(t => t.language_code === langCode) || {
      language_code: langCode,
      property_name: '',
      description: ''
    }
  }

  const currentTranslation = getTranslation(activeLanguage)

  // Сохранение переводов
  const handleSaveTranslations = async () => {
    try {
      setSaving(true)
      
      // Фильтруем только заполненные переводы
      const translationsToSave = translations.filter(trans => 
        trans.property_name?.trim() || trans.description?.trim()
      )

      if (translationsToSave.length === 0) {
        toast.error(t('admin.editProperty.translations.noDataToSave'))
        return
      }

      console.log('📤 Сохранение переводов:', translationsToSave)

      await propertyApi.updatePropertyTranslations(propertyId, translationsToSave)
      
      toast.success(t('admin.editProperty.translations.saveSuccess'))
      
      // Обновляем оригинальные данные после успешного сохранения
      setOriginalTranslations(JSON.parse(JSON.stringify(translations)))
      setHasChanges(false)
      
      // Вызываем callback для обновления данных в родительском компоненте
      if (onSave) {
        onSave()
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения переводов:', error)
      toast.error(error.response?.data?.message || t('admin.editProperty.translations.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mt-6
               border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-3 cursor-pointer flex-1"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <HiTranslate className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t('admin.editProperty.translations.title')}
              </h2>
              <p className="text-sm text-white/80">
                {t('admin.editProperty.translations.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Индикатор несохраненных изменений */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-400/20 
                         text-white rounded-lg backdrop-blur-sm"
              >
                <HiExclamation className="w-4 h-4" />
                <span className="text-xs font-medium whitespace-nowrap">
                  {t('admin.editProperty.unsavedChanges')}
                </span>
              </motion.div>
            )}

            {/* Кнопка сохранения */}
            <button
              onClick={handleSaveTranslations}
              disabled={!hasChanges || saving}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30
                       text-white rounded-lg transition-all backdrop-blur-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg hover:shadow-xl"
            >
              <HiSave className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">
                {saving ? t('common.saving') : t('common.save')}
              </span>
            </button>

            {/* Кнопка сворачивания */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <HiChevronDown className="w-6 h-6 text-white" />
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Language Tabs */}
              <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
                <HiGlobe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLanguage(lang.code)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
                             font-medium whitespace-nowrap transition-all ${
                      activeLanguage === lang.code
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>

              {/* Translation Fields */}
              <div className="space-y-5">
                {/* Property Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.editProperty.fields.propertyName')}
                  </label>
                  <input
                    type="text"
                    value={currentTranslation.property_name || ''}
                    onChange={(e) => onUpdate(activeLanguage, 'property_name', e.target.value)}
                    placeholder={t('admin.editProperty.translations.namePlaceholder')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                             border-2 border-gray-200 dark:border-gray-600
                             rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             text-gray-900 dark:text-white transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.editProperty.fields.description')}
                  </label>
                  <textarea
                    value={currentTranslation.description || ''}
                    onChange={(e) => onUpdate(activeLanguage, 'description', e.target.value)}
                    placeholder={t('admin.editProperty.translations.descriptionPlaceholder')}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                             border-2 border-gray-200 dark:border-gray-600
                             rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             text-gray-900 dark:text-white resize-none transition-all"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {currentTranslation.description?.length || 0} {t('common.characters')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TranslationsEditor