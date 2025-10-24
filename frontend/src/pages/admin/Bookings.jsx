// frontend/src/pages/admin/Bookings.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiCalendar,
  HiChevronLeft,
  HiChevronRight,
  HiX
} from 'react-icons/hi'
import bookingApi from '../../api/bookingApi'
import toast from 'react-hot-toast'
import BookingCalendar from '../../components/admin/bookings/BookingCalendar'
import PropertyAvailabilityList from '../../components/admin/bookings/PropertyAvailabilityList'
import DateRangePicker from '../../components/admin/bookings/DateRangePicker'

const Bookings = () => {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
  const [bookedDates, setBookedDates] = useState({})
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showRangePicker, setShowRangePicker] = useState(false)

  useEffect(() => {
    loadBookedDates()
  }, [currentMonth])

  useEffect(() => {
    if (selectedRange.start && selectedRange.end) {
      loadPropertiesAvailability()
    }
  }, [selectedRange])

  const loadBookedDates = async () => {
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      
      const response = await bookingApi.getBookedDates(year, month)
      
      if (response.success) {
        setBookedDates(response.data.bookedDates)
      }
    } catch (error) {
      console.error('Failed to load booked dates:', error)
      toast.error(t('admin.bookings.loadError'))
    }
  }

  const loadPropertiesAvailability = async () => {
    try {
      setLoading(true)
      
      const startDate = selectedRange.start.toISOString().split('T')[0]
      const endDate = selectedRange.end.toISOString().split('T')[0]
      
      const response = await bookingApi.getPropertiesAvailability(startDate, endDate)
      
      if (response.success) {
        setProperties(response.data.properties)
      }
    } catch (error) {
      console.error('Failed to load availability:', error)
      toast.error(t('admin.bookings.availabilityError'))
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setSelectedRange({ start: null, end: null })
  }

  const handleRangeSelect = (range) => {
    setSelectedRange(range)
    setSelectedDate(null)
    setShowRangePicker(false)
  }

  const handleClearSelection = () => {
    setSelectedDate(null)
    setSelectedRange({ start: null, end: null })
    setProperties([])
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          {t('admin.bookings.title')}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
          {t('admin.bookings.subtitle')}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4">
        <div className="flex flex-col space-y-3">
          {/* Top row - Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={goToPreviousMonth}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="min-w-[120px] sm:min-w-[140px] md:min-w-[160px] text-center">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
                  {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              
              <button
                onClick={goToNextMonth}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={goToToday}
                className="ml-1 sm:ml-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white 
                         rounded-lg transition-colors font-medium text-xs sm:text-sm"
              >
                {t('admin.bookings.today')}
              </button>
            </div>

            {/* Clear Selection Button */}
            {(selectedDate || selectedRange.start) && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleClearSelection}
                className="p-1.5 sm:p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title={t('admin.bookings.clearSelection')}
              >
                <HiX className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
          </div>

          {/* Bottom row - Select Period Button */}
          <div>
            <button
              onClick={() => setShowRangePicker(!showRangePicker)}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all font-semibold text-sm sm:text-base ${
                showRangePicker || (selectedRange.start && selectedRange.end)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <HiCalendar className="w-5 h-5" />
              <span>{t('admin.bookings.selectPeriod')}</span>
            </button>
          </div>
        </div>

        {/* Range Picker */}
        <AnimatePresence>
          {showRangePicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <DateRangePicker
                  onRangeSelect={handleRangeSelect}
                  initialRange={selectedRange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Info */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 
                        dark:border-blue-800 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
              {t('admin.bookings.selectedDate')}: {selectedDate.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        )}

        {selectedRange.start && selectedRange.end && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 
                        dark:border-green-800 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
              {t('admin.bookings.selectedPeriod')}: {' '}
              {selectedRange.start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              {' '}-{' '}
              {selectedRange.end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Main Content - Calendar + Property List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <BookingCalendar
            currentMonth={currentMonth}
            bookedDates={bookedDates}
            selectedDate={selectedDate}
            selectedRange={selectedRange}
            onDateClick={handleDateClick}
          />
        </div>

        <div className="lg:col-span-1">
          <PropertyAvailabilityList
            selectedDate={selectedDate}
            selectedRange={selectedRange}
            bookedDates={bookedDates}
            properties={properties}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default Bookings