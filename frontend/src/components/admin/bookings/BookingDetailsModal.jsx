// frontend/src/components/admin/bookings/BookingDetailsModal.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiX,
  HiCalendar,
  HiHome,
  HiUser,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiCash,
  HiClock,
  HiGlobe
} from 'react-icons/hi'

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  const { t } = useTranslation()

  if (!booking) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  const getNightsDifference = () => {
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    const diffTime = Math.abs(checkOut - checkIn)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null
    if (photoUrl.startsWith('http')) return photoUrl
    return `https://warm.novaestate.company${photoUrl}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 
                     max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 
                     max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {t('admin.bookings.bookingDetails')}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <HiX className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Property Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-start space-x-4">
                  {booking.primary_photo && (
                    <img
                      src={getPhotoUrl(booking.primary_photo)}
                      alt={booking.property_name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <HiHome className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {booking.property_name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      #{booking.property_number}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <HiCalendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                        {t('admin.bookings.checkIn')}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatDate(booking.check_in_date)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <HiCalendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                        {t('admin.bookings.checkOut')}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatDate(booking.check_out_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration and Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-2 mb-1">
                    <HiClock className="w-5 h-5 text-purple-500" />
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      {t('admin.bookings.duration')}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getNightsDifference()} {t('admin.bookings.nights')}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-1">
                    <HiGlobe className="w-5 h-5 text-blue-500" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      {t('admin.bookings.source')}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {booking.booking_source || 'Manual'}
                  </p>
                </div>
              </div>

              {/* Guest Info (if available) */}
              {booking.guest_name && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <HiUser className="w-5 h-5 mr-2 text-gray-500" />
                    {t('admin.bookings.guestInfo')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <HiUser className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{booking.guest_name}</span>
                    </div>
                    {booking.guest_email && (
                      <div className="flex items-center space-x-3">
                        <HiMail className="w-5 h-5 text-gray-400" />
                        
                         <a href={`mailto:${booking.guest_email}`}
                          className="text-blue-500 hover:underline"
                        >
                          {booking.guest_email}
                        </a>
                      </div>
                    )}
                    {booking.guest_phone && (
                      <div className="flex items-center space-x-3">
                        <HiPhone className="w-5 h-5 text-gray-400" />
                        
                         <a href={`tel:${booking.guest_phone}`}
                          className="text-blue-500 hover:underline"
                        >
                          {booking.guest_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price (if available) */}
              {booking.total_price && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 
                             dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 
                             dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <HiCash className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                          {t('admin.bookings.totalPrice')}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(booking.total_price)} ₽
                        </p>
                      </div>
                    </div>
                    {booking.price_per_night && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatPrice(booking.price_per_night)} ₽ / {t('admin.bookings.night')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes (if available) */}
              {booking.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    {t('admin.bookings.notes')}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 text-white font-semibold 
                         rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                {t('common.close')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BookingDetailsModal