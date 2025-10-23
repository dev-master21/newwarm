import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronLeft, HiChevronRight, HiCalendar, HiX } from 'react-icons/hi'

const PropertyCalendar = ({ blockedDates = [], bookings = [], onDateRangeSelect }) => {
  const { t } = useTranslation()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
  const [hoveredDate, setHoveredDate] = useState(null)

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  // Получаем дни месяца
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Начало недели (понедельник = 1, воскресенье = 0)
    let firstDayOfWeek = firstDay.getDay()
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const days = []
    
    // Пустые ячейки в начале
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        day,
        date,
        dateStr: date.toISOString().split('T')[0]
      })
    }

    return days
  }

  // Проверка, занята ли дата
  const isDateBlocked = (dateStr) => {
    if (!dateStr) return false

    // Проверяем календарные блокировки
    if (blockedDates.some(block => block.date === dateStr)) {
      return true
    }

    // Проверяем бронирования
    return bookings.some(booking => {
      const checkIn = new Date(booking.check_in_date)
      const checkOut = new Date(booking.check_out_date)
      const currentDate = new Date(dateStr)
      return currentDate >= checkIn && currentDate <= checkOut
    })
  }

  // Проверка, является ли дата прошлой
  const isPastDate = (dateStr) => {
    if (!dateStr) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(dateStr) < today
  }

  // Проверка, находится ли дата в выбранном диапазоне
  const isInSelectedRange = (dateStr) => {
    if (!selectedRange.start || !dateStr) return false
    
    const date = new Date(dateStr)
    const start = new Date(selectedRange.start)
    const end = selectedRange.end ? new Date(selectedRange.end) : (hoveredDate ? new Date(hoveredDate) : null)

    if (end) {
      return date >= start && date <= end
    }
    
    return dateStr === selectedRange.start
  }

  // Обработка клика по дате
  const handleDateClick = (dateStr) => {
    if (!dateStr || isDateBlocked(dateStr) || isPastDate(dateStr)) return

    if (!selectedRange.start) {
      setSelectedRange({ start: dateStr, end: null })
    } else if (!selectedRange.end) {
      const start = new Date(selectedRange.start)
      const end = new Date(dateStr)
      
      if (end < start) {
        setSelectedRange({ start: dateStr, end: selectedRange.start })
      } else {
        setSelectedRange({ start: selectedRange.start, end: dateStr })
      }

      // Вызываем callback
      if (onDateRangeSelect) {
        setTimeout(() => {
          onDateRangeSelect({
            checkIn: end < start ? dateStr : selectedRange.start,
            checkOut: end < start ? selectedRange.start : dateStr
          })
        }, 100)
      }
    } else {
      setSelectedRange({ start: dateStr, end: null })
    }
  }

  // Очистка выбора
  const clearSelection = () => {
    setSelectedRange({ start: null, end: null })
    setHoveredDate(null)
  }

  // Навигация по месяцам
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const days = getDaysInMonth()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {/* Заголовок */}
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

      {/* Навигация по месяцам */}
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

      {/* Дни недели */}
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

      {/* Календарная сетка */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const isBlocked = isDateBlocked(day.dateStr)
          const isPast = isPastDate(day.dateStr)
          const isSelected = isInSelectedRange(day.dateStr)
          const isToday = day.dateStr === new Date().toISOString().split('T')[0]

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

      {/* Легенда */}
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

      {/* Информация о выбранном диапазоне */}
      {selectedRange.start && selectedRange.end && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{t('property.calendar.selectedDates')}:</span>{' '}
            {new Date(selectedRange.start).toLocaleDateString('ru-RU')} - {new Date(selectedRange.end).toLocaleDateString('ru-RU')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {Math.ceil((new Date(selectedRange.end) - new Date(selectedRange.start)) / (1000 * 60 * 60 * 24))} {t('property.calendar.nights')}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default PropertyCalendar