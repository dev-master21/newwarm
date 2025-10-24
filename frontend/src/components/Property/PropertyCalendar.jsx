import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronLeft, HiChevronRight, HiCalendar, HiX, HiExclamationCircle, HiArrowDown } from 'react-icons/hi'
import {
  getTodayInBangkok,
  toDateStrBangkok,
  getDaysInMonthBangkok,
  isPastDateBangkok,
  formatDateForDisplay,
  calculateNights
} from '../../utils/dateUtils'

const PropertyCalendar = ({ blockedDates = [], bookings = [], onDateRangeSelect, onShowAlternatives }) => {
  const { t } = useTranslation()
  const [currentMonth, setCurrentMonth] = useState(getTodayInBangkok())
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
  const [hoveredDate, setHoveredDate] = useState(null)
  const [freeFirstDays, setFreeFirstDays] = useState(new Set())
  const [showUnavailableMessage, setShowUnavailableMessage] = useState(false)

  const monthNames = [
    t('property.calendar.months.january'),
    t('property.calendar.months.february'),
    t('property.calendar.months.march'),
    t('property.calendar.months.april'),
    t('property.calendar.months.may'),
    t('property.calendar.months.june'),
    t('property.calendar.months.july'),
    t('property.calendar.months.august'),
    t('property.calendar.months.september'),
    t('property.calendar.months.october'),
    t('property.calendar.months.november'),
    t('property.calendar.months.december')
  ]

  const weekDays = [
    t('property.calendar.weekDays.mon'),
    t('property.calendar.weekDays.tue'),
    t('property.calendar.weekDays.wed'),
    t('property.calendar.weekDays.thu'),
    t('property.calendar.weekDays.fri'),
    t('property.calendar.weekDays.sat'),
    t('property.calendar.weekDays.sun')
  ]

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

  // Функция плавного скролла к альтернативным объектам
  const scrollToAlternatives = () => {
    const element = document.getElementById('alternatives')
    if (element) {
      const headerOffset = 120
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    
      const startPosition = window.pageYOffset
      const distance = offsetPosition - startPosition
      const duration = 1200 // Длительность анимации в миллисекундах
      let start = null
    
      const animation = (currentTime) => {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const progress = Math.min(timeElapsed / duration, 1)
        
        // Easing function для плавности (ease-in-out)
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
      
        window.scrollTo(0, startPosition + distance * ease)
      
        if (timeElapsed < duration) {
          requestAnimationFrame(animation)
        }
      }
    
      requestAnimationFrame(animation)
    }
  }

  useEffect(() => {
    const allDatesSet = new Set()
    
    blockedDates.forEach((block) => {
      const dateStr = extractDateStr(block.blocked_date || block.date || block)
      if (dateStr) {
        allDatesSet.add(dateStr)
      }
    })

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

    const sortedDates = Array.from(allDatesSet).sort()

    if (sortedDates.length === 0) {
      setFreeFirstDays(new Set())
      return
    }

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

    const firstDaysSet = new Set()
    
    periods.forEach((period) => {
      const firstDay = period[0]
      firstDaysSet.add(firstDay)
    })
    
    setFreeFirstDays(firstDaysSet)

  }, [blockedDates, bookings])

  const isDateBlocked = (dateStr) => {
    if (!dateStr) return false

    const cleanDateStr = extractDateStr(dateStr)
    if (!cleanDateStr) return false

    if (freeFirstDays.has(cleanDateStr)) {
      return false
    }

    const inBlocked = blockedDates.some(block => {
      const blockDate = extractDateStr(block.blocked_date || block.date || block)
      return blockDate === cleanDateStr
    })

    if (inBlocked) return true

    const inBookings = bookings.some(booking => {
      const checkIn = extractDateStr(booking.check_in_date || booking.check_in)
      const checkOut = extractDateStr(booking.check_out_date || booking.check_out)
      
      if (!checkIn || !checkOut) return false
      
      return cleanDateStr >= checkIn && cleanDateStr < checkOut
    })

    return inBookings
  }

  const isRangeAvailable = (startStr, endStr) => {
    if (!startStr || !endStr) return false
    
    let current = startStr
    while (current < endStr) {
      if (isDateBlocked(current)) {
        return false
      }
      current = addDays(current, 1)
    }
    
    return true
  }

  const isInSelectedRange = (dateStr) => {
    if (!selectedRange.start || !dateStr) return false
    
    const start = selectedRange.start
    const end = selectedRange.end || hoveredDate

    if (end) {
      return dateStr >= start && dateStr <= end
    }
    
    return dateStr === selectedRange.start
  }

  const handleDateClick = (dateStr) => {
    if (!dateStr || isDateBlocked(dateStr) || isPastDateBangkok(dateStr)) return

    if (!selectedRange.start) {
      setSelectedRange({ start: dateStr, end: null })
      setShowUnavailableMessage(false)
    } else if (!selectedRange.end) {
      let checkIn, checkOut
      
      if (dateStr < selectedRange.start) {
        checkIn = dateStr
        checkOut = selectedRange.start
      } else {
        checkIn = selectedRange.start
        checkOut = dateStr
      }

      const isAvailable = isRangeAvailable(checkIn, checkOut)
      
      if (!isAvailable) {
        setShowUnavailableMessage(true)
        
        if (onShowAlternatives) {
          const nights = calculateNights(checkIn, checkOut)
          onShowAlternatives({
            startDate: checkIn,
            endDate: checkOut,
            nightsCount: nights
          })
        }
        
        setSelectedRange({ start: null, end: null })
        
        setTimeout(() => {
          setShowUnavailableMessage(false)
        }, 8000)
        
        return
      }

      setShowUnavailableMessage(false)
      setSelectedRange({ start: checkIn, end: checkOut })

      if (onDateRangeSelect) {
        setTimeout(() => {
          onDateRangeSelect({ checkIn, checkOut })
        }, 100)
      }
    } else {
      setSelectedRange({ start: dateStr, end: null })
      setShowUnavailableMessage(false)
    }
  }

  const clearSelection = () => {
    setSelectedRange({ start: null, end: null })
    setHoveredDate(null)
    setShowUnavailableMessage(false)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentMonth(getTodayInBangkok())
  }

  const days = getDaysInMonthBangkok(currentMonth)
  const todayStr = toDateStrBangkok(getTodayInBangkok())

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <HiCalendar className="w-6 h-6 text-blue-500" />
          <span>{t('property.calendar.title')}</span>
        </h3>
        
        {selectedRange.start && (
          <button
            onClick={clearSelection}
            className="text-sm text-red-500 hover:text-red-600 flex items-center space-x-1"
          >
            <HiX className="w-4 h-4" />
            <span>{t('property.calendar.clearSelection')}</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showUnavailableMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="relative bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 
                     border-2 border-red-300 dark:border-red-700 rounded-xl p-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-orange-400/10 animate-pulse" />
            <div className="relative flex items-start space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <HiExclamationCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-red-900 dark:text-red-100 mb-1">
                  {t('property.calendar.periodUnavailableTitle')}
                </h4>
                <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                  {t('property.calendar.periodUnavailableText')}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToAlternatives}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 
                           hover:from-red-700 hover:to-orange-700 text-white font-semibold 
                           py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <span>{t('property.calendar.viewAlternatives')}</span>
                  <HiArrowDown className="w-4 h-4" />
                </motion.button>
              </div>
              <button
                onClick={() => setShowUnavailableMessage(false)}
                className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors"
              >
                <HiX className="w-5 h-5 text-red-700 dark:text-red-300" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <HiChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="flex items-center space-x-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={goToToday}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            {t('property.calendar.today')}
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <HiChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const isBlocked = isDateBlocked(day.dateStr)
          const isPast = isPastDateBangkok(day.dateStr)
          const isSelected = isInSelectedRange(day.dateStr)
          const isToday = day.dateStr === todayStr

          return (
            <motion.button
              key={day.dateStr}
              onClick={() => handleDateClick(day.dateStr)}
              onMouseEnter={() => !isBlocked && !isPast && setHoveredDate(day.dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={isBlocked || isPast}
              whileHover={!isBlocked && !isPast ? { scale: 1.05 } : {}}
              whileTap={!isBlocked && !isPast ? { scale: 0.95 } : {}}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                transition-all duration-200 relative
                ${isBlocked || isPast
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through'
                  : isSelected
                  ? 'bg-blue-500 text-white shadow-lg'
                  : isToday
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }
              `}
            >
              {day.day}
              {isBlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-full bg-red-400 transform rotate-45" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" />
            <span className="text-gray-600 dark:text-gray-400">{t('property.calendar.available')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-full bg-red-400 transform rotate-45" />
              </div>
            </div>
            <span className="text-gray-600 dark:text-gray-400">{t('property.calendar.blocked')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">{t('property.calendar.selected')}</span>
          </div>
        </div>
      </div>

      {selectedRange.start && selectedRange.end && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{t('property.calendar.selectedDates')}:</span>{' '}
            {formatDateForDisplay(selectedRange.start)} - {formatDateForDisplay(selectedRange.end)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {calculateNights(selectedRange.start, selectedRange.end)} {t('property.calendar.nights')}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default PropertyCalendar