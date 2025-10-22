// frontend/src/components/admin/propertyForm/Step9Pricing.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiCurrencyDollar,
  HiCalendar,
  HiPlus,
  HiTrash,
  HiClock
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'
import FormField from '../FormField'

const Step9Pricing = () => {
  const { t } = useTranslation()
  const { formData, updateFormData, formErrors } = usePropertyFormStore()

  const showSalePrice = formData.dealType === 'sale' || formData.dealType === 'both'
  const showRentPricing = formData.dealType === 'rent' || formData.dealType === 'both'

  const addSeasonalPrice = () => {
    const newSeason = {
      startDate: '',
      endDate: '',
      pricePerNight: ''
    }
    updateFormData({
      seasonalPricing: [...(formData.seasonalPricing || []), newSeason]
    })
  }

  const removeSeasonalPrice = (index) => {
    const newPricing = formData.seasonalPricing.filter((_, i) => i !== index)
    updateFormData({ seasonalPricing: newPricing })
  }

  const updateSeasonalPrice = (index, field, value) => {
    const newPricing = [...(formData.seasonalPricing || [])]
    newPricing[index] = { ...newPricing[index], [field]: value }
    updateFormData({ seasonalPricing: newPricing })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step9.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step9.subtitle')}
        </p>
      </div>

      {/* Sale Price */}
      {showSalePrice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                   border-2 border-green-200 dark:border-green-800 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg 
                          flex items-center justify-center shadow-lg">
              <HiCurrencyDollar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.addProperty.step9.salePrice')}
            </h3>
          </div>

          <FormField
            label={t('admin.addProperty.step9.salePriceLabel')}
            required
            error={formErrors.salePrice}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">฿</span>
              </div>
              <input
                type="number"
                min="0"
                value={formData.salePrice || ''}
                onChange={(e) => updateFormData({ salePrice: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all
                  ${formErrors.salePrice 
                    ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder={t('admin.addProperty.step9.salePricePlaceholder')}
              />
            </div>
          </FormField>
        </motion.div>
      )}

      {/* Rent Pricing */}
      {showRentPricing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Minimum Nights */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                        border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg 
                            flex items-center justify-center shadow-lg">
                <HiClock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('admin.addProperty.step9.minimumNights')}
              </h3>
            </div>

            <FormField
              required
              error={formErrors.minimumNights}
            >
              <input
                type="number"
                min="1"
                value={formData.minimumNights || ''}
                onChange={(e) => updateFormData({ minimumNights: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg transition-all
                  ${formErrors.minimumNights 
                    ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder={t('admin.addProperty.step9.minimumNightsPlaceholder')}
              />
            </FormField>
          </div>

          {/* Seasonal Pricing */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                        border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg 
                              flex items-center justify-center shadow-lg">
                  <HiCalendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('admin.addProperty.step9.seasonalPricing')}
                </h3>
              </div>
              <button
                type="button"
                onClick={addSeasonalPrice}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#DC2626] to-[#EF4444]
                         hover:from-[#B91C1C] hover:to-[#DC2626]
                         text-white rounded-lg transition-all shadow-md hover:shadow-lg
                         transform hover:scale-105 active:scale-95"
              >
                <HiPlus className="w-5 h-5" />
                <span className="hidden sm:inline">{t('admin.addProperty.step9.addSeason')}</span>
              </button>
            </div>

            {/* Seasons List */}
            <div className="space-y-4">
              <AnimatePresence>
                {(formData.seasonalPricing || []).map((season, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {t('admin.addProperty.step9.season')} {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeSeasonalPrice(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 
                                 rounded-lg transition-colors"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label={t('admin.addProperty.step9.startDate')}>
                        <input
                          type="date"
                          value={season.startDate || ''}
                          onChange={(e) => updateSeasonalPrice(index, 'startDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                                   rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        />
                      </FormField>

                      <FormField label={t('admin.addProperty.step9.endDate')}>
                        <input
                          type="date"
                          value={season.endDate || ''}
                          onChange={(e) => updateSeasonalPrice(index, 'endDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                                   rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        />
                      </FormField>

                      <FormField label={t('admin.addProperty.step9.pricePerNight')}>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">฿</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={season.pricePerNight || ''}
                            onChange={(e) => updateSeasonalPrice(index, 'pricePerNight', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                                     rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder={t('admin.addProperty.step9.pricePerNightPlaceholder')}
                          />
                        </div>
                      </FormField>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(formData.seasonalPricing || []).length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <HiCalendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">{t('admin.addProperty.step9.noSeasons')}</p>
                  <p className="text-sm">{t('admin.addProperty.step9.addSeasonHint')}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Step9Pricing