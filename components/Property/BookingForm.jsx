import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  HiMail, 
  HiPhone, 
  HiUser, 
  HiUsers,
  HiCalendar,
  HiChatAlt,
  HiPaperAirplane,
  HiCheckCircle
} from 'react-icons/hi'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import { bookingService } from '../../services/villa.service'

const BookingForm = ({ property, selectedDates = null }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: selectedDates?.checkIn ? new Date(selectedDates.checkIn) : null,
    checkOut: selectedDates?.checkOut ? new Date(selectedDates.checkOut) : null,
    adults: 2,
    children: 0,
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName || !formData.email || !formData.checkIn || !formData.checkOut) {
      toast.error(t('property.booking.fillRequired'))
      return
    }

    try {
      setLoading(true)
      
      await bookingService.createBooking({
        property_id: property.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        check_in: formData.checkIn.toISOString().split('T')[0],
        check_out: formData.checkOut.toISOString().split('T')[0],
        adults_num: formData.adults,
        children_num: formData.children,
        notes: formData.message
      })

      setSubmitted(true)
      toast.success(t('property.booking.success'))
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          checkIn: null,
          checkOut: null,
          adults: 2,
          children: 0,
          message: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(t('property.booking.error'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <HiCheckCircle className="w-12 h-12 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('property.booking.successTitle')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('property.booking.successMessage')}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
        <HiCalendar className="w-6 h-6 text-blue-500" />
        <span>{t('property.booking.title')}</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('property.booking.firstName')} *
            </label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder={t('property.booking.firstNamePlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('property.booking.lastName')}
            </label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder={t('property.booking.lastNamePlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('property.booking.email')} *
            </label>
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder={t('property.booking.emailPlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('property.booking.phone')}
            </label>
            <div className="relative">
              <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder={t('property.booking.phonePlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('property.booking.checkIn')} *
            </label>
            <DatePicker
              selected={formData.checkIn}
              onChange={(date) => setFormData({ ...formData, checkIn: date })}
              minDate={new Date()}
              dateFormat="dd.MM.yyyy"
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholderText={t('property.booking.checkInPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('property.booking.checkOut')} *
            </label>
            <DatePicker
              selected={formData.checkOut}
              onChange={(date) => setFormData({ ...formData, checkOut: date })}
              minDate={formData.checkIn || new Date()}
              dateFormat="dd.MM.yyyy"
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholderText={t('property.booking.checkOutPlaceholder')}
            />
          </div>
        </div>

        {/* Guests */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('property.booking.adults')}
            </label>
            <div className="relative">
              <HiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.adults}
                onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('property.booking.children')}
            </label>
            <div className="relative">
              <HiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.children}
                onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none"
              >
                {[0, 1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('property.booking.message')}
          </label>
          <div className="relative">
            <HiChatAlt className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
              placeholder={t('property.booking.messagePlaceholder')}
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                   disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
                   text-white font-semibold py-4 px-6 rounded-xl transition-all
                   flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('property.booking.sending')}</span>
            </>
          ) : (
            <>
              <HiPaperAirplane className="w-5 h-5" />
              <span>{t('property.booking.submit')}</span>
            </>
          )}
        </motion.button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('property.booking.disclaimer')}
        </p>
      </form>
    </div>
  )
}

export default BookingForm