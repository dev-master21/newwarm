// frontend/src/components/admin/propertyForm/Step9Pricing.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiCurrencyDollar,
  HiCalendar,
  HiPlus,
  HiTrash,
  HiClock,
  HiSun
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'
import FormField from '../FormField'

const Step9Pricing = () => {
  const { t, i18n } = useTranslation()
  const { formData, updateFormData, formErrors } = usePropertyFormStore()

  const showSalePrice = formData.dealType === 'sale' || formData.dealType === 'both'
  const showRentPricing = formData.dealType === 'rent' || formData.dealType === 'both'

  const seasonTypes = [
    { value: 'low', label: t('admin.addProperty.step9.seasonTypes.low'), color: 'blue', icon: HiSun },
    { value: 'mid', label: t('admin.addProperty.step9.seasonTypes.mid'), color: 'green', icon: HiSun },
    { value: 'peak', label: t('admin.addProperty.step9.seasonTypes.peak'), color: 'orange', icon: HiSun },
    { value: 'prime', label: t('admin.addProperty.step9.seasonTypes.prime'), color: 'red', icon: HiSun },
    { value: 'holiday', label: t('admin.addProperty.step9.seasonTypes.holiday'), color: 'purple', icon: HiCalendar }
  ]

  const addSeasonalPrice = () => {
    const newSeason = {
      seasonType: 'mid',
      startDate: '', // Формат DD-MM
      endDate: '', // Формат DD-MM
      pricePerNight: '',
      minimumNights: '1'
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

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return t('admin.addProperty.step9.selectDate')
    
    try {
      // dateStr в формате DD-MM
      const [day, month] = dateStr.split('-')
      
      // Создаем дату (год не важен, используем 2024 для високосного года)
      const date = new Date(2024, parseInt(month) - 1, parseInt(day))
      
      // Проверяем валидность даты
      if (isNaN(date.getTime())) {
        return t('admin.addProperty.step9.selectDate')
      }
      
      // Форматируем дату в зависимости от языка
      return date.toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'long'
      })
    } catch (error) {
      return t('admin.addProperty.step9.selectDate')
    }
  }

  const handleDateButtonClick = (index, type) => {
    const input = document.createElement('input')
    input.type = 'date'
    
    // Устанавливаем текущее значение если оно есть
    const currentDate = type === 'start' 
      ? (formData.seasonalPricing || [])[index]?.startDate 
      : (formData.seasonalPricing || [])[index]?.endDate
    
    if (currentDate) {
      try {
        const [day, month] = currentDate.split('-')
        input.value = `2024-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      } catch (e) {
        console.error('Error setting date:', e)
      }
    }
    
    input.onchange = (e) => {
      const date = new Date(e.target.value)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const formattedDate = `${day}-${month}` // Формат DD-MM
      
      updateSeasonalPrice(index, type === 'start' ? 'startDate' : 'endDate', formattedDate)
    }
    
    input.click()
  }

  const getSeasonColor = (type) => {
    const season = seasonTypes.find(s => s.value === type)
    return season?.color || 'gray'
  }

  const getSeasonIcon = (type) => {
    const season = seasonTypes.find(s => s.value === type)
    return season?.icon || HiCalendar
  }

  const getSeasonLabel = (type) => {
    const season = seasonTypes.find(s => s.value === type)
    return season?.label || type
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
                <span className="text-gray-500 dark:text-gray-400">₽</span>
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
          {/* Seasonal Pricing */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                        border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg 
                              flex items-center justify-center shadow-lg">
                  <HiCalendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('admin.addProperty.step9.seasonalPricing')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('admin.addProperty.step9.seasonalPricingDesc')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addSeasonalPrice}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#DC2626] to-[#EF4444]
                         hover:from-[#B91C1C] hover:to-[#DC2626]
                         text-white rounded-lg transition-all shadow-md hover:shadow-lg
                         transform hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <HiPlus className="w-5 h-5" />
                <span>{t('admin.addProperty.step9.addSeason')}</span>
              </button>
            </div>

            {/* Seasons List */}
            <div className="space-y-4">
              <AnimatePresence>
                {(formData.seasonalPricing || []).map((season, index) => {
                  const SeasonIcon = getSeasonIcon(season.seasonType)
                  const colorClass = getSeasonColor(season.seasonType)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md
                            ${colorClass === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                              colorClass === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                              colorClass === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                              colorClass === 'red' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                              colorClass === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                              'bg-gradient-to-br from-gray-500 to-gray-600'
                            }`}>
                            <SeasonIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {t('admin.addProperty.step9.season')} {index + 1}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getSeasonLabel(season.seasonType)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSeasonalPrice(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 
                                   rounded-lg transition-colors"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Season Type */}
                        <FormField 
                          label={t('admin.addProperty.step9.seasonType')}
                          required
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {seasonTypes.map((type) => {
                              const TypeIcon = type.icon
                              const isSelected = season.seasonType === type.value
                              
                              return (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => updateSeasonalPrice(index, 'seasonType', type.value)}
                                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all
                                    ${isSelected
                                      ? type.color === 'blue' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                                        type.color === 'green' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                                        type.color === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                                        type.color === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                        type.color === 'purple' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                                        'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                  <TypeIcon className={`w-6 h-6 ${
                                    isSelected 
                                      ? type.color === 'blue' ? 'text-blue-500' :
                                        type.color === 'green' ? 'text-green-500' :
                                        type.color === 'orange' ? 'text-orange-500' :
                                        type.color === 'red' ? 'text-red-500' :
                                        type.color === 'purple' ? 'text-purple-500' :
                                        'text-gray-500'
                                      : 'text-gray-400'
                                  }`} />
                                  <span className={`text-xs font-medium text-center leading-tight ${
                                    isSelected
                                      ? type.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                                        type.color === 'green' ? 'text-green-700 dark:text-green-300' :
                                        type.color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                                        type.color === 'red' ? 'text-red-700 dark:text-red-300' :
                                        type.color === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                                        'text-gray-700 dark:text-gray-300'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {type.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </FormField>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField 
                            label={t('admin.addProperty.step9.startDate')}
                            required
                          >
                            <button
                              type="button"
                              onClick={() => handleDateButtonClick(index, 'start')}
                              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-700 
                                       border-2 border-gray-300 dark:border-gray-600 rounded-lg
                                       hover:border-blue-500 dark:hover:border-blue-400 transition-all
                                       text-left"
                            >
                              <span className="flex items-center space-x-2">
                                <HiCalendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {formatDisplayDate(season.startDate)}
                                </span>
                              </span>
                            </button>
                          </FormField>

                          <FormField 
                            label={t('admin.addProperty.step9.endDate')}
                            required
                          >
                            <button
                              type="button"
                              onClick={() => handleDateButtonClick(index, 'end')}
                              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-700 
                                       border-2 border-gray-300 dark:border-gray-600 rounded-lg
                                       hover:border-blue-500 dark:hover:border-blue-400 transition-all
                                       text-left"
                            >
                              <span className="flex items-center space-x-2">
                                <HiCalendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {formatDisplayDate(season.endDate)}
                                </span>
                              </span>
                            </button>
                          </FormField>
                        </div>

                        {/* Price and Minimum Nights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField 
                            label={t('admin.addProperty.step9.pricePerNight')}
                            required
                          >
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 dark:text-gray-400">₽</span>
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

                          <FormField 
                            label={t('admin.addProperty.step9.minimumNightsForSeason')}
                            required
                          >
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <HiClock className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                min="1"
                                value={season.minimumNights || ''}
                                onChange={(e) => updateSeasonalPrice(index, 'minimumNights', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                                         rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                                placeholder={t('admin.addProperty.step9.minimumNightsPlaceholder')}
                              />
                            </div>
                          </FormField>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
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