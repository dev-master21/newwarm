// frontend/src/components/admin/propertyForm/Step5AdditionalInfo.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  HiCalendar,
  HiClock,
  HiCube,
  HiTruck,
  HiHeart
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'
import FormField from '../FormField'

const Step5AdditionalInfo = () => {
  const { t } = useTranslation()
  const { formData, updateFormData, formErrors } = usePropertyFormStore()

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step5.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step5.subtitle')}
        </p>
      </div>

      {/* Construction Date */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                    border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg 
                        flex items-center justify-center shadow-lg">
            <HiCalendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.addProperty.step5.constructionDate')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t('admin.addProperty.step5.constructionYear')}
            required
            error={formErrors.constructionYear}
          >
            <select
              value={formData.constructionYear}
              onChange={(e) => handleInputChange('constructionYear', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg transition-all
                ${formErrors.constructionYear 
                  ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                }
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              `}
            >
              <option value="">{t('admin.addProperty.step5.constructionYearPlaceholder')}</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t('admin.addProperty.step5.constructionMonth')}
            required
            error={formErrors.constructionMonth}
          >
            <select
              value={formData.constructionMonth}
              onChange={(e) => handleInputChange('constructionMonth', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg transition-all
                ${formErrors.constructionMonth 
                  ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                }
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              `}
            >
              <option value="">{t('admin.addProperty.step5.constructionMonthPlaceholder')}</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                <option key={month} value={month}>
                  {t(`admin.addProperty.step5.months.month${month}`)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Furniture Status */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 
                    border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg 
                        flex items-center justify-center shadow-lg">
            <HiCube className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.addProperty.step5.furnitureStatus')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['fullyFurnished', 'partiallyFurnished', 'unfurnished'].map((status) => (
            <motion.button
              key={status}
              type="button"
              onClick={() => handleInputChange('furnitureStatus', status)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border-2 transition-all text-center
                ${formData.furnitureStatus === status
                  ? 'border-[#DC2626] bg-red-50 dark:bg-red-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
              `}
            >
              <p className={`font-medium ${
                formData.furnitureStatus === status 
                  ? 'text-[#DC2626]' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {t(`admin.addProperty.step5.${status}`)}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Parking */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                    border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg 
                        flex items-center justify-center shadow-lg">
            <HiTruck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.addProperty.step5.parking')}
          </h3>
        </div>

        <FormField
          label={t('admin.addProperty.step5.parkingSpaces')}
          error={formErrors.parkingSpaces}
        >
          <input
            type="number"
            min="0"
            value={formData.parkingSpaces}
            onChange={(e) => handleInputChange('parkingSpaces', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            placeholder={t('admin.addProperty.step5.parkingSpacesPlaceholder')}
          />
        </FormField>
      </div>

      {/* Pets Allowed */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 
                    border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg 
                        flex items-center justify-center shadow-lg">
            <HiHeart className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.addProperty.step5.petsAllowed')}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['petsYes', 'petsNo', 'petsNegotiable'].map((option) => (
              <motion.button
                key={option}
                type="button"
                onClick={() => handleInputChange('petsAllowed', option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 transition-all text-center
                  ${formData.petsAllowed === option
                    ? 'border-[#DC2626] bg-red-50 dark:bg-red-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <p className={`font-medium ${
                  formData.petsAllowed === option 
                    ? 'text-[#DC2626]' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t(`admin.addProperty.step5.${option}`)}
                </p>
              </motion.button>
            ))}
          </div>

          {formData.petsAllowed === 'petsNegotiable' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FormField
                label={t('admin.addProperty.step5.petsCustom')}
                error={formErrors.petsCustom}
              >
                <textarea
                  value={formData.petsCustom}
                  onChange={(e) => handleInputChange('petsCustom', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                  placeholder={t('admin.addProperty.step5.petsCustomPlaceholder')}
                />
              </FormField>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step5AdditionalInfo