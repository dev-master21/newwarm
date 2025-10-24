import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiMail, HiUser, HiLocationMarker, HiChat } from 'react-icons/hi'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import { contactService } from '../../services/villa.service'

const ContactForm = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    travelDateFrom: null,
    travelDateTo: null,
    message: ''
  })

  const countries = [
    'United States', 'United Kingdom', 'Russia', 'China', 'Thailand',
    'Singapore', 'Malaysia', 'Australia', 'Germany', 'France', 'Other'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.email || !formData.message) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      setLoading(true)
      await contactService.submitContact({
        email: formData.email,
        country: formData.country,
        travel_date_from: formData.travelDateFrom?.toISOString().split('T')[0],
        travel_date_to: formData.travelDateTo?.toISOString().split('T')[0],
        message: formData.message
      })
      
      toast.success(t('contact.success'))
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        country: '',
        travelDateFrom: null,
        travelDateTo: null,
        message: ''
      })
    } catch (error) {
      toast.error(t('contact.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
    >
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('contact.name')}
        </label>
        <div className="relative">
          <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-900 dark:text-white"
            placeholder="John Doe"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('contact.email')} *
        </label>
        <div className="relative">
          <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-900 dark:text-white"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('contact.country')}
        </label>
        <div className="relative">
          <HiLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-900 dark:text-white appearance-none"
          >
            <option value="">Select country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Travel Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('contact.from')}
          </label>
          <DatePicker
            selected={formData.travelDateFrom}
            onChange={(date) => setFormData({ ...formData, travelDateFrom: date })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-900 dark:text-white"
            placeholderText="Select date"
            minDate={new Date()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('contact.to')}
          </label>
          <DatePicker
            selected={formData.travelDateTo}
            onChange={(date) => setFormData({ ...formData, travelDateTo: date })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-900 dark:text-white"
            placeholderText="Select date"
            minDate={formData.travelDateFrom || new Date()}
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('contact.message')} *
        </label>
        <div className="relative">
          <HiChat className="absolute left-3 top-3 text-gray-400" />
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={5}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-900 dark:text-white resize-none"
            placeholder="Tell us about your requirements..."
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 
                 text-white rounded-lg font-medium transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center justify-center space-x-2"
      >
        <span>{loading ? 'Sending...' : t('contact.send')}</span>
      </motion.button>
    </motion.form>
  )
}

export default ContactForm