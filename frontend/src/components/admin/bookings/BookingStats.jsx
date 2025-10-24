// frontend/src/components/admin/bookings/BookingStats.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  HiTrendingUp,
  HiTrendingDown,
  HiCalendar,
  HiCash,
  HiHome,
  HiUsers,
  HiChartBar,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi'
import bookingApi from '../../../api/bookingApi'

const BookingStats = ({ currentMonth }) => {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadStats()
  }, [currentMonth])

  const loadStats = async () => {
    try {
      setLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      
      const response = await bookingApi.getMonthlyStats(year, month)
      
      if (response.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  const getOccupancyColor = (rate) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getOccupancyBgColor = (rate) => {
    if (rate >= 80) return 'from-green-500 to-green-600'
    if (rate >= 50) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 cursor-pointer
                 hover:from-purple-600 hover:to-purple-700 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <HiChartBar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {t('admin.bookings.statistics')}
              </h2>
              <p className="text-sm text-purple-100">
                {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <HiChevronDown className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Main Stats - Always visible */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Bookings */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 
                     dark:to-blue-800/20 rounded-xl p-4 border-2 border-blue-200 
                     dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-2">
              <HiCalendar className="w-6 h-6 text-blue-500" />
              {stats.trend?.bookings > 0 && (
                <HiTrendingUp className="w-4 h-4 text-green-500" />
              )}
              {stats.trend?.bookings < 0 && (
                <HiTrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total_bookings || 0}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-1">
              {t('admin.bookings.stats.totalBookings')}
            </div>
            {stats.trend?.bookings !== 0 && (
              <div className={`text-xs mt-1 ${stats.trend?.bookings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trend?.bookings > 0 ? '+' : ''}{stats.trend?.bookings}% {t('admin.bookings.stats.vsLastMonth')}
              </div>
            )}
          </motion.div>

          {/* Occupancy Rate */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 
                     dark:to-green-800/20 rounded-xl p-4 border-2 border-green-200 
                     dark:border-green-800"
          >
            <div className="flex items-center justify-between mb-2">
              <HiHome className="w-6 h-6 text-green-500" />
              {stats.trend?.occupancy > 0 && (
                <HiTrendingUp className="w-4 h-4 text-green-500" />
              )}
              {stats.trend?.occupancy < 0 && (
                <HiTrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className={`text-3xl font-bold ${getOccupancyColor(stats.occupancy_rate || 0)}`}>
              {Math.round(stats.occupancy_rate || 0)}%
            </div>
            <div className="text-xs text-green-700 dark:text-green-300 font-medium mt-1">
              {t('admin.bookings.stats.occupancyRate')}
            </div>
            {stats.trend?.occupancy !== 0 && (
              <div className={`text-xs mt-1 ${stats.trend?.occupancy > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trend?.occupancy > 0 ? '+' : ''}{stats.trend?.occupancy}% {t('admin.bookings.stats.vsLastMonth')}
              </div>
            )}
          </motion.div>

          {/* Revenue */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 
                     dark:to-yellow-800/20 rounded-xl p-4 border-2 border-yellow-200 
                     dark:border-yellow-800"
          >
            <div className="flex items-center justify-between mb-2">
              <HiCash className="w-6 h-6 text-yellow-500" />
              {stats.trend?.revenue > 0 && (
                <HiTrendingUp className="w-4 h-4 text-green-500" />
              )}
              {stats.trend?.revenue < 0 && (
                <HiTrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatPrice(stats.total_revenue || 0)}
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mt-1">
              {t('admin.bookings.stats.revenue')} ₽
            </div>
            {stats.trend?.revenue !== 0 && (
              <div className={`text-xs mt-1 ${stats.trend?.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trend?.revenue > 0 ? '+' : ''}{stats.trend?.revenue}% {t('admin.bookings.stats.vsLastMonth')}
              </div>
            )}
          </motion.div>

          {/* Unique Guests */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 
                     dark:to-purple-800/20 rounded-xl p-4 border-2 border-purple-200 
                     dark:border-purple-800"
          >
            <div className="flex items-center justify-between mb-2">
              <HiUsers className="w-6 h-6 text-purple-500" />
              {stats.trend?.guests > 0 && (
                <HiTrendingUp className="w-4 h-4 text-green-500" />
              )}
              {stats.trend?.guests < 0 && (
                <HiTrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.unique_guests || 0}
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1">
              {t('admin.bookings.stats.uniqueGuests')}
            </div>
            {stats.trend?.guests !== 0 && (
              <div className={`text-xs mt-1 ${stats.trend?.guests > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trend?.guests > 0 ? '+' : ''}{stats.trend?.guests}% {t('admin.bookings.stats.vsLastMonth')}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Extended Stats - Expandable */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4"
        >
          {/* Average Booking Value */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <HiCash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {t('admin.bookings.stats.avgBookingValue')}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(stats.avg_booking_value || 0)} ₽
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <HiCalendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {t('admin.bookings.stats.avgStayDuration')}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats.avg_stay_duration || 0)} {t('admin.bookings.stats.nights')}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <HiHome className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {t('admin.bookings.stats.bookedProperties')}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.booked_properties || 0}
              </div>
            </div>
          </div>

          {/* Occupancy Progress Bar */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('admin.bookings.stats.monthlyOccupancy')}
              </span>
              <span className={`text-2xl font-bold ${getOccupancyColor(stats.occupancy_rate || 0)}`}>
                {Math.round(stats.occupancy_rate || 0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.occupancy_rate || 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${getOccupancyBgColor(stats.occupancy_rate || 0)} 
                         rounded-full flex items-center justify-end pr-2`}
              >
                {stats.occupancy_rate >= 20 && (
                  <span className="text-xs font-bold text-white">
                    {Math.round(stats.occupancy_rate)}%
                  </span>
                )}
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
              <span>{stats.booked_nights || 0} {t('admin.bookings.stats.bookedNights')}</span>
              <span>{stats.available_nights || 0} {t('admin.bookings.stats.availableNights')}</span>
            </div>
          </div>

          {/* Top Properties */}
          {stats.top_properties && stats.top_properties.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 
                         dark:to-indigo-900/20 rounded-xl p-4 border-2 border-blue-200 
                         dark:border-blue-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <HiTrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                {t('admin.bookings.stats.topProperties')}
              </h3>
              <div className="space-y-2">
                {stats.top_properties.slice(0, 5).map((property, index) => (
                  <div
                    key={property.property_id}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 
                             rounded-lg text-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {property.property_name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          #{property.property_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        {property.bookings_count} {t('admin.bookings.stats.bookings')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatPrice(property.total_revenue)} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Sources */}
          {stats.booking_sources && stats.booking_sources.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 
                         dark:to-pink-900/20 rounded-xl p-4 border-2 border-purple-200 
                         dark:border-purple-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <HiChartBar className="w-5 h-5 mr-2 text-purple-500" />
                {t('admin.bookings.stats.bookingSources')}
              </h3>
              <div className="space-y-3">
                {stats.booking_sources.map((source) => (
                  <div key={source.source} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {source.source || 'Direct'}
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {source.count} ({Math.round(source.percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${source.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default BookingStats