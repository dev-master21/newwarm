import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronLeft, HiChevronRight, HiCalendar, HiX } from 'react-icons/hi'
import {
  getTodayInBangkok,
  toDateStrBangkok,
  getDaysInMonthBangkok,
  isPastDateBangkok,
  formatDateForDisplay,
  calculateNights
} from '../../utils/dateUtils'

const PropertyCalendar = ({ blockedDates = [], bookings = [], onDateRangeSelect }) => {
  const { t } = useTranslation()
  const [currentMonth, setCurrentMonth] = useState(getTodayInBangkok())
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
  const [hoveredDate, setHoveredDate] = useState(null)
  const [freeFirstDays, setFreeFirstDays] = useState(new Set())

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  // Утилита: извлекаем ТОЛЬКО YYYY-MM-DD
  const extractDateStr = (dateValue) => {
    if (!dateValue) return null
    const str = String(dateValue)
    // Берем первые 10 символов если формат YYYY-MM-DD
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
      return str.substring(0, 10)
    }
    return null
  }

  // Утилита: добавить N дней к дате (работа со строками)
  const addDays = (dateStr, days) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    date.setUTCDate(date.getUTCDate() + days)
    
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, '0')
    const d = String(date.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // Утилита: разница между датами в днях
  const daysDiff = (date1Str, date2Str) => {
    const [y1, m1, d1] = date1Str.split('-').map(Number)
    const [y2, m2, d2] = date2Str.split('-').map(Number)
    
    const time1 = Date.UTC(y1, m1 - 1, d1)
    const time2 = Date.UTC(y2, m2 - 1, d2)
    
    return Math.round((time2 - time1) / (1000 * 60 * 60 * 24))
  }

  // ГЛАВНЫЙ useEffect
  useEffect(() => {
    console.log('🔄 ========== НАЧАЛО АНАЛИЗА ==========')
    
    // 1. Собираем ВСЕ даты
    const allDatesSet = new Set()
    
    console.log('📥 Исходные blockedDates:', blockedDates)
    
    // Из blockedDates
    blockedDates.forEach((block, idx) => {
      const dateStr = extractDateStr(block.blocked_date || block.date || block)
      if (dateStr) {
        allDatesSet.add(dateStr)
        if (idx < 5) console.log(`  📌 blockedDate[${idx}]:`, block, '→', dateStr)
      }
    })

    // Из bookings
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
      
      console.log(`  🔍 Сравниваю ${sortedDates[i - 1]} и ${sortedDates[i]}: разница ${diff} дней`)
      
      if (diff === 1) {
        currentPeriod.push(sortedDates[i])
      } else {
        periods.push([...currentPeriod])
        console.log(`  ✅ Период завершен: ${currentPeriod[0]} → ${currentPeriod[currentPeriod.length - 1]}`)
        currentPeriod = [sortedDates[i]]
      }
    }
    
    if (currentPeriod.length > 0) {
      periods.push(currentPeriod)
      console.log(`  ✅ Последний период: ${currentPeriod[0]} → ${currentPeriod[currentPeriod.length - 1]}`)
    }

    console.log(`📊 Всего периодов: ${periods.length}`)

    // 4. Первые дни периодов = СВОБОДНЫ
    const firstDaysSet = new Set()
    
    periods.forEach((period, index) => {
      const firstDay = period[0]
      const lastDay = period[period.length - 1]
      
      firstDaysSet.add(firstDay)
      
      console.log(`🏨 Период ${index + 1}:`)
      console.log(`   Даты: ${firstDay} → ${lastDay} (${period.length} дней)`)
      console.log(`   🟢 Первый день (СВОБОДЕН): ${firstDay}`)
      console.log(`   🔴 Последний день (ЗАНЯТ): ${lastDay}`)
    })

    console.log('🎯 ИТОГО СВОБОДНЫЕ (первые дни периодов):', Array.from(firstDaysSet))
    console.log('🔄 ========== КОНЕЦ АНАЛИЗА ==========')
    
    setFreeFirstDays(firstDaysSet)

  }, [blockedDates, bookings])

  // Проверка блокировки
  const isDateBlocked = (dateStr) => {
    if (!dateStr) return false

    const cleanDateStr = extractDateStr(dateStr)
    if (!cleanDateStr) return false

    // 1. Если первый день периода - СВОБОДЕН
    if (freeFirstDays.has(cleanDateStr)) {
      return false
    }

    // 2. Проверяем blockedDates
    const inBlocked = blockedDates.some(block => {
      const blockDate = extractDateStr(block.blocked_date || block.date || block)
      return blockDate === cleanDateStr
    })

    if (inBlocked) return true

    // 3. Проверяем bookings
    const inBookings = bookings.some(booking => {
      const checkIn = extractDateStr(booking.check_in_date || booking.check_in)
      const checkOut = extractDateStr(booking.check_out_date || booking.check_out)
      
      if (!checkIn || !checkOut) return false
      
      return cleanDateStr >= checkIn && cleanDateStr <= checkOut
    })

    return inBookings
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
    } else if (!selectedRange.end) {
      let checkIn, checkOut
      
      if (dateStr < selectedRange.start) {
        checkIn = dateStr
        checkOut = selectedRange.start
      } else {
        checkIn = selectedRange.start
        checkOut = dateStr
      }

      setSelectedRange({ start: checkIn, end: checkOut })

      if (onDateRangeSelect) {
        console.log('📅 Выбран период:', checkIn, '-', checkOut)
        setTimeout(() => {
          onDateRangeSelect({ checkIn, checkOut })
        }, 100)
      }
    } else {
      setSelectedRange({ start: dateStr, end: null })
    }
  }

  const clearSelection = () => {
    setSelectedRange({ start: null, end: null })
    setHoveredDate(null)
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