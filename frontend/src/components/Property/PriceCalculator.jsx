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
        const checkIn = booking.check_in_date || booking.check_in
        const checkOut = booking.check_out_date || booking.check_out
        
        if (!checkIn || !checkOut) return false
        
        const checkInStr = typeof checkIn === 'string' ? checkIn.substring(0, 10) : checkIn
        const checkOutStr = typeof checkOut === 'string' ? checkOut.substring(0, 10) : checkOut
        
        return dateStr >= checkInStr && dateStr <= checkOutStr
      })
      
      if (inBooking) {
        console.log(`❌ Дата ${dateStr} в bookings`)
        return false
      }
    }
    
    console.log(`✅ Дата ${dateStr} свободна`)
    return true
  }

  // Проверка занятости КОНКРЕТНОЙ даты (для расчета и визуализации)
  const isDateOccupiedInPeriod = (dateStr) => {
    // 1. Если первый день периода - СВОБОДЕН
    if (freeFirstDays.has(dateStr)) {
      return false
    }
    
    // 2. Проверяем blockedDates
    const isBlocked = blockedDates.some(block => {
      const blockDateStr = typeof block === 'string' ? block : (block.date || block.blocked_date)
      return blockDateStr?.substring(0, 10) === dateStr
    })
    
    if (isBlocked) {
      return true
    }
    
    // 3. Проверяем bookings
    if (bookings && Array.isArray(bookings)) {
      const inBooking = bookings.some(booking => {
        const checkIn = booking.check_in_date || booking.check_in
        const checkOut = booking.check_out_date || booking.check_out
        
        if (!checkIn || !checkOut) return false
        
        const checkInStr = typeof checkIn === 'string' ? checkIn.substring(0, 10) : checkIn
        const checkOutStr = typeof checkOut === 'string' ? checkOut.substring(0, 10) : checkOut
        
        return dateStr >= checkInStr && dateStr <= checkOutStr
      })
      
      return inBooking
    }
    
    return false
  }

  // НОВАЯ ФУНКЦИЯ: склонение слова "день"
  const getDaysWord = (count) => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return t('property.priceCalculator.day')
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return t('property.priceCalculator.daysGenitive')
    } else {
      return t('property.priceCalculator.days')
    }
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
        
        // Анализ доступности каждого дня
        const enhancedBreakdown = response.data.breakdown.map(day => ({
          ...day,
          isOccupied: isDateOccupiedInPeriod(day.date)
        }))

        // Считаем свободные и занятые дни
        const occupiedDaysInPeriod = enhancedBreakdown.filter(d => d.isOccupied).length
        const freeDaysInPeriod = enhancedBreakdown.filter(d => !d.isOccupied).length
        const hasOccupiedDays = occupiedDaysInPeriod > 0

        setResult({
          ...response.data,
          breakdown: enhancedBreakdown,
          hasOccupiedDays,
          occupiedDaysCount: occupiedDaysInPeriod,
          freeDaysCount: freeDaysInPeriod
        })
        
        // ИЗМЕНЕНО: Убрали автоматическое открытие breakdown
        setShowBreakdown(false)
        
        // Toast уведомления
        if (hasOccupiedDays) {
          const daysWord = getDaysWord(occupiedDaysInPeriod)
          toast.error(`${t('property.priceCalculator.toastOccupiedDays', { count: occupiedDaysInPeriod, days: daysWord })} ${t('property.priceCalculator.occupiedShort').toLowerCase()}`)
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
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                >
                  <HiCalculator className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {t('property.priceCalculator.title')}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {t('property.priceCalculator.subtitle')}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center 
                         transition-colors backdrop-blur-sm"
              >
                <HiX className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check In */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <HiCalendar className="w-5 h-5 text-blue-500" />
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
                  popperPlacement="bottom-start"
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

              {/* Check Out */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <HiCalendar className="w-5 h-5 text-purple-500" />
                  <span>{t('property.priceCalculator.checkOut')}</span>
                </label>
                <DatePicker
                  selected={checkOut}
                  onChange={setCheckOut}
                  minDate={checkIn || new Date()}
                  filterDate={isDateAvailable}
                  dateFormat="dd.MM.yyyy"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 
                           rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 
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

            {/* Calculate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCalculate}
              disabled={!checkIn || !checkOut || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                       disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                       text-white font-bold py-4 px-6 rounded-xl transition-all
                       flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl
                       transform disabled:transform-none"
            >
              {loading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>{t('property.priceCalculator.calculating')}</span>
                </>
              ) : (
                <>
                  <HiSparkles className="w-5 h-5" />
                  <span>{t('property.priceCalculator.calculate')}</span>
                </>
              )}
            </motion.button>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  {/* Предупреждение о занятых датах */}
                  {result.hasOccupiedDays && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 
                               p-5 rounded-xl border-2 border-orange-300 dark:border-orange-700"
                    >
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HiExclamationCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                            {t('property.priceCalculator.periodHasOccupiedDates')}
                          </h4>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <HiCheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">{t('property.priceCalculator.free')}</span>
                              </div>
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {result.freeDaysCount} {getDaysWord(result.freeDaysCount)}
                              </span>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <HiBan className="w-4 h-4 text-red-600" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">{t('property.priceCalculator.occupied')}</span>
                              </div>
                              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                {result.occupiedDaysCount} {getDaysWord(result.occupiedDaysCount)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                            {t('property.priceCalculator.viewDetailsBelow')}
                          </p>
                        </div>
                      </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (onShowAlternatives) {
                              // Сначала вызываем показ альтернатив
                              onShowAlternatives({
                                startDate: checkIn ? dateToLocalDateStr(checkIn) : null,
                                endDate: checkOut ? dateToLocalDateStr(checkOut) : null,
                                nightsCount: result.nights
                              })

                              // Плавно закрываем модальное окно
                              onClose()

                              // Увеличиваем задержку для гарантированного рендера
                              setTimeout(() => {
                                const scrollToAlternatives = () => {
                                  const alternativesSection = document.getElementById('alternatives')
                                  if (alternativesSection) {
                                    const yOffset = -120 // Отступ сверху
                                    const y = alternativesSection.getBoundingClientRect().top + window.pageYOffset + yOffset
                                  
                                    window.scrollTo({
                                      top: y,
                                      behavior: 'smooth'
                                    })
                                  }
                                }

                                // Пробуем скроллить несколько раз с интервалом
                                scrollToAlternatives()
                                setTimeout(scrollToAlternatives, 100)
                                setTimeout(scrollToAlternatives, 300)
                              }, 500)
                            }
                          }}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                                   text-white font-semibold py-3.5 px-6 rounded-xl transition-all
                                   flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <HiSparkles className="w-5 h-5" />
                          <span>{t('property.priceCalculator.viewAlternatives')}</span>
                        </motion.button>
                    </motion.div>
                  )}

                    {/* Успешный статус если все дни свободны */}
                    {!result.hasOccupiedDays && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                                 p-5 rounded-xl border-2 border-green-300 dark:border-green-700"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <HiCheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">
                              {t('property.priceCalculator.allDatesFree')}
                            </h4>
                            <p className="text-sm text-green-800 dark:text-green-200">
                              {t('property.priceCalculator.propertyFullyAvailable')}
                            </p>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onOpenBooking(checkIn, checkOut)
                            onClose()
                          }}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                                   text-white font-semibold py-3.5 px-6 rounded-xl transition-all
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
                              ${day.isOccupied
                                ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700'
                                : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                ${day.isOccupied
                                  ? 'bg-red-500'
                                  : 'bg-green-500'
                                }`}
                              >
                                {day.isOccupied ? (
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
                                day.isOccupied
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                ฿{day.price.toLocaleString()}
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