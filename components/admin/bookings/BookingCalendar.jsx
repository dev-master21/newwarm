// frontend/src/components/admin/bookings/BookingCalendar.jsx
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiHome, HiSparkles, HiX } from 'react-icons/hi'

const BookingCalendar = ({ 
  currentMonth, 
  bookedDates, 
  selectedDate, 
  selectedRange,
  onDateClick 
}) => {
  const { t, i18n } = useTranslation()
  const [hoveredDay, setHoveredDay] = useState(null)
  const [clickedDay, setClickedDay] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Генерация дней месяца
  const days = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    
    const daysArray = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const bookings = bookedDates[dateStr] || []
      
      daysArray.push({
        date,
        dateStr,
        day,
        bookings,
        isBooked: bookings.length > 0,
        bookingsCount: bookings.length,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: selectedDate && dateStr === selectedDate.toISOString().split('T')[0],
        isInRange: selectedRange.start && selectedRange.end && 
                   date >= selectedRange.start && date <= selectedRange.end
      })
    }
    
    return daysArray
  }, [currentMonth, bookedDates, selectedDate, selectedRange])

  const weekDays = i18n.language === 'ru' 
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
  const weekDaysFull = i18n.language === 'ru'
    ? ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const getBookingIntensity = (count) => {
    if (count === 0) return 'none'
    if (count === 1) return 'low'
    if (count <= 3) return 'medium'
    return 'high'
  }

  const getDayClasses = (day) => {
    if (!day) return ''
    
    const baseClasses = 'relative aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 overflow-hidden'
    
    if (day.isSelected) {
      return `${baseClasses} bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg scale-105 ring-2 sm:ring-4 ring-red-200 dark:ring-red-900`
    }
    
    if (day.isInRange) {
      return `${baseClasses} bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-md scale-105`
    }
    
    if (day.isToday) {
      return `${baseClasses} bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 border-2 border-purple-500 text-purple-900 dark:text-purple-100 font-bold`
    }
    
    const intensity = getBookingIntensity(day.bookingsCount)
    
    switch (intensity) {
      case 'high':
        return `${baseClasses} bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 border-2 border-red-400 dark:border-red-600 text-red-900 dark:text-red-100 hover:scale-105 sm:hover:scale-110 hover:shadow-lg sm:hover:shadow-xl`
      case 'medium':
        return `${baseClasses} bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 border-2 border-yellow-400 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100 hover:scale-105 hover:shadow-lg`
      case 'low':
        return `${baseClasses} bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 border-2 border-orange-400 dark:border-orange-600 text-orange-900 dark:text-orange-100 hover:scale-105 hover:shadow-lg`
      default:
        return `${baseClasses} bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 border-2 border-green-300 dark:border-gray-500 text-gray-900 dark:text-white hover:scale-105 hover:shadow-lg hover:from-green-100 hover:to-green-200 dark:hover:from-gray-600 dark:hover:to-gray-500`
    }
  }

  const handleDayHover = (day, event) => {
    if (!day || !day.isBooked) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    })
    setHoveredDay(day)
  }

  const handleDayLeave = () => {
    setHoveredDay(null)
  }

  const handleDayClick = (day) => {
    onDateClick(day.date)
    if (window.innerWidth < 768 && day.isBooked) {
      setClickedDay(day)
    }
  }

  const closeModal = () => {
    setClickedDay(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6"
    >
      {/* Legend */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg sm:rounded-xl">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center">
          <HiSparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-yellow-500" />
          {t('admin.bookings.calendar.legend')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 text-[10px] sm:text-xs">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300" />
            <span className="text-gray-700 dark:text-gray-300">{t('admin.bookings.calendar.available')}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400" />
            <span className="text-gray-700 dark:text-gray-300">1</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400" />
            <span className="text-gray-700 dark:text-gray-300">2-3</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400" />
            <span className="text-gray-700 dark:text-gray-300">4+</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-500" />
            <span className="text-gray-700 dark:text-gray-300">{t('admin.bookings.calendar.today')}</span>
          </div>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-1 sm:mb-2">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className="text-center text-[10px] sm:text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 py-1 sm:py-2"
            title={weekDaysFull[index]}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="inline sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
        {days.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.005 }}
            whileHover={{ scale: day ? 1.05 : 1 }}
            whileTap={{ scale: day ? 0.95 : 1 }}
          >
            {day ? (
              <div
                onClick={() => handleDayClick(day)}
                onMouseEnter={(e) => handleDayHover(day, e)}
                onMouseLeave={handleDayLeave}
                className={getDayClasses(day)}
              >
                {/* Day number */}
                <div className="text-center mb-0.5">
                  <span className="text-xs sm:text-sm md:text-base font-bold">{day.day}</span>
                </div>

                {/* Property info - DESKTOP ONLY - внутри квадратика */}
                {day.isBooked && (
                  <div className="hidden lg:block absolute inset-x-0 bottom-0 p-0.5 space-y-0.5 max-h-[calc(100%-24px)] overflow-hidden">
                    {day.bookings.slice(0, 5).map((booking, idx) => (
                      <div 
                        key={idx}
                        className="text-[8px] xl:text-[9px] font-semibold truncate bg-white/95 dark:bg-gray-900/95 rounded px-1 py-0.5 text-gray-900 dark:text-white leading-tight"
                        title={`${booking.property_name || `Property ${booking.property_number}`} #${booking.property_number}`}
                      >
                        <span className="block truncate">
                          #{booking.property_number}
                        </span>
                        {booking.property_name && (
                          <span className="block truncate text-[7px] xl:text-[8px] opacity-75">
                            {booking.property_name}
                          </span>
                        )}
                      </div>
                    ))}
                    {day.bookings.length > 5 && (
                      <div className="text-[8px] font-bold text-center text-current bg-white/80 dark:bg-gray-900/80 rounded px-1">
                        +{day.bookings.length - 5}
                      </div>
                    )}
                  </div>
                )}

                {/* Booking count badge - mobile & tablet */}
                {day.isBooked && (
                  <div className="absolute -top-1 -right-1 lg:hidden">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white text-[8px] sm:text-[10px] font-bold flex items-center justify-center shadow-lg">
                      {day.bookingsCount}
                    </div>
                  </div>
                )}

                {/* Property icon - tablet only */}
                {day.isBooked && (
                  <HiHome className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-2 h-2 sm:w-3 sm:h-3 opacity-50 sm:block lg:hidden" />
                )}
              </div>
            ) : (
              <div className="aspect-square" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Desktop Tooltip */}
      <AnimatePresence>
        {hoveredDay && window.innerWidth >= 768 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed z-[100] pointer-events-none hidden md:block"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 p-4 min-w-[250px] max-w-[350px]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {hoveredDay.date.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', { 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </h4>
                </div>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                  {hoveredDay.bookingsCount}
                </span>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                {hoveredDay.bookings.map((booking, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center space-x-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                        <HiHome className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {booking.property_name || `Property ${booking.property_number}`}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        #{booking.property_number}
                      </p>
                    </div>
                    {booking.source === 'calendar' ? (
                      <div className="flex-shrink-0">
                        <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                          {t('admin.bookings.calendar.blocked')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex-shrink-0">
                        <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          {t('admin.bookings.calendar.booked')}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-200 dark:border-t-gray-600" />
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white dark:border-t-gray-800 absolute -top-0.5 left-1/2 -translate-x-1/2" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Modal */}
      <AnimatePresence>
        {clickedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] md:hidden"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[201] md:hidden"
            >
              <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden">
                <div className="flex justify-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {clickedDay.date.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {clickedDay.bookingsCount} {t('admin.bookings.calendar.properties')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <HiX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(70vh-140px)]">
                  {clickedDay.bookings.map((booking, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                          <HiHome className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                          {booking.property_name || `Property ${booking.property_number}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          #{booking.property_number}
                          {booking.reason && booking.reason !== 'Unavailable' && (
                            <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                              ({booking.reason})
                            </span>
                          )}
                        </p>
                      </div>
                      {booking.source === 'calendar' ? (
                        <div className="flex-shrink-0">
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full">
                            {t('admin.bookings.calendar.blocked')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex-shrink-0">
                          <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                            {t('admin.bookings.calendar.booked')}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-1">
            <HiHome className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span className="text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-300">
              {t('admin.bookings.calendar.available')}
            </span>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
            {days.filter(d => d && !d.isBooked).length}
          </div>
          <div className="text-[10px] sm:text-xs text-green-700 dark:text-green-300 font-medium">
            {t('admin.bookings.calendar.availableDays')}
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 mb-1">
            <HiHome className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            <span className="text-[10px] sm:text-xs font-medium text-red-700 dark:text-red-300">
              {t('admin.bookings.calendar.occupied')}
            </span>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
            {days.filter(d => d && d.isBooked).length}
          </div>
          <div className="text-[10px] sm:text-xs text-red-700 dark:text-red-300 font-medium">
            {t('admin.bookings.calendar.occupiedDays')}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default BookingCalendar