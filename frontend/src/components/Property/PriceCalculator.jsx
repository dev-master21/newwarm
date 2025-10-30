// frontend/src/components/Property/PriceCalculator.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiCalculator, HiCurrencyDollar, HiCalendar, HiMoon, HiSparkles, HiChevronDown, HiCheckCircle, HiBan, HiExclamationCircle } from 'react-icons/hi'
import DatePicker from 'react-datepicker'
import { propertyService } from '../../services/property.service'
import toast from 'react-hot-toast'
import 'react-datepicker/dist/react-datepicker.css'
import { dateToLocalDateStr } from '../../utils/dateUtils'

const PriceCalculator = ({ propertyId, property, isOpen, onClose, blockedDates = [], bookings = [], initialCheckIn = null, initialCheckOut = null, onOpenBooking, onShowAlternatives }) => {  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [checkIn, setCheckIn] = useState(initialCheckIn ? new Date(initialCheckIn) : null)
  const [checkOut, setCheckOut] = useState(initialCheckOut ? new Date(initialCheckOut) : null)
  const [result, setResult] = useState(null)
  const [showBreakdown, setShowBreakdown] = useState(false) // ИЗМЕНЕНО: по умолчанию false
  const [freeFirstDays, setFreeFirstDays] = useState(new Set())

  // Обновление дат при изменении пропсов
  useEffect(() => {
    if (initialCheckIn) {
      setCheckIn(new Date(initialCheckIn))
    }
    if (initialCheckOut) {
      setCheckOut(new Date(initialCheckOut))
    }
  }, [initialCheckIn, initialCheckOut])

  // Автоматический расчет при открытии с датами
  useEffect(() => {
    console.log('📊 PriceCalculator useEffect:', { 
      isOpen, 
      initialCheckIn, 
      initialCheckOut, 
      checkIn, 
      checkOut 
    })

    if (isOpen && checkIn && checkOut) {
      const timer = setTimeout(() => {
        console.log('🔄 Запускаем автоматический расчет')
        handleCalculate()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, checkIn, checkOut])

  // Анализ периодов (как в PropertyCalendar)
  useEffect(() => {
    console.log('🔄 ========== АНАЛИЗ ПЕРИОДОВ В КАЛЬКУЛЯТОРЕ ==========')
    
    // Утилиты
    const extractDateStr = (dateValue) => {
      if (!dateValue) return null
      const str = String(dateValue)
      if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
        return str.substring(0, 10)
      }
      return null
    }

    const addDays = (dateStr, days) => {
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(Date.UTC(year, month - 1, day))
      date.setUTCDate(date.getUTCDate() + days)
      
      const y = date.getUTCFullYear()
      const m = String(date.getUTCMonth() + 1).padStart(2, '0')
      const d = String(date.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    const daysDiff = (date1Str, date2Str) => {
      const [y1, m1, d1] = date1Str.split('-').map(Number)
      const [y2, m2, d2] = date2Str.split('-').map(Number)
      
      const time1 = Date.UTC(y1, m1 - 1, d1)
      const time2 = Date.UTC(y2, m2 - 1, d2)
      
      return Math.round((time2 - time1) / (1000 * 60 * 60 * 24))
    }

    // 1. Собираем ВСЕ даты
    const allDatesSet = new Set()
    
    // Из blockedDates
    blockedDates.forEach((block) => {
      const dateStr = extractDateStr(block.blocked_date || block.date || block)
      if (dateStr) {
        allDatesSet.add(dateStr)
      }
    })

    // Из bookings
    if (bookings && Array.isArray(bookings)) {
      bookings.forEach(booking => {
        const checkIn = extractDateStr(booking.check_in_date || booking.check_in)
        const checkOut = extractDateStr(booking.check_out_date || booking.check_out)
        
        if (checkIn && checkOut) {
          let current = checkIn
          while (current <= checkOut) {
            allDatesSet.add(current)
            current = addDays(current, 1)
          }
        }
      })
    }

    // 2. Сортируем
    const sortedDates = Array.from(allDatesSet).sort()
    console.log('📅 ВСЕ даты отсортированные:', sortedDates)

    if (sortedDates.length === 0) {
      console.log('⚠️ Нет дат')
      setFreeFirstDays(new Set())
      return
    }

    // 3. Находим периоды
    const periods = []
    let currentPeriod = [sortedDates[0]]

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = daysDiff(sortedDates[i - 1], sortedDates[i])
      
      if (diff === 1) {
        currentPeriod.push(sortedDates[i])
      } else {
        periods.push([...currentPeriod])
        currentPeriod = [sortedDates[i]]
      }
    }
    
    if (currentPeriod.length > 0) {
      periods.push(currentPeriod)
    }

    console.log(`📊 Всего периодов: ${periods.length}`)

    // 4. Первые дни периодов = СВОБОДНЫ
    const firstDaysSet = new Set()
    
    periods.forEach((period, index) => {
      const firstDay = period[0]
      firstDaysSet.add(firstDay)
      
      console.log(`🏨 Период ${index + 1}: ${firstDay} → ${period[period.length - 1]}`)
      console.log(`   🟢 Первый день (СВОБОДЕН): ${firstDay}`)
    })

    console.log('🎯 ИТОГО СВОБОДНЫЕ (первые дни периодов):', Array.from(firstDaysSet))
    console.log('🔄 ========== КОНЕЦ АНАЛИЗА ==========')
    
    setFreeFirstDays(firstDaysSet)

  }, [blockedDates, bookings])

  // Проверка доступности даты с учетом периодов (для DatePicker)
  const isDateAvailable = (date) => {
    const dateStr = dateToLocalDateStr(date)
    
    // 1. Если первый день периода - СВОБОДЕН
    if (freeFirstDays.has(dateStr)) {
      console.log(`✅ Дата ${dateStr} - первый день периода, СВОБОДНА`)
      return true
    }
    
    // 2. Проверяем blockedDates
    const isBlocked = blockedDates.some(block => {
      const blockDateStr = typeof block === 'string' ? block : (block.date || block.blocked_date)
      return blockDateStr?.substring(0, 10) === dateStr
    })
    
    if (isBlocked) {
      console.log(`❌ Дата ${dateStr} в blockedDates`)
      return false
    }
    
    // 3. Проверяем bookings
    if (bookings && Array.isArray(bookings)) {
      const inBooking = bookings.some(booking => {
        const checkIn = typeof booking.check_in === 'string' 
          ? booking.check_in.substring(0, 10)
          : (booking.check_in_date ? booking.check_in_date.substring(0, 10) : null)
        const checkOut = typeof booking.check_out === 'string'
          ? booking.check_out.substring(0, 10)
          : (booking.check_out_date ? booking.check_out_date.substring(0, 10) : null)
        
        if (!checkIn || !checkOut) return false
        
        return dateStr >= checkIn && dateStr < checkOut
      })
      
      if (inBooking) {
        console.log(`❌ Дата ${dateStr} в bookings`)
        return false
      }
    }
    
    console.log(`✅ Дата ${dateStr} свободна`)
    return true
  }

  // Расчет стоимости
  const handleCalculate = async () => {
    if (!checkIn || !checkOut) {
      toast.error(t('property.priceCalculator.selectDates'))
      return
    }

    try {
      setLoading(true)
      
      const checkInStr = dateToLocalDateStr(checkIn)
      const checkOutStr = dateToLocalDateStr(checkOut)
      
      console.log('💰 Расчет цены для периода:', checkInStr, '-', checkOutStr)
      
      const response = await propertyService.calculatePrice(
        propertyId,
        checkInStr,
        checkOutStr
      )

      if (response.success) {
        console.log('📊 Результат расчета:', response.data)
        
        // НОВОЕ: Проверяем наличие дней с нулевой ценой
        const hasZeroPriceDays = response.data.hasZeroPriceDays || false
        const zeroPriceDaysCount = response.data.breakdown?.filter((d) => d.isZeroPrice).length || 0
        
        // Анализ доступности каждого дня
        const enhancedBreakdown = response.data.breakdown.map(day => ({
          ...day,
          isOccupied: isDateOccupiedInPeriod(day.date)
        }))

        // Считаем свободные и занятые дни
        const occupiedDaysInPeriod = enhancedBreakdown.filter(d => d.isOccupied).length
        const freeDaysInPeriod = enhancedBreakdown.filter(d => !d.isOccupied).length
        
        // ИЗМЕНЕНО: Дни с нулевой ценой также считаем как "занятые" для UI
        const hasOccupiedDays = occupiedDaysInPeriod > 0 || hasZeroPriceDays

        setResult({
          ...response.data,
          breakdown: enhancedBreakdown,
          hasOccupiedDays,
          occupiedDaysCount: occupiedDaysInPeriod,
          freeDaysCount: freeDaysInPeriod,
          hasZeroPriceDays, // НОВОЕ
          zeroPriceDaysCount // НОВОЕ
        })
        
        // ИЗМЕНЕНО: Убрали автоматическое открытие breakdown
        setShowBreakdown(false)
        
        // Toast уведомления
        if (hasZeroPriceDays) {
          // НОВОЕ: Уведомление о днях с особыми ценами
          toast.error(t('property.priceCalculator.hasSpecialPricing'), {
            duration: 5000,
            icon: '⚠️'
          })
        } else if (occupiedDaysInPeriod > 0) {
          const daysWord = occupiedDaysInPeriod === 1 ? t('property.priceCalculator.day') : t('property.priceCalculator.days')
          toast.error(`${t('property.priceCalculator.toastOccupiedDays')} ${occupiedDaysInPeriod} ${daysWord} ${t('property.priceCalculator.occupiedShort').toLowerCase()}`)
        } else {
          toast.success(t('property.priceCalculator.toastAllFree'))
        }
      }
    } catch (error) {
      console.error('Error calculating price:', error)
      toast.error(t('property.priceCalculator.error'))
    } finally {
      setLoading(false)
    }
  }

  // Проверка занятости даты в выбранном периоде (для breakdown)
  const isDateOccupiedInPeriod = (dateStr) => {
    // Проверяем календарь
    const inCalendar = blockedDates.some(blocked => {
      const blockedStr = typeof blocked === 'string' 
        ? (blocked.match(/^\d{4}-\d{2}-\d{2}/) ? blocked.substring(0, 10) : null)
        : dateToLocalDateStr(blocked)
      return blockedStr === dateStr
    })
    
    if (inCalendar) {
      return true
    }
    
    // Проверяем бронирования
    if (bookings && bookings.length > 0) {
      const inBooking = bookings.some(booking => {
        const checkInStr = typeof booking.check_in === 'string' 
          ? booking.check_in.substring(0, 10) 
          : (booking.check_in_date ? booking.check_in_date.substring(0, 10) : null)
        const checkOutStr = typeof booking.check_out === 'string' 
          ? booking.check_out.substring(0, 10) 
          : (booking.check_out_date ? booking.check_out_date.substring(0, 10) : null)
        
        if (!checkInStr || !checkOutStr) return false
        
        return dateStr >= checkInStr && dateStr < checkOutStr
      })
      
      return inBooking
    }
    
    return false
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

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="modal-container relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                >
                  <HiCalculator className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {t('property.priceCalculator.title')}
                  </h3>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {t('property.priceCalculator.subtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center
                         transition-all text-white hover:rotate-90 duration-300"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="modal-content p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Date Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Check-in */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <HiCalendar className="inline w-4 h-4 mr-1.5" />
                  {t('property.priceCalculator.checkIn')}
                </label>
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  placeholderText={t('property.priceCalculator.selectCheckIn')}
                  dateFormat="dd/MM/yyyy"
                  filterDate={isDateAvailable}
                  dayClassName={(date) => {
                    const dateStr = dateToLocalDateStr(date)
                    if (freeFirstDays.has(dateStr)) {
                      return 'first-free-date'
                    }
                    if (!isDateAvailable(date)) {
                      return 'occupied-date'
                    }
                    return undefined
                  }}
                  highlightDates={Array.from(freeFirstDays).map(d => new Date(d))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                           dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <HiCalendar className="inline w-4 h-4 mr-1.5" />
                  {t('property.priceCalculator.checkOut')}
                </label>
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn || new Date()}
                  placeholderText={t('property.priceCalculator.selectCheckOut')}
                  dateFormat="dd/MM/yyyy"
                  filterDate={isDateAvailable}
                  dayClassName={(date) => {
                    const dateStr = dateToLocalDateStr(date)
                    if (freeFirstDays.has(dateStr)) {
                      return 'first-free-date'
                    }
                    if (!isDateAvailable(date)) {
                      return 'occupied-date'
                    }
                    return undefined
                  }}
                  highlightDates={Array.from(freeFirstDays).map(d => new Date(d))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                           dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mb-6">
              <button
                onClick={handleCalculate}
                disabled={!checkIn || !checkOut || loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                         disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700
                         text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg
                         disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98]
                         flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>{t('property.priceCalculator.calculating')}</span>
                  </>
                ) : (
                  <>
                    <HiCalculator className="w-5 h-5" />
                    <span>{t('property.priceCalculator.calculate')}</span>
                  </>
                )}
              </button>

              {result && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                           text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                >
                  {t('property.priceCalculator.reset')}
                </button>
              )}
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* НОВОЕ: Предупреждение о днях с нулевой ценой */}
                  {result.hasZeroPriceDays && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <HiExclamationCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                            {t('property.priceCalculator.priceNotAvailable')}
                          </h4>
                          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-3">
                            {t('property.priceCalculator.priceNotAvailableDesc')}
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {onShowAlternatives && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  onShowAlternatives({
                                    startDate: dateToLocalDateStr(checkIn),
                                    endDate: dateToLocalDateStr(checkOut),
                                    bedrooms: property?.bedrooms || 1
                                  })
                                  onClose()
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
                                         text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all
                                         flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg"
                              >
                                <HiSparkles className="w-4 h-4" />
                                <span>{t('property.priceCalculator.viewAlternatives')}</span>
                              </motion.button>
                            )}
                            
                            <button
                              onClick={onClose}
                              className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 
                                       bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-lg transition-colors"
                            >
                              {t('property.priceCalculator.contactUs')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Availability Status Card */}
                  {result.hasOccupiedDays && !result.hasZeroPriceDays && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 
                               p-4 rounded-xl border-2 border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <HiBan className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                            {t('property.priceCalculator.periodHasOccupiedDates')}
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs text-red-800 dark:text-red-300 mb-3">
                        {t('property.priceCalculator.viewDetailsBelow')}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {onOpenBooking && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              onOpenBooking(dateToLocalDateStr(checkIn), dateToLocalDateStr(checkOut))
                              onClose()
                            }}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                                     text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all
                                     flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg"
                          >
                            <HiCheckCircle className="w-4 h-4" />
                            <span>{t('property.priceCalculator.bookNow')}</span>
                          </motion.button>
                        )}
                        
                        {onShowAlternatives && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              onShowAlternatives({
                                startDate: dateToLocalDateStr(checkIn),
                                endDate: dateToLocalDateStr(checkOut),
                                bedrooms: property?.bedrooms || 1
                              })
                              onClose()
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
                                     text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all
                                     flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg"
                          >
                            <HiSparkles className="w-4 h-4" />
                            <span>{t('property.priceCalculator.viewAlternatives')}</span>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Booking Button (when all dates free) */}
                  {!result.hasOccupiedDays && onOpenBooking && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                                 p-4 rounded-xl border-2 border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="text-sm font-bold text-green-900 dark:text-green-200">
                            {t('property.priceCalculator.propertyFullyAvailable')}
                          </h4>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onOpenBooking(dateToLocalDateStr(checkIn), dateToLocalDateStr(checkOut))
                            onClose()
                          }}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                                   text-white font-semibold py-3 px-4 rounded-xl transition-all
                                   flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <HiCheckCircle className="w-5 h-5" />
                          <span>{t('property.bookNow')}</span>
                        </motion.button>
                      </motion.div>
                    )}

                  {/* Price Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                                p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('property.priceCalculator.totalPrice')}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {t('property.priceCalculator.reset')}
                      </motion.button>
                    </div>

                    <div className="flex items-baseline space-x-2 mb-4">
                      <HiCurrencyDollar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ฿{result.totalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl">
                        <div className="flex items-center space-x-2 mb-1">
                          <HiMoon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {t('property.priceCalculator.nights')}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {result.nights}
                        </span>
                      </div>

                      <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl">
                        <div className="flex items-center space-x-2 mb-1">
                          <HiCurrencyDollar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {t('property.priceCalculator.averagePerNight')}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ฿{result.pricePerNight.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Toggle */}
                    {result.breakdown && result.breakdown.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 
                                 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 
                                 dark:hover:border-blue-500 transition-all"
                      >
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t('property.priceCalculator.viewBreakdown')}
                        </span>
                        <motion.div
                          animate={{ rotate: showBreakdown ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <HiChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </motion.div>
                      </motion.button>
                    )}
                  </div>

                  {/* Price Breakdown с цветовой индикацией */}
                  <AnimatePresence>
                    {showBreakdown && result.breakdown && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 max-h-96 overflow-y-auto"
                      >
                        {result.breakdown.map((day, index) => (
                          <motion.div
                            key={day.date}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all
                              ${day.isZeroPrice
                                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700'
                                : day.isOccupied
                                  ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700'
                                  : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                ${day.isZeroPrice
                                  ? 'bg-amber-500'
                                  : day.isOccupied
                                    ? 'bg-red-500'
                                    : 'bg-green-500'
                                }`}
                              >
                                {day.isZeroPrice ? (
                                  <HiExclamationCircle className="w-5 h-5 text-white" />
                                ) : day.isOccupied ? (
                                  <HiBan className="w-5 h-5 text-white" />
                                ) : (
                                  <HiCheckCircle className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {new Date(day.date).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getSeasonColor(day.seasonType)}`}>
                                    {t(`property.seasons.${day.seasonType}`)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                day.isZeroPrice
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : day.isOccupied
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                              }`}>
                                {day.isZeroPrice 
                                  ? t('property.pricing.onRequest')
                                  : `฿${day.price.toLocaleString()}`
                                }
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Disclaimer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-gray-500 dark:text-gray-400 text-center italic"
                  >
                    {t('property.priceCalculator.disclaimer')}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 
                              rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiCalendar className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('property.priceCalculator.selectDates')}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PriceCalculator