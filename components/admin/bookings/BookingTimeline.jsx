// frontend/src/components/admin/bookings/BookingTimeline.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiHome,
  HiCalendar,
  HiChevronLeft,
  HiChevronRight,
  HiZoomIn,
  HiZoomOut,
  HiEye
} from 'react-icons/hi'
import bookingApi from '../../../api/bookingApi'
import toast from 'react-hot-toast'

const BookingTimeline = ({ currentMonth, onBookingClick }) => {
  const { t } = useTranslation()
  const [bookings, setBookings] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1) // 1 = normal, 2 = zoomed in
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    loadTimelineData()
  }, [currentMonth])

  const loadTimelineData = async () => {
    try {
      setLoading(true)
      
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

      const response = await bookingApi.getBookings({ startDate, endDate })
      
      if (response.success) {
        // Group bookings by property
        const bookingsByProperty = {}
        const propertySet = new Set()

        response.data.bookings.forEach(booking => {
          if (!bookingsByProperty[booking.property_id]) {
            bookingsByProperty[booking.property_id] = {
              property_id: booking.property_id,
              property_number: booking.property_number,
              property_name: booking.property_name,
              primary_photo: booking.primary_photo,
              bookings: []
            }
            propertySet.add(booking.property_id)
          }
          bookingsByProperty[booking.property_id].bookings.push(booking)
        })

        setProperties(Object.values(bookingsByProperty))
        setBookings(response.data.bookings)
      }
    } catch (error) {
      console.error('Failed to load timeline data:', error)
      toast.error(t('admin.bookings.loadError'))
    } finally {
      setLoading(false)
    }
  }

  // Generate days for the month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        day,
        date,
        dateStr: date.toISOString().split('T')[0],
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
      })
    }
    return days
  }

  const days = getDaysInMonth()

  // Calculate booking position and width
  const getBookingStyle = (booking) => {
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    // Adjust dates if booking spans outside the current month
    const displayStart = checkIn < monthStart ? monthStart : checkIn
    const displayEnd = checkOut > monthEnd ? monthEnd : checkOut

    const startDay = displayStart.getDate()
    const duration = Math.ceil((displayEnd - displayStart) / (1000 * 60 * 60 * 24)) + 1

    const dayWidth = zoom === 1 ? 40 : 60
    const left = (startDay - 1) * dayWidth
    const width = duration * dayWidth

    return {
      left: `${left}px`,
      width: `${width}px`
    }
  }

  const getBookingColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
    ]
    return colors[index % colors.length]
  }

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null
    if (photoUrl.startsWith('http')) return photoUrl
    return `https://warm.novaestate.company${photoUrl}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const handleZoomIn = () => {
    setZoom(2)
  }

  const handleZoomOut = () => {
    setZoom(1)
  }

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.bookings.loading')}
          </p>
        </div>
      </div>
    )
  }

  const dayWidth = zoom === 1 ? 40 : 60

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <HiCalendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {t('admin.bookings.timeline.title')}
              </h2>
              <p className="text-sm text-indigo-100">
                {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleScrollLeft}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title={t('admin.bookings.timeline.scrollLeft')}
            >
              <HiChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleScrollRight}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title={t('admin.bookings.timeline.scrollRight')}
            >
              <HiChevronRight className="w-5 h-5 text-white" />
            </button>
            <div className="hidden sm:flex items-center space-x-2 ml-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom === 1}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('admin.bookings.timeline.zoomOut')}
              >
                <HiZoomOut className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoom === 2}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('admin.bookings.timeline.zoomIn')}
              >
                <HiZoomIn className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Days header */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="inline-flex border-b-2 border-gray-200 dark:border-gray-700">
            {/* Property column header */}
            <div className="sticky left-0 z-20 bg-white dark:bg-gray-800 border-r-2 border-gray-200 dark:border-gray-700"
                 style={{ width: '200px', minWidth: '200px' }}>
              <div className="p-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                {t('admin.bookings.timeline.property')}
              </div>
            </div>

            {/* Days */}
            {days.map((day) => (
              <div
                key={day.day}
                className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-700 ${
                  day.isToday ? 'bg-blue-100 dark:bg-blue-900/30' :
                  day.isWeekend ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                }`}
                style={{ width: `${dayWidth}px` }}
              >
                <div className="p-2 text-center">
                  <div className={`text-xs font-bold ${
                    day.isToday 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {day.day}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {day.date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Properties and bookings */}
          {properties.length > 0 ? (
            <div className="relative">
              {properties.map((property, propIndex) => (
                <div
                  key={property.property_id}
                  className="inline-flex border-b border-gray-200 dark:border-gray-700 
                           hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {/* Property info */}
                  <div className="sticky left-0 z-10 bg-white dark:bg-gray-800 border-r-2 
                               border-gray-200 dark:border-gray-700"
                       style={{ width: '200px', minWidth: '200px' }}>
                    <div className="p-3 flex items-center space-x-3">
                      {property.primary_photo ? (
                        <img
                          src={getPhotoUrl(property.primary_photo)}
                          alt={property.property_name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 
                                      flex items-center justify-center flex-shrink-0">
                          <HiHome className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {property.property_name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          #{property.property_number}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline grid */}
                  <div className="relative flex-1" style={{ minWidth: `${days.length * dayWidth}px` }}>
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {days.map((day) => (
                        <div
                          key={day.day}
                          className={`flex-shrink-0 border-r border-gray-100 dark:border-gray-700/50 ${
                            day.isToday ? 'bg-blue-50 dark:bg-blue-900/10' :
                            day.isWeekend ? 'bg-gray-50/50 dark:bg-gray-700/20' : ''
                          }`}
                          style={{ width: `${dayWidth}px`, height: '100%' }}
                        />
                      ))}
                    </div>

                    {/* Bookings */}
                    <div className="relative" style={{ height: '64px', padding: '8px 0' }}>
                      {property.bookings.map((booking, bookingIndex) => {
                        const style = getBookingStyle(booking)
                        const color = getBookingColor(propIndex + bookingIndex)
                        
                        return (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: bookingIndex * 0.05 }}
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                            onClick={() => onBookingClick?.(booking)}
                            className={`absolute top-2 h-12 bg-gradient-to-r ${color} rounded-lg 
                                     shadow-md hover:shadow-xl cursor-pointer
                                     flex items-center px-2 overflow-hidden
                                     border-2 border-white dark:border-gray-800`}
                            style={style}
                          >
                            <div className="text-white text-xs font-semibold truncate">
                              {zoom === 2 && (
                                <div className="flex items-center space-x-1">
                                  <HiCalendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                                  </span>
                                </div>
                              )}
                              {zoom === 1 && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <HiCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {t('admin.bookings.timeline.noBookings')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {t('admin.bookings.timeline.noBookingsDesc')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend - Mobile */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 sm:hidden">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded" />
            <span className="text-gray-600 dark:text-gray-400">{t('admin.bookings.today')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-50 dark:bg-gray-700/50 rounded" />
            <span className="text-gray-600 dark:text-gray-400">{t('admin.bookings.timeline.weekend')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default BookingTimeline