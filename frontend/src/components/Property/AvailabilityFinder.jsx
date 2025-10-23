import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCalendar, HiSearch, HiX, HiCheckCircle, HiChevronRight } from 'react-icons/hi'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import 'react-datepicker/dist/react-datepicker.css'

const AvailabilityFinder = ({ propertyId, blockedDates = [], bookings = [], onSelectDates }) => {
  const { t } = useTranslation()
  const [searching, setSearching] = useState(false)
  const [preferredMonth, setPreferredMonth] = useState(null)
  const [nightsCount, setNightsCount] = useState(3)
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [resultsLimit, setResultsLimit] = useState(5)

  // Проверка доступности диапазона дат
  const isRangeAvailable = (startDate, nights) => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + nights)

    // Проверяем каждый день в диапазоне
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      
      // Проверяем блокировки
      if (blockedDates.some(block => block.date === dateStr)) {
        return false
      }

      // Проверяем бронирования
      const isBooked = bookings.some(booking => {
        const checkIn = new Date(booking.check_in_date)
        const checkOut = new Date(booking.check_out_date)
        return d >= checkIn && d <= checkOut
      })

      if (isBooked) return false
    }

    return true
  }

  // Поиск свободных дат
  const findAvailableDates = () => {
    setSearching(true)
    const availableSlots = []
    
    // Определяем диапазон поиска
    const searchStart = preferredMonth || new Date()
    const searchEnd = new Date(searchStart)
    searchEnd.setMonth(searchEnd.getMonth() + 3) // Ищем на 3 месяца вперед

    let currentDate = new Date(searchStart)
    currentDate.setHours(0, 0, 0, 0)

    // Не ищем в прошлом
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (currentDate < today) {
      currentDate = today
    }

    while (currentDate <= searchEnd && availableSlots.length < 20) {
      if (isRangeAvailable(currentDate, nightsCount)) {
        const endDate = new Date(currentDate)
        endDate.setDate(endDate.getDate() + nightsCount)
        
        availableSlots.push({
          checkIn: new Date(currentDate),
          checkOut: endDate,
          nights: nightsCount
        })
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    setResults(availableSlots)
    setShowResults(true)
    setSearching(false)

    if (availableSlots.length === 0) {
      toast.error(t('property.availability.noResults'))
    } else {
      toast.success(t('property.availability.foundResults', { count: availableSlots.length }))
    }
  }

  const handleSelectSlot = (slot) => {
    if (onSelectDates) {
      onSelectDates({
        checkIn: slot.checkIn.toISOString().split('T')[0],
        checkOut: slot.checkOut.toISOString().split('T')[0]
      })
    }
    setShowResults(false)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <HiSearch className="w-6 h-6 text-blue-500" />
          <span>{t('property.availability.title')}</span>
        </h3>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {t('property.availability.description')}
      </p>

      {/* Search Form */}
      <div className="space-y-4 mb-6">
        {/* Month Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('property.availability.preferredMonth')}
          </label>
          <DatePicker
            selected={preferredMonth}
            onChange={setPreferredMonth}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            minDate={new Date()}
            placeholderText={t('property.availability.anyMonth')}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Nights Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('property.availability.nightsCount')}
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setNightsCount(Math.max(1, nightsCount - 1))}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                       rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-xl font-bold text-gray-700 dark:text-gray-300">−</span>
            </button>
            
            <div className="flex-1 text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{nightsCount}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('property.availability.nights')}
              </div>
            </div>
            
            <button
              onClick={() => setNightsCount(nightsCount + 1)}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                       rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-xl font-bold text-gray-700 dark:text-gray-300">+</span>
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={findAvailableDates}
          disabled={searching}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                   text-white font-semibold py-4 px-6 rounded-xl transition-all
                   flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {searching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('property.availability.searching')}</span>
            </>
          ) : (
            <>
              <HiSearch className="w-5 h-5" />
              <span>{t('property.availability.findDates')}</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {t('property.availability.availableSlots')} ({results.length})
              </h4>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {results.slice(0, resultsLimit).map((slot, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectSlot(slot)}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20
                         border-2 border-green-200 dark:border-green-800 rounded-xl
                         hover:border-green-400 dark:hover:border-green-600 transition-all
                         flex items-center justify-between group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HiCheckCircle className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {formatDate(slot.checkIn)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {slot.nights} {t('property.availability.nights')} · {t('property.availability.until')} {formatDate(slot.checkOut)}
                    </div>
                  </div>
                </div>

                <HiChevronRight className="w-6 h-6 text-green-500 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ))}

            {/* Show More Button */}
            {results.length > resultsLimit && (
              <button
                onClick={() => setResultsLimit(resultsLimit + 5)}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                         text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
              >
                {t('property.availability.showMore')} ({results.length - resultsLimit} {t('property.availability.remaining')})
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AvailabilityFinder