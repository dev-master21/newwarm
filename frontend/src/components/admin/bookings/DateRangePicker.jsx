// frontend/src/components/admin/bookings/DateRangePicker.jsx
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiCalendar } from 'react-icons/hi'

const DateRangePicker = ({ onRangeSelect, initialRange = { start: null, end: null } }) => {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(
    initialRange.start ? initialRange.start.toISOString().split('T')[0] : ''
  )
  const [endDate, setEndDate] = useState(
    initialRange.end ? initialRange.end.toISOString().split('T')[0] : ''
  )
  
  const startInputRef = useRef(null)
  const endInputRef = useRef(null)

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value)
  }

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value)
  }

  const handleApply = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start <= end) {
        onRangeSelect({ start, end })
      } else {
        alert(t('admin.bookings.rangePicker.invalidRange'))
      }
    }
  }

  const handleQuickSelect = (days) => {
    const today = new Date()
    const start = new Date(today)
    const end = new Date(today)
    end.setDate(end.getDate() + days - 1)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    
    onRangeSelect({ start, end })
  }

  const handleQuickSelectRange = (type) => {
    const today = new Date()
    let start, end

    switch (type) {
      case 'today':
        start = new Date(today)
        end = new Date(today)
        break
      case 'tomorrow':
        start = new Date(today)
        start.setDate(start.getDate() + 1)
        end = new Date(start)
        break
      case 'thisWeek':
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay() + 1)
        end = new Date(start)
        end.setDate(end.getDate() + 6)
        break
      case 'nextWeek':
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay() + 8)
        end = new Date(start)
        end.setDate(end.getDate() + 6)
        break
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'nextMonth':
        start = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        end = new Date(today.getFullYear(), today.getMonth() + 2, 0)
        break
      default:
        return
    }

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    
    onRangeSelect({ start, end })
  }

  const openStartDatePicker = () => {
    startInputRef.current?.showPicker()
  }

  const openEndDatePicker = () => {
    endInputRef.current?.showPicker()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Date Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.bookings.rangePicker.startDate')}
          </label>
          <div className="relative">
            <input
              ref={startInputRef}
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="absolute opacity-0 pointer-events-none"
            />
            <button
              onClick={openStartDatePicker}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-700 
                       border-2 border-gray-300 dark:border-gray-600 rounded-lg
                       hover:border-blue-500 dark:hover:border-blue-400 transition-all
                       text-gray-900 dark:text-white font-medium"
            >
              <span className="flex items-center space-x-2">
                <HiCalendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm">
                  {startDate 
                    ? new Date(startDate).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })
                    : t('admin.bookings.rangePicker.selectStart')
                  }
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.bookings.rangePicker.endDate')}
          </label>
          <div className="relative">
            <input
              ref={endInputRef}
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
              className="absolute opacity-0 pointer-events-none"
            />
            <button
              onClick={openEndDatePicker}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-700 
                       border-2 border-gray-300 dark:border-gray-600 rounded-lg
                       hover:border-blue-500 dark:hover:border-blue-400 transition-all
                       text-gray-900 dark:text-white font-medium"
            >
              <span className="flex items-center space-x-2">
                <HiCalendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm">
                  {endDate 
                    ? new Date(endDate).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })
                    : t('admin.bookings.rangePicker.selectEnd')
                  }
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('admin.bookings.rangePicker.quickSelect')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <button
            onClick={() => handleQuickSelectRange('today')}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.today')}
          </button>
          <button
            onClick={() => handleQuickSelectRange('tomorrow')}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.tomorrow')}
          </button>
          <button
            onClick={() => handleQuickSelectRange('thisWeek')}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.thisWeek')}
          </button>
          <button
            onClick={() => handleQuickSelectRange('nextWeek')}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.nextWeek')}
          </button>
          <button
            onClick={() => handleQuickSelectRange('thisMonth')}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.thisMonth')}
          </button>
          <button
            onClick={() => handleQuickSelectRange('nextMonth')}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.nextMonth')}
          </button>
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.next7Days')}
          </button>
          <button
            onClick={() => handleQuickSelect(14)}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.next14Days')}
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
          >
            {t('admin.bookings.rangePicker.next30Days')}
          </button>
        </div>
      </div>

      {/* Apply Button */}
      {startDate && endDate && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={handleApply}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                   bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                   text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <HiCalendar className="w-5 h-5" />
          <span>{t('admin.bookings.rangePicker.apply')}</span>
        </motion.button>
      )}
    </motion.div>
  )
}

export default DateRangePicker