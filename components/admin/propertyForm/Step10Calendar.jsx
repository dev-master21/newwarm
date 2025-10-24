// frontend/src/components/admin/propertyForm/Step10Calendar.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  HiCalendar,
  HiInformationCircle,
  HiCheckCircle
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'
import FormField from '../FormField'

const Step10Calendar = () => {
  const { t } = useTranslation()
  const { formData, updateFormData, formErrors } = usePropertyFormStore()

  const showCalendar = formData.dealType === 'rent' || formData.dealType === 'both'

  if (!showCalendar) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.addProperty.step10.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.addProperty.step10.subtitle')}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                   border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center"
        >
          <HiCheckCircle className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('admin.addProperty.step10.saleOnlyTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.addProperty.step10.saleOnlyDescription')}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step10.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step10.subtitle')}
        </p>
      </div>

      {/* Calendar URL */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                    border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg 
                        flex items-center justify-center shadow-lg">
            <HiCalendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.addProperty.step10.calendarSync')}
          </h3>
        </div>

        <FormField
          label={t('admin.addProperty.step10.icsCalendarUrl')}
          required
          error={formErrors.icsCalendarUrl}
          hint={t('admin.addProperty.step10.icsCalendarUrlHint')}
        >
          <input
            type="url"
            value={formData.icsCalendarUrl}
            onChange={(e) => updateFormData({ icsCalendarUrl: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg transition-all
              ${formErrors.icsCalendarUrl 
                ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
              }
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            `}
            placeholder={t('admin.addProperty.step10.icsCalendarUrlPlaceholder')}
          />
        </FormField>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <HiInformationCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('admin.addProperty.step10.instructionsTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{t('admin.addProperty.step10.instruction1')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{t('admin.addProperty.step10.instruction2')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{t('admin.addProperty.step10.instruction3')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{t('admin.addProperty.step10.instruction4')}</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 text-center"
      >
        <HiCheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step10.completionTitle')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step10.completionText')}
        </p>
      </motion.div>
    </div>
  )
}

export default Step10Calendar