import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiCalculator, HiCurrencyDollar, HiCalendar, HiMoon, HiSparkles, HiChevronDown, HiCheckCircle, HiBan } from 'react-icons/hi'
import DatePicker from 'react-datepicker'
import { propertyService } from '../../services/property.service'
import toast from 'react-hot-toast'
import 'react-datepicker/dist/react-datepicker.css'

const PriceCalculator = ({ propertyId, property, isOpen, onClose, blockedDates = [] }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [result, setResult] = useState(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Проверка, доступна ли дата
  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return !blockedDates.includes(dateStr)
  }

  // Расчет стоимости
  const handleCalculate = async () => {
    if (!checkIn || !checkOut) {
      toast.error(t('property.priceCalculator.selectDates'))
      return
    }

    try {
      setLoading(true)
      const response = await propertyService.calculatePrice(
        propertyId,
        checkIn.toISOString().split('T')[0],
        checkOut.toISOString().split('T')[0]
      )

      if (response.success) {
        console.log('📊 Результат расчета:', response.data)
        console.log('🚫 Занятые даты:', response.data.unavailableDates)
        setResult(response.data)
        setShowBreakdown(false)
      }
    } catch (error) {
      console.error('Error calculating price:', error)
      toast.error(t('property.priceCalculator.error'))
    } finally {
      setLoading(false)
    }
  }

  // Сброс
  const handleReset = () => {
    setCheckIn(null)
    setCheckOut(null)
    setResult(null)
    setShowBreakdown(false)
  }

  // Получение цвета сезона
  const getSeasonColor = (seasonType) => {
    const colors = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      mid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      peak: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      prime: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
    return colors[seasonType] || colors.mid
  }

  // Проверка доступности конкретной даты в результатах
  const isDateOccupied = (dateStr) => {
    if (!result?.unavailableDates || !Array.isArray(result.unavailableDates)) {
      return false
    }
    const isOccupied = result.unavailableDates.includes(dateStr)
    return isOccupied
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="modal-container relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <HiCalculator className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {t('property.priceCalculator.title')}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {t('property.priceCalculator.subtitle')}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <HiX className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Content - СИНИЙ SCROLLBAR */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto price-calculator-scroll">
            {/* Date Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check-in */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <HiCalendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>{t('property.priceCalculator.checkIn')}</span>
                </label>
                <DatePicker
                  selected={checkIn}
                  onChange={setCheckIn}
                  minDate={new Date()}
                  filterDate={isDateAvailable}
                  dateFormat="dd.MM.yyyy"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 
                           rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                           text-gray-900 dark:text-white font-medium transition-all"
                  placeholderText={t('property.priceCalculator.selectCheckIn')}
                  calendarClassName="!shadow-2xl !rounded-2xl"
                  popperClassName="!z-[999]"
                  popperPlacement="top-start"
                  popperModifiers={[
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 8],
                      },
                    },
                    {
                      name: 'preventOverflow',
                      options: {
                        rootBoundary: 'viewport',
                        tether: false,
                        altAxis: true,
                      },
                    },
                  ]}
                />
              </motion.div>

              {/* Check-out */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <HiCalendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>{t('property.priceCalculator.checkOut')}</span>
                </label>
                <DatePicker
                  selected={checkOut}
                  onChange={setCheckOut}
                  minDate={checkIn || new Date()}
                  filterDate={isDateAvailable}
                  dateFormat="dd.MM.yyyy"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 
                           rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                           text-gray-900 dark:text-white font-medium transition-all"
                  placeholderText={t('property.priceCalculator.selectCheckOut')}
                  calendarClassName="!shadow-2xl !rounded-2xl"
                  popperClassName="!z-[999]"
                  popperPlacement="top-start"
                  popperModifiers={[
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 8],
                      },
                    },
                    {
                      name: 'preventOverflow',
                      options: {
                        rootBoundary: 'viewport',
                        tether: false,
                        altAxis: true,
                      },
                    },
                  ]}
                />
              </motion.div>
            </div>

            {/* Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCalculate}
                disabled={loading || !checkIn || !checkOut}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                         disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                         text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg
                         flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <HiCalculator className="w-5 h-5" />
                    <span>{t('property.priceCalculator.calculate')}</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="px-6 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                         text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all shadow-md"
              >
                {t('property.priceCalculator.reset')}
              </motion.button>
            </motion.div>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 
                           rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <HiSparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t('property.priceCalculator.result')}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Total Price - ЗЕЛЕНАЯ КАРТОЧКА */}
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium mb-1">
                            {t('property.priceCalculator.totalPrice')}
                          </p>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-bold text-white">
                              ฿{Math.round(result.totalPrice).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                          <HiCurrencyDollar className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    {/* ДИСКЛЕЙМЕР О НЕДОСТУПНОСТИ */}
                    {result.isAvailable === false && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 
                                 p-5 rounded-2xl border-2 border-red-200 dark:border-red-800 shadow-md"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">😔</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-red-900 dark:text-red-200 mb-2">
                              {t('property.priceCalculator.unavailableTitle')}
                            </h4>
                            <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                              {t('property.priceCalculator.unavailableText', { 
                                propertyName: result.propertyName || property?.name || t('property.thisProperty')
                              })}
                            </p>
                            {result.unavailableDates && result.unavailableDates.length > 0 && (
                              <div className="mt-3 text-xs text-red-700 dark:text-red-400">
                                <span className="font-semibold">{t('property.priceCalculator.unavailableDatesCount')}:</span> {result.unavailableDates.length}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Nights & Average - КАРТОЧКИ */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <HiMoon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {t('property.priceCalculator.nights')}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {result.nights}
                        </p>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <HiCurrencyDollar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {t('property.priceCalculator.averagePerNight')}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ฿{Math.round(result.pricePerNight).toLocaleString()}
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  {result.breakdown && result.breakdown.length > 0 && (
                    <div className="mt-6">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 
                                 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                                 border border-gray-200 dark:border-gray-600"
                      >
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('property.priceCalculator.viewBreakdown')}
                        </span>
                        <motion.div
                          animate={{ rotate: showBreakdown ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <HiChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {showBreakdown && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-2 breakdown-scroll">
                              {result.breakdown.map((day, index) => {
                                const occupied = isDateOccupied(day.date)
                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between p-3 rounded-lg transition-all
                                             ${occupied 
                                               ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 ring-2 ring-red-300 dark:ring-red-700' 
                                               : 'bg-white dark:bg-gray-800 border-2 border-green-400 dark:border-green-600 ring-2 ring-green-300 dark:ring-green-700 hover:shadow-md'
                                             }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <HiCalendar className={`w-4 h-4 ${occupied ? 'text-red-500' : 'text-green-500'}`} />
                                      <span className={`text-sm font-medium ${occupied ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {new Date(day.date).toLocaleDateString('ru-RU', { 
                                          day: 'numeric', 
                                          month: 'short' 
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {/* Статус доступности - ТОЛЬКО DESKTOP */}
                                      {occupied ? (
                                        <span className="hidden md:flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                          <HiBan className="w-3.5 h-3.5" />
                                          <span>{t('property.priceCalculator.occupied')}</span>
                                        </span>
                                      ) : (
                                        <span className="hidden md:flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                          <HiCheckCircle className="w-3.5 h-3.5" />
                                          <span>{t('property.priceCalculator.available')}</span>
                                        </span>
                                      )}
                                      {/* Тип сезона */}
                                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getSeasonColor(day.seasonType)}`}>
                                        {t(`property.seasons.${day.seasonType}`)}
                                      </span>
                                      {/* Цена */}
                                      <span className={`text-sm font-bold min-w-[80px] text-right ${occupied ? 'text-red-900 dark:text-red-200' : 'text-gray-900 dark:text-white'}`}>
                                        ฿{Math.round(day.price).toLocaleString()}
                                      </span>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 rounded-b-3xl">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center leading-relaxed">
              {t('property.priceCalculator.disclaimer')}
            </p>
          </div>
        </motion.div>

        {/* СТИЛИ ДЛЯ СИНЕГО SCROLLBAR */}
        <style jsx>{`
          .price-calculator-scroll::-webkit-scrollbar {
            width: 8px;
          }
          
          .price-calculator-scroll::-webkit-scrollbar-track {
            background: rgba(229, 231, 235, 0.5);
            border-radius: 10px;
          }
          
          .price-calculator-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #2563eb);
            border-radius: 10px;
          }
          
          .price-calculator-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #1d4ed8);
          }

          .breakdown-scroll::-webkit-scrollbar {
            width: 6px;
          }
          
          .breakdown-scroll::-webkit-scrollbar-track {
            background: rgba(229, 231, 235, 0.3);
            border-radius: 10px;
          }
          
          .breakdown-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #2563eb);
            border-radius: 10px;
          }
          
          .breakdown-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #1d4ed8);
          }

          /* Dark mode */
          .dark .price-calculator-scroll::-webkit-scrollbar-track,
          .dark .breakdown-scroll::-webkit-scrollbar-track {
            background: rgba(55, 65, 81, 0.5);
          }
        `}</style>
      </div>
    </AnimatePresence>
  )
}

export default PriceCalculator