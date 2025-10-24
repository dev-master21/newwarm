// frontend/src/components/admin/propertyForm/Step9Pricing.jsx
import React, { useRef, useEffect } from 'react'
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
  
  // Создаем refs для каждого поля даты
  const dateInputRefs = useRef({})

  const showSalePrice = formData.dealType === 'sale' || formData.dealType === 'both'
  const showRentPricing = formData.dealType === 'rent' || formData.dealType === 'both'

  const seasonTypes = [
    { value: 'low', label: t('admin.addProperty.step9.seasonTypes.low'), color: 'blue', icon: HiSun },
    { value: 'mid', label: t('admin.addProperty.step9.seasonTypes.mid'), color: 'green', icon: HiSun },
    { value: 'peak', label: t('admin.addProperty.step9.seasonTypes.peak'), color: 'orange', icon: HiSun },
    { value: 'prime', label: t('admin.addProperty.step9.seasonTypes.prime'), color: 'red', icon: HiSun },
    { value: 'holiday', label: t('admin.addProperty.step9.seasonTypes.holiday'), color: 'purple', icon: HiCalendar }
  ]

  // ИСПРАВЛЕНО: Автоматическое подставление начальной даты
  const addSeasonalPrice = () => {
    const existingSeasons = formData.seasonalPricing || []
    let startDate = ''

    // Если есть предыдущие сезоны, берем дату окончания последнего
    if (existingSeasons.length > 0) {
      const lastSeason = existingSeasons[existingSeasons.length - 1]
      if (lastSeason.endDate) {
        // Парсим дату окончания последнего сезона
        const [day, month] = lastSeason.endDate.split('-')
        const lastDate = new Date(2024, parseInt(month) - 1, parseInt(day))
        
        // Добавляем 1 день
        lastDate.setDate(lastDate.getDate() + 1)
        
        // Форматируем в DD-MM
        const newDay = String(lastDate.getDate()).padStart(2, '0')
        const newMonth = String(lastDate.getMonth() + 1).padStart(2, '0')
        startDate = `${newDay}-${newMonth}`
      }
    }

    const newSeason = {
      seasonType: 'mid',
      startDate: startDate, // Автоматически подставляем следующий день после предыдущего сезона
      endDate: '',
      pricePerNight: '',
      minimumNights: '1'
    }
    
    updateFormData({
      seasonalPricing: [...existingSeasons, newSeason]
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
    
    // Логирование для отладки
    console.log(`Обновлен сезон #${index}, поле: ${field}, значение:`, value)
    console.log('Все сезоны:', newPricing)
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
    const refKey = `${index}-${type}`
    const inputElement = dateInputRefs.current[refKey]
    
    if (inputElement) {
      try {
        // Используем showPicker() если доступен
        if (inputElement.showPicker) {
          inputElement.showPicker()
        } else {
          // Fallback для старых браузеров
          inputElement.focus()
          inputElement.click()
        }
      } catch (error) {
        console.error('Ошибка открытия календаря:', error)
        // Последняя попытка
        inputElement.focus()
      }
    }
  }

  const handleDateChange = (index, type, event) => {
    const dateValue = event.target.value
    if (dateValue) {
      const date = new Date(dateValue)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const formattedDate = `${day}-${month}` // Формат DD-MM
      
      updateSeasonalPrice(index, type === 'start' ? 'startDate' : 'endDate', formattedDate)
    }
  }

  const getInputValue = (index, type) => {
    const currentDate = type === 'start' 
      ? (formData.seasonalPricing || [])[index]?.startDate 
      : (formData.seasonalPricing || [])[index]?.endDate
    
    if (currentDate) {
      try {
        const [day, month] = currentDate.split('-')
        return `2024-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      } catch (e) {
        return ''
      }
    }
    return ''
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
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
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 
                   border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg 
                          flex items-center justify-center shadow-lg">
              <HiCalendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.addProperty.step9.rentPricing')}
            </h3>
          </div>

          {/* Base Price */}
          <FormField
            label={t('admin.addProperty.step9.basePricePerNight')}
            required
            error={formErrors.rentPrice}
            hint={t('admin.addProperty.step9.basePriceHint')}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">₽</span>
              </div>
              <input
                type="number"
                min="0"
                value={formData.rentPrice || ''}
                onChange={(e) => updateFormData({ rentPrice: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                placeholder={t('admin.addProperty.step9.basePricePlaceholder')}
              />
            </div>
          </FormField>

          {/* Minimum Nights */}
          <FormField
            label={t('admin.addProperty.step9.minimumNights')}
            hint={t('admin.addProperty.step9.minimumNightsHint')}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiClock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                value={formData.minimumNights || '1'}
                onChange={(e) => updateFormData({ minimumNights: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                placeholder={t('admin.addProperty.step9.minimumNightsPlaceholder')}
              />
            </div>
          </FormField>

          {/* Seasonal Pricing */}
          <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('admin.addProperty.step9.seasonalPricing')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('admin.addProperty.step9.seasonalPricingHint')}
                </p>
              </div>
              <button
                type="button"
                onClick={addSeasonalPrice}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 
                         text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 
                         transition-all shadow-lg hover:shadow-xl"
              >
                <HiPlus className="w-5 h-5" />
                <span>{t('admin.addProperty.step9.addSeason')}</span>
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {(formData.seasonalPricing || []).map((season, index) => {
                  const SeasonIcon = getSeasonIcon(season.seasonType)
                  const seasonColor = getSeasonColor(season.seasonType)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`relative p-6 rounded-xl border-2 space-y-4
                        ${seasonColor === 'blue' ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' :
                          seasonColor === 'green' ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' :
                          seasonColor === 'orange' ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10' :
                          seasonColor === 'red' ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' :
                          seasonColor === 'purple' ? 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10' :
                          'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10'
                        }`}
                    >
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeSeasonalPrice(index)}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 
                                 rounded-lg transition-all"
                        title={t('admin.addProperty.step9.removeSeason')}
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>

                      <div className="flex items-center space-x-2 mb-2">
                        <SeasonIcon className={`w-6 h-6 ${
                          seasonColor === 'blue' ? 'text-blue-500' :
                          seasonColor === 'green' ? 'text-green-500' :
                          seasonColor === 'orange' ? 'text-orange-500' :
                          seasonColor === 'red' ? 'text-red-500' :
                          seasonColor === 'purple' ? 'text-purple-500' :
                          'text-gray-500'
                        }`} />
                        <span className={`text-sm font-semibold ${
                          seasonColor === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                          seasonColor === 'green' ? 'text-green-700 dark:text-green-300' :
                          seasonColor === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                          seasonColor === 'red' ? 'text-red-700 dark:text-red-300' :
                          seasonColor === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                          'text-gray-700 dark:text-gray-300'
                        }`}>
                          {getSeasonLabel(season.seasonType)}
                        </span>
                      </div>

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
                          <div className="relative">
                            {/* Скрытый input для календаря */}
                            <input
                              ref={(el) => dateInputRefs.current[`${index}-start`] = el}
                              type="date"
                              value={getInputValue(index, 'start')}
                              onChange={(e) => handleDateChange(index, 'start', e)}
                              className="absolute opacity-0 w-0 h-0"
                              tabIndex={-1}
                            />
                            {/* Видимая кнопка */}
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
                          </div>
                        </FormField>

                        <FormField 
                          label={t('admin.addProperty.step9.endDate')}
                          required
                        >
                          <div className="relative">
                            {/* Скрытый input для календаря */}
                            <input
                              ref={(el) => dateInputRefs.current[`${index}-end`] = el}
                              type="date"
                              value={getInputValue(index, 'end')}
                              onChange={(e) => handleDateChange(index, 'end', e)}
                              className="absolute opacity-0 w-0 h-0"
                              tabIndex={-1}
                            />
                            {/* Видимая кнопка */}
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
                          </div>
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