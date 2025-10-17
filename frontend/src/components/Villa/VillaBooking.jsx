import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import { bookingService } from '../../services/villa.service'
import 'react-datepicker/dist/react-datepicker.css'

const VillaBooking = ({ villa }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
    guests: 2,
    children: 0
  })

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const nights = Math.ceil(
        (bookingData.checkOut - bookingData.checkIn) / (1000 * 60 * 60 * 24)
      )
      return nights > 0 ? nights : 0
    }
    return 0
  }

  const calculateTotal = () => {
    return villa.price * calculateNights()
  }

  const handleBooking = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    toast.success('Redirecting to booking form...')
    // Navigate to booking form with pre-filled data
    window.location.href = `/contact?villa=${villa.id}&checkin=${bookingData.checkIn}&checkout=${bookingData.checkOut}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            {villa.original_price && villa.original_price > villa.price && (
              <span className="text-gray-500 line-through text-sm">
                ฿{villa.original_price.toLocaleString()}
              </span>
            )}
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ฿{villa.price.toLocaleString()}
              </span>
              <span className="text-gray-500">/ {t('villa.perNight')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Check-in
          </label>
          <DatePicker
            selected={bookingData.checkIn}
            onChange={(date) => setBookingData({ ...bookingData, checkIn: date })}
            minDate={new Date()}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholderText="Select date"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Check-out
          </label>
          <DatePicker
            selected={bookingData.checkOut}
            onChange={(date) => setBookingData({ ...bookingData, checkOut: date })}
            minDate={bookingData.checkIn || new Date()}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholderText="Select date"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adults
          </label>
          <select
            value={bookingData.guests}
            onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {[...Array(villa.adults_num)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Children
          </label>
          <select
            value={bookingData.children}
            onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      {calculateNights() > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              ฿{villa.price.toLocaleString()} × {calculateNights()} nights
            </span>
            <span className="font-semibold">
              ฿{calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white 
                 rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Processing...' : t('villa.inquire')}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        You won't be charged yet
      </p>
    </motion.div>
  )
}

export default VillaBooking