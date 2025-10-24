// frontend/src/components/admin/bookings/PropertyAvailabilityList.jsx
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiHome,
  HiCheckCircle,
  HiXCircle,
  HiCalendar,
  HiFilter,
  HiSearch,
  HiChevronDown,
  HiChevronUp,
  HiEye
} from 'react-icons/hi'

const PropertyAvailabilityList = ({ 
  selectedDate, 
  selectedRange, 
  bookedDates,
  properties,
  loading,
  fullWidth = false
}) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'available', 'booked'
  const [expandedPropertyId, setExpandedPropertyId] = useState(null)

  // Получение информации для выбранной даты
  const selectedDateInfo = useMemo(() => {
    if (!selectedDate) return null
    
    const dateStr = selectedDate.toISOString().split('T')[0]
    const bookedProperties = bookedDates[dateStr] || []
    
    return {
      dateStr,
      bookedProperties,
      bookedCount: bookedProperties.length
    }
  }, [selectedDate, bookedDates])

  // Фильтрация объектов
  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) return []
    
    return properties.filter(property => {
      // Поиск
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          property.property_name?.toLowerCase().includes(query) ||
          property.property_number?.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }
      
      // Фильтр по статусу
      if (filterStatus === 'available' && !property.is_available) return false
      if (filterStatus === 'booked' && property.is_available) return false
      
      return true
    })
  }, [properties, searchQuery, filterStatus])

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null
    if (photoUrl.startsWith('http')) return photoUrl
    return `https://warm.novaestate.company${photoUrl}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  if (!selectedDate && !selectedRange.start) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
      >
        <div className="text-center">
          <HiCalendar className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.bookings.selectDateOrRange')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('admin.bookings.selectDateOrRangeDesc')}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {selectedDate 
            ? t('admin.bookings.availabilityForDate')
            : t('admin.bookings.availabilityForPeriod')
          }
        </h2>
        {selectedDate && (
          <p className="text-blue-100 text-sm">
            {selectedDate.toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              weekday: 'long'
            })}
          </p>
        )}
        {selectedRange.start && selectedRange.end && (
          <p className="text-blue-100 text-sm">
            {selectedRange.start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            {' - '}
            {selectedRange.end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Stats for single date */}
      {selectedDateInfo && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {selectedDateInfo.bookedCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('admin.bookings.bookedProperties')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                ∞
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('admin.bookings.availableProperties')}
              </div>
            </div>
          </div>

          {/* Booked properties for selected date */}
          {selectedDateInfo.bookedProperties.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('admin.bookings.bookedOnThisDate')}:
              </h3>
              <div className="space-y-1">
                {selectedDateInfo.bookedProperties.map((property, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 text-sm bg-red-50 dark:bg-red-900/20 
                             rounded-lg p-2 border border-red-200 dark:border-red-800"
                  >
                    <HiHome className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      #{property.property_number}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 truncate">
                      {property.property_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters and Search - only for range selection */}
      {selectedRange.start && selectedRange.end && (
        <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-600">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.bookings.searchProperties')}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 
                       border-2 border-gray-200 dark:border-gray-600
                       rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('admin.bookings.all')}
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                filterStatus === 'available'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('admin.bookings.available')}
            </button>
            <button
              onClick={() => setFilterStatus('booked')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                filterStatus === 'booked'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('admin.bookings.booked')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {properties.length}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">
                {t('admin.bookings.total')}
              </div>
            </div>
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {properties.filter(p => p.is_available).length}
              </div>
              <div className="text-[10px] text-green-700 dark:text-green-300">
                {t('admin.bookings.available')}
              </div>
            </div>
            <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {properties.filter(p => !p.is_available).length}
              </div>
              <div className="text-[10px] text-red-700 dark:text-red-300">
                {t('admin.bookings.booked')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties List */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.bookings.loading')}
            </p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl overflow-hidden border-2 transition-all ${
                  property.is_available
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start space-x-3">
                    {/* Property Image */}
                    <div className="relative flex-shrink-0">
                      {property.primary_photo ? (
                        <img
                          src={getPhotoUrl(property.primary_photo)}
                          alt={property.property_name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200 dark:bg-gray-700 
                                      flex items-center justify-center">
                          <HiHome className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status badge */}
                      <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center 
                                    justify-center shadow-lg ${
                        property.is_available 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}>
                        {property.is_available ? (
                          <HiCheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <HiXCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {property.property_name || t('admin.properties.noName')}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            #{property.property_number}
                          </p>
                        </div>
                      </div>

                      {/* Property details */}
                      <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <span>{property.bedrooms} 🛏️</span>
                        <span>{property.bathrooms} 🚿</span>
                        <span className="capitalize">{property.property_type}</span>
                      </div>

                      {/* Status */}
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        property.is_available
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {property.is_available ? (
                          <>
                            <HiCheckCircle className="w-3 h-3" />
                            <span>{t('admin.bookings.available')}</span>
                          </>
                        ) : (
                          <>
                            <HiXCircle className="w-3 h-3" />
                            <span>{t('admin.bookings.booked')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bookings details - только если объект занят */}
                  {!property.is_available && property.bookings && property.bookings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                      <button
                        onClick={() => setExpandedPropertyId(
                          expandedPropertyId === property.id ? null : property.id
                        )}
                        className="w-full flex items-center justify-between text-sm font-medium 
                                 text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 
                                 transition-colors"
                      >
                        <span>{t('admin.bookings.bookingDetails')} ({property.bookings.length})</span>
                        {expandedPropertyId === property.id ? (
                          <HiChevronUp className="w-5 h-5" />
                        ) : (
                          <HiChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedPropertyId === property.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 space-y-2">
                              {property.bookings.map((booking, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 
                                           rounded-lg text-xs border border-red-200 dark:border-red-800"
                                >
                                  <div className="flex items-center space-x-2">
                                    <HiCalendar className="w-4 h-4 text-red-500" />
                                    <span className="text-gray-900 dark:text-white font-medium">
                                      {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                                    </span>
                                  </div>
                                  <span className="text-gray-600 dark:text-gray-400 text-[10px]">
                                    {booking.booking_source || 'Manual'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <HiHome className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || filterStatus !== 'all'
                ? t('admin.bookings.noPropertiesFound')
                : t('admin.bookings.noProperties')
              }
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PropertyAvailabilityList