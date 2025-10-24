// frontend/src/components/admin/SeasonalPricingEditor.jsx
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiCalendar,
  HiCash,
  HiPlus,
  HiTrash,
  HiChevronDown,
  HiChevronUp,
  HiClock,
  HiSun
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import propertyApi from '../../api/propertyApi'

const SeasonalPricingEditor = ({ pricing, propertyId, onUpdate }) => {
  const { t, i18n } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)
  const [seasons, setSeasons] = useState(pricing || [])
  const [saving, setSaving] = useState(false)
  const dateInputRefs = useRef({})

  // Типы сезонов (как в Step9Pricing)
  const seasonTypes = [
    { value: 'low', label: t('admin.addProperty.step9.seasonTypes.low'), color: 'blue', icon: HiSun },
    { value: 'mid', label: t('admin.addProperty.step9.seasonTypes.mid'), color: 'green', icon: HiSun },
    { value: 'peak', label: t('admin.addProperty.step9.seasonTypes.peak'), color: 'orange', icon: HiSun },
    { value: 'prime', label: t('admin.addProperty.step9.seasonTypes.prime'), color: 'red', icon: HiSun },
    { value: 'holiday', label: t('admin.addProperty.step9.seasonTypes.holiday'), color: 'purple', icon: HiCalendar }
  ]

  // Добавление нового сезона с автоматической подстановкой даты
  const addSeason = () => {
    let startDate = ''

    if (seasons.length > 0) {
      const lastSeason = seasons[seasons.length - 1]
      if (lastSeason.endDate) {
        const [day, month] = lastSeason.endDate.split('-')
        const lastDate = new Date(2024, parseInt(month) - 1, parseInt(day))
        lastDate.setDate(lastDate.getDate() + 1)
        
        const newDay = String(lastDate.getDate()).padStart(2, '0')
        const newMonth = String(lastDate.getMonth() + 1).padStart(2, '0')
        startDate = `${newDay}-${newMonth}`
      }
    }

    const newSeason = {
      seasonType: 'mid',
      startDate: startDate,
      endDate: '',
      pricePerNight: '',
      minimumNights: '1',
      id: Date.now()
    }

    setSeasons([...seasons, newSeason])
  }

  // Удаление сезона
  const removeSeason = (index) => {
    const newSeasons = seasons.filter((_, i) => i !== index)
    setSeasons(newSeasons)
  }

  // Обновление поля сезона
  const updateSeason = (index, field, value) => {
    const newSeasons = [...seasons]
    newSeasons[index] = { ...newSeasons[index], [field]: value }
    setSeasons(newSeasons)
  }

  // Форматирование даты для отображения
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return t('admin.addProperty.step9.selectDate')
    
    try {
      const [day, month] = dateStr.split('-')
      const date = new Date(2024, parseInt(month) - 1, parseInt(day))
      
      if (isNaN(date.getTime())) {
        return t('admin.addProperty.step9.selectDate')
      }
      
      return date.toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'long'
      })
    } catch (error) {
      return t('admin.addProperty.step9.selectDate')
    }
  }

  // Открытие календаря по клику на кнопку
  const handleDateButtonClick = (index, type) => {
    const refKey = `${index}-${type}`
    const inputElement = dateInputRefs.current[refKey]
    
    if (inputElement) {
      try {
        if (inputElement.showPicker) {
          inputElement.showPicker()
        } else {
          inputElement.focus()
          inputElement.click()
        }
      } catch (error) {
        console.error('Ошибка открытия календаря:', error)
        inputElement.focus()
      }
    }
  }

  // Обработка изменения даты
  const handleDateChange = (index, type, event) => {
    const dateValue = event.target.value
    if (dateValue) {
      const date = new Date(dateValue)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const formattedDate = `${day}-${month}`
      
      updateSeason(index, type === 'start' ? 'startDate' : 'endDate', formattedDate)
    }
  }

  // Получение значения для input[type="date"]
  const getInputValue = (index, type) => {
    const currentDate = type === 'start' 
      ? seasons[index]?.startDate 
      : seasons[index]?.endDate
    
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

  // Получение цвета сезона
  const getSeasonColor = (type) => {
    const season = seasonTypes.find(s => s.value === type)
    return season?.color || 'gray'
  }

  // Получение иконки сезона
  const getSeasonIcon = (type) => {
    const season = seasonTypes.find(s => s.value === type)
    return season?.icon || HiCalendar
  }

  // Получение названия сезона
  const getSeasonLabel = (type) => {
    const season = seasonTypes.find(s => s.value === type)
    return season?.label || type
  }

  // Сохранение сезонных цен
  const handleSave = async () => {
    try {
      setSaving(true)

      // Валидация
      for (let i = 0; i < seasons.length; i++) {
        const season = seasons[i]
        if (!season.startDate || !season.endDate || !season.pricePerNight) {
          toast.error(`${t('admin.editProperty.pricing.fillAllFields')} (${t('admin.addProperty.step9.season')} ${i + 1})`)
          return
        }
      }

      const response = await propertyApi.saveSeasonalPricing(propertyId, {
        seasonalPricing: seasons
      })

      if (response.success) {
        toast.success(t('admin.editProperty.pricing.saved'))
        if (onUpdate) {
          await onUpdate()
        }
      }
    } catch (error) {
      console.error('Save seasonal pricing error:', error)
      toast.error(t('admin.editProperty.pricing.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-cyan-500 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <HiCalendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {t('admin.editProperty.pricing.seasonalPricing')}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              {t('admin.editProperty.pricing.managePricing')}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <HiChevronDown className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Seasons List */}
              <AnimatePresence>
                {seasons.map((season, index) => {
                  const SeasonIcon = getSeasonIcon(season.seasonType)
                  const seasonColor = getSeasonColor(season.seasonType)
                  
                  return (
                    <motion.div
                      key={season.id || index}
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
                        onClick={() => removeSeason(index)}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 
                                 rounded-lg transition-all"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>

                      {/* Season Header */}
                      <div className="flex items-center space-x-2 mb-4">
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

                      {/* Season Type Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('admin.addProperty.step9.seasonType')}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {seasonTypes.map((type) => {
                            const TypeIcon = type.icon
                            const isSelected = season.seasonType === type.value
                            
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => updateSeason(index, 'seasonType', type.value)}
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
                                <span className={`text-xs text-center ${
                                  isSelected ? 'font-semibold' : 'font-medium'
                                } ${
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
                      </div>

                      {/* Date Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('admin.addProperty.step9.startDate')}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDateButtonClick(index, 'start')}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 
                                     dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500
                                     transition-all text-left"
                          >
                            <span className="flex items-center space-x-2">
                              <HiCalendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatDisplayDate(season.startDate)}
                              </span>
                            </span>
                          </button>
                          <input
                            ref={(el) => (dateInputRefs.current[`${index}-start`] = el)}
                            type="date"
                            className="sr-only"
                            value={getInputValue(index, 'start')}
                            onChange={(e) => handleDateChange(index, 'start', e)}
                          />
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('admin.addProperty.step9.endDate')}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDateButtonClick(index, 'end')}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 
                                     dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500
                                     transition-all text-left"
                          >
                            <span className="flex items-center space-x-2">
                              <HiCalendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatDisplayDate(season.endDate)}
                              </span>
                            </span>
                          </button>
                          <input
                            ref={(el) => (dateInputRefs.current[`${index}-end`] = el)}
                            type="date"
                            className="sr-only"
                            value={getInputValue(index, 'end')}
                            onChange={(e) => handleDateChange(index, 'end', e)}
                          />
                        </div>
                      </div>

                      {/* Price and Minimum Nights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Price Per Night */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('admin.addProperty.step9.pricePerNight')}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400">₽</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              value={season.pricePerNight || ''}
                              onChange={(e) => updateSeason(index, 'pricePerNight', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                                       rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                              placeholder={t('admin.addProperty.step9.pricePerNightPlaceholder')}
                            />
                          </div>
                        </div>

                        {/* Minimum Nights */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('admin.addProperty.step9.minimumNightsForSeason')}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <HiClock className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              min="1"
                              value={season.minimumNights || ''}
                              onChange={(e) => updateSeason(index, 'minimumNights', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                                       rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                              placeholder={t('admin.addProperty.step9.minimumNightsPlaceholder')}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Empty State */}
              {seasons.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <HiCalendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">{t('admin.addProperty.step9.noSeasons')}</p>
                  <p className="text-sm">{t('admin.addProperty.step9.addSeasonHint')}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={addSeason}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 
                           text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 
                           transition-all shadow-lg hover:shadow-xl"
                >
                  <HiPlus className="w-5 h-5" />
                  <span>{t('admin.addProperty.step9.addSeason')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || seasons.length === 0}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
                           text-white rounded-lg hover:from-green-600 hover:to-emerald-600 
                           transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiCash className="w-5 h-5" />
                  <span>{saving ? t('common.saving') : t('common.save')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default SeasonalPricingEditor