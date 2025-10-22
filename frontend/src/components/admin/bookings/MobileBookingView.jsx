// frontend/src/components/admin/bookings/MobileBookingView.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiCalendar,
  HiHome,
  HiChevronDown,
  HiChevronUp,
  HiFilter,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi'

const MobileBookingView = ({ 
  bookedDates, 
  selectedDate, 
  onDateClick,
  currentMonth 
}) => {
  const { t } = useTranslation()
  const [expandedDate, setExpandedDate] = useState(null)
  const [filterView, setFilterView] = useState('all') // 'all', 'available', 'booked'

  // Get all dates in month
  const getDatesInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const dates = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const bookings = bookedDates[dateStr] || []
      
      dates.push({
        date,
        dateStr,
        day,
        bookings,
        isBooked: bookings.length > 0,
        bookingsCount: bookings.length,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: selectedDate && dateStr === selectedDate.toISOString().split('T')[0],
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      })
    }
    return dates
  }

  const dates = getDatesInMonth()

  // Filter dates
  const filteredDates = dates.filter(date => {
    if (filterView === 'available') return !date.isBooked
    if (filterView === 'booked') return date.isBooked
    return true
  })

  const toggleDateExpansion = (dateStr) => {
    setExpandedDate(expandedDate === dateStr ? null : dateStr)
  }

  const getDayName = (date) => {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' })
  }

  const getMonthName = (date) => {
    return date.toLocaleDateString('ru-RU', { month: 'long' })
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setFilterView('all')}
            className={`py-3 rounded-lg text-sm font-semibold transition-all ${
              filterView === 'all'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('admin.bookings.all')}
          </button>
          <button
            onClick={() => setFilterView('available')}
            className={`py-3 rounded-lg text-sm font-semibold transition-all ${
              filterView === 'available'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('admin.bookings.available')}
          </button>
          <button
            onClick={() => setFilterView('booked')}
            className={`py-3 rounded-lg text-sm font-semibold transition-all ${
              filterView === 'booked'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('admin.bookings.booked')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 
                      dark:to-green-800/20 rounded-xl p-4 border-2 border-green-200 
                      dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <HiCheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              {t('admin.bookings.available')}
            </span>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {dates.filter(d => !d.isBooked).length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 
                      dark:to-red-800/20 rounded-xl p-4 border-2 border-red-200 
                      dark:border-red-800">
          <div className="flex items-center space-x-2 mb-2">
            <HiXCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs font-medium text-red-700 dark:text-red-300">
              {t('admin.bookings.booked')}
            </span>
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {dates.filter(d => d.isBooked).length}
          </div>
        </div>
      </div>

      {/* Dates List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredDates.map((dateInfo) => (
            <motion.div
              key={dateInfo.dateStr}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden
                       border-2 transition-all ${
                dateInfo.isSelected
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900'
                  : dateInfo.isBooked
                  ? 'border-red-200 dark:border-red-800'
                  : 'border-green-200 dark:border-green-800'
              }`}
            >
              <div
                onClick={() => {
                  onDateClick(dateInfo.date)
                  if (dateInfo.isBooked) {
                    toggleDateExpansion(dateInfo.dateStr)
                  }
                }}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  {/* Date Info */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                      dateInfo.isToday
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        : dateInfo.isBooked
                        ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-700 dark:text-red-300'
                        : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-700 dark:text-green-300'
                    }`}>
                      <span className="text-2xl font-bold">{dateInfo.day}</span>
                      <span className="text-[10px] uppercase font-medium">
                        {getDayName(dateInfo.date)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {dateInfo.day} {getMonthName(dateInfo.date)}
                      </h3>
                      {dateInfo.isToday && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                          {t('admin.bookings.today')}
                        </span>
                      )}
                      {dateInfo.isWeekend && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t('admin.bookings.timeline.weekend')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-3">
                    {dateInfo.isBooked ? (
                      <>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {dateInfo.bookingsCount}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t('admin.bookings.bookings')}
                          </div>
                        </div>
                        {dateInfo.bookingsCount > 0 && (
                          <motion.div
                            animate={{ rotate: expandedDate === dateInfo.dateStr ? 180 : 0 }}
                          >
                            <HiChevronDown className="w-6 h-6 text-gray-400" />
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 
                                   dark:bg-green-900/30 rounded-lg">
                        <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          {t('admin.bookings.available')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded booking details */}
              <AnimatePresence>
                {expandedDate === dateInfo.dateStr && dateInfo.bookings.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t-2 border-gray-100 dark:border-gray-700 bg-gray-50 
                             dark:bg-gray-700/50 overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      {dateInfo.bookings.map((booking, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 
                                   rounded-lg border border-red-200 dark:border-red-800"
                        >
                          <HiHome className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {booking.property_name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              #{booking.property_number}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredDates.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <HiCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t('admin.bookings.noDatesFound')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileBookingView