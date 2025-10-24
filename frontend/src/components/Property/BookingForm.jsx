// frontend/src/components/Property/BookingForm.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiX,
  HiMail, 
  HiPhone, 
  HiUser,
  HiCalendar,
  HiChatAlt,
  HiCheckCircle,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi'
import { FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { SiWhatsapp, SiTelegram } from 'react-icons/si'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import { bookingService } from '../../services/villa.service'
import { dateToLocalDateStr } from '../../utils/dateUtils'
import 'react-datepicker/dist/react-datepicker.css'

const BookingForm = ({ property, selectedDates = null, isOpen, onClose }) => {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showContactMethod, setShowContactMethod] = useState(false)
  const [selectedContactMethod, setSelectedContactMethod] = useState(null)
  const [freeFirstDays, setFreeFirstDays] = useState(new Set())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempCheckIn, setTempCheckIn] = useState(null)
  const [tempCheckOut, setTempCheckOut] = useState(null)
  
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

  // Получение контактов в зависимости от языка
  const getContacts = () => {
    const contacts = {
      ru: {
        telegram: { url: 'https://t.me/warmphuket_ru', label: '@warmphuket_ru' },
        whatsapp: { url: 'https://wa.me/79001234567', label: '+7 900 123-45-67' },
        email: { url: 'mailto:info@warmphuket.ru', label: 'info@warmphuket.ru' },
        phone: { url: 'tel:+79001234567', label: '+7 900 123-45-67' }
      },
      en: {
        telegram: { url: 'https://t.me/warmphuket_en', label: '@warmphuket_en' },
        whatsapp: { url: 'https://wa.me/66123456789', label: '+66 123 456 789' },
        email: { url: 'mailto:info@warmplus.com', label: 'info@warmplus.com' },
        phone: { url: 'tel:+66123456789', label: '+66 123 456 789' }
      },
      th: {
        telegram: { url: 'https://t.me/warmphuket_th', label: '@warmphuket_th' },
        whatsapp: { url: 'https://wa.me/66123456789', label: '+66 123 456 789' },
        email: { url: 'mailto:info@warmplus.co.th', label: 'info@warmplus.co.th' },
        phone: { url: 'tel:+66123456789', label: '+66 123 456 789' }
      },
      fr: {
        telegram: { url: 'https://t.me/warmphuket_fr', label: '@warmphuket_fr' },
        whatsapp: { url: 'https://wa.me/33123456789', label: '+33 1 23 45 67 89' },
        email: { url: 'mailto:info@warmplus.fr', label: 'info@warmplus.fr' },
        phone: { url: 'tel:+33123456789', label: '+33 1 23 45 67 89' }
      },
      es: {
        telegram: { url: 'https://t.me/warmphuket_es', label: '@warmphuket_es' },
        whatsapp: { url: 'https://wa.me/34123456789', label: '+34 123 456 789' },
        email: { url: 'mailto:info@warmplus.es', label: 'info@warmplus.es' },
        phone: { url: 'tel:+34123456789', label: '+34 123 456 789' }
      }
    }
    return contacts[i18n.language] || contacts.en
  }

  const contacts = getContacts()

  // Логика для определения свободных первых дней
  useEffect(() => {
    if (!property?.blockedDates || !property?.bookings) return

    const extractDateStr = (dateValue) => {
      if (!dateValue) return null
      const str = String(dateValue)
      if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
        return str.substring(0, 10)
      }
      return null
    }

    const addDays = (dateStr, days) => {
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(Date.UTC(year, month - 1, day))
      date.setUTCDate(date.getUTCDate() + days)
      
      const y = date.getUTCFullYear()
      const m = String(date.getUTCMonth() + 1).padStart(2, '0')
      const d = String(date.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    const daysDiff = (date1Str, date2Str) => {
      const [y1, m1, d1] = date1Str.split('-').map(Number)
      const [y2, m2, d2] = date2Str.split('-').map(Number)
      
      const time1 = Date.UTC(y1, m1 - 1, d1)
      const time2 = Date.UTC(y2, m2 - 1, d2)
      
      return Math.round((time2 - time1) / (1000 * 60 * 60 * 24))
    }

    const allDatesSet = new Set()
    
    property.blockedDates.forEach((block) => {
      const dateStr = extractDateStr(block.blocked_date || block.date || block)
      if (dateStr) {
        allDatesSet.add(dateStr)
      }
    })

    property.bookings.forEach(booking => {
      const checkIn = extractDateStr(booking.check_in_date || booking.check_in)
      const checkOut = extractDateStr(booking.check_out_date || booking.check_out)
      
      if (checkIn && checkOut) {
        let current = checkIn
        while (current <= checkOut) {
          allDatesSet.add(current)
          current = addDays(current, 1)
        }
      }
    })

    const sortedDates = Array.from(allDatesSet).sort()

    if (sortedDates.length === 0) {
      setFreeFirstDays(new Set())
      return
    }

    const periods = []
    let currentPeriod = [sortedDates[0]]

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = daysDiff(sortedDates[i - 1], sortedDates[i])
      
      if (diff === 1) {
        currentPeriod.push(sortedDates[i])
      } else {
        periods.push([...currentPeriod])
        currentPeriod = [sortedDates[i]]
      }
    }
    
    if (currentPeriod.length > 0) {
      periods.push(currentPeriod)
    }

    const firstDaysSet = new Set()
    periods.forEach((period) => {
      firstDaysSet.add(period[0])
    })
    
    setFreeFirstDays(firstDaysSet)
  }, [property?.blockedDates, property?.bookings])

  // Проверка доступности даты
  const isDateAvailable = (date) => {
    const dateStr = dateToLocalDateStr(date)
    
    if (freeFirstDays.has(dateStr)) {
      return true
    }
    
    const isBlocked = property?.blockedDates?.some(block => {
      const blockDateStr = typeof block === 'string' ? block : (block.date || block.blocked_date)
      return blockDateStr?.substring(0, 10) === dateStr
    })
    
    if (isBlocked) {
      return false
    }
    
    const isBooked = property?.bookings?.some(booking => {
      const checkIn = booking.check_in_date || booking.check_in
      const checkOut = booking.check_out_date || booking.check_out
      
      if (!checkIn || !checkOut) return false
      
      const checkInStr = checkIn.substring(0, 10)
      const checkOutStr = checkOut.substring(0, 10)
      
      return dateStr > checkInStr && dateStr < checkOutStr
    })
    
    return !isBooked
  }

  const handleDateSelect = (date) => {
    if (!tempCheckIn) {
      setTempCheckIn(date)
    } else if (!tempCheckOut) {
      if (date > tempCheckIn) {
        setTempCheckOut(date)
        setFormData({ ...formData, checkIn: tempCheckIn, checkOut: date })
        setShowDatePicker(false)
        setTempCheckIn(null)
        setTempCheckOut(null)
      } else {
        setTempCheckIn(date)
      }
    } else {
      setTempCheckIn(date)
      setTempCheckOut(null)
    }
  }

  const handlePhoneChange = (e) => {
    const phone = e.target.value
    setFormData({ ...formData, phone })
    
    if (phone.length >= 3 && !showContactMethod) {
      setShowContactMethod(true)
    } else if (phone.length < 3 && showContactMethod) {
      setShowContactMethod(false)
      setSelectedContactMethod(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.firstName || !formData.email || !formData.checkIn || !formData.checkOut) {
      toast.error(t('booking.modal.form.fillRequired'))
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
      toast.success(t('booking.modal.form.success'))
      
      setTimeout(() => {
        setSubmitted(false)
        setShowForm(false)
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(t('booking.modal.form.error'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="modal-container bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <HiCheckCircle className="w-14 h-14 text-white" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('booking.modal.form.successTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t('booking.modal.form.successMessage')}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 flex items-center justify-between rounded-t-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('booking.modal.title')}</h2>
                  <p className="text-blue-100 text-sm mt-1">{property?.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <HiX className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-6">
                {/* Contacts Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('booking.modal.contacts.title')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    
                     <a href={contacts.telegram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <SiTelegram className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Telegram</div>
                        <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{contacts.telegram.label}</div>
                      </div>
                    </a>

                    
                     <a href={contacts.whatsapp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <SiWhatsapp className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 dark:text-gray-400">WhatsApp</div>
                        <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{contacts.whatsapp.label}</div>
                      </div>
                    </a>

                    
                     <a href={contacts.email.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all group"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HiMail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Email</div>
                        <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{contacts.email.label}</div>
                      </div>
                    </a>

                    
                     <a href={contacts.phone.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HiPhone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('booking.modal.contacts.phone')}</div>
                        <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{contacts.phone.label}</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500">
                      {t('booking.modal.or')}
                    </span>
                  </div>
                </div>

                {/* Toggle Form Button */}
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {t('booking.modal.formToggle')}
                  </span>
                  {showForm ? (
                    <HiChevronUp className="w-5 h-5 text-blue-500" />
                  ) : (
                    <HiChevronDown className="w-5 h-5 text-blue-500" />
                  )}
                </button>

                {/* Form */}
                <AnimatePresence>
                  {showForm && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      className="mt-6 space-y-4 overflow-hidden"
                    >
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('booking.modal.form.firstName')} *
                          </label>
                          <div className="relative">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                                       rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                              placeholder={t('booking.modal.form.firstNamePlaceholder')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('booking.modal.form.lastName')}
                          </label>
                          <div className="relative">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                                       rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                              placeholder={t('booking.modal.form.lastNamePlaceholder')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('booking.modal.form.email')} *
                          </label>
                          <div className="relative">
                            <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                                       rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                              placeholder={t('booking.modal.form.emailPlaceholder')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('booking.modal.form.phone')}
                          </label>
                          <div className="relative">
                            <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={handlePhoneChange}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                                       rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                              placeholder={t('booking.modal.form.phonePlaceholder')}
                            />
                          </div>

                          {/* Contact Method Selection */}
                          <AnimatePresence>
                            {showContactMethod && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-3 overflow-hidden"
                              >
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                  {t('booking.modal.form.contactMethod')}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedContactMethod('whatsapp')}
                                    className={`flex-1 p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                                      selectedContactMethod === 'whatsapp'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                                    }`}
                                  >
                                    <SiWhatsapp className={`w-6 h-6 ${
                                      selectedContactMethod === 'whatsapp' ? 'text-green-500' : 'text-gray-400'
                                    }`} />
                                    <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">WhatsApp</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedContactMethod('telegram')}
                                    className={`flex-1 p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                                      selectedContactMethod === 'telegram'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <SiTelegram className={`w-6 h-6 ${
                                      selectedContactMethod === 'telegram' ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                    <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">Telegram</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedContactMethod('phone')}
                                    className={`flex-1 p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                                      selectedContactMethod === 'phone'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <HiPhone className={`w-6 h-6 ${
                                      selectedContactMethod === 'phone' ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                    <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">{t('booking.modal.form.call')}</span>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('booking.modal.form.dates')} *
                        </label>
                        {!showDatePicker ? (
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(true)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <HiCalendar className="w-5 h-5 text-blue-500" />
                              <div className="text-left">
                                {formData.checkIn && formData.checkOut ? (
                                  <>
                                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                                      {formData.checkIn.toLocaleDateString()} - {formData.checkOut.toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {Math.ceil((formData.checkOut - formData.checkIn) / (1000 * 60 * 60 * 24))} {t('booking.modal.form.nights')}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-gray-500">{t('booking.modal.form.selectPeriod')}</span>
                                )}
                              </div>
                            </div>
                            <HiChevronDown className="w-5 h-5 text-gray-400" />
                          </button>
                        ) : (
                          <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700">
                            <DatePicker
                              selected={tempCheckIn}
                              onChange={handleDateSelect}
                              minDate={new Date()}
                              filterDate={isDateAvailable}
                              inline
                              monthsShown={1}
                              selectsRange={false}
                              highlightDates={tempCheckIn ? [tempCheckIn] : []}
                            />
                            <div className="mt-3 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowDatePicker(false)
                                  setTempCheckIn(null)
                                  setTempCheckOut(null)
                                }}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              >
                                {t('booking.modal.form.cancel')}
                              </button>
                              {tempCheckIn && (
                                <span className="text-xs text-blue-500">
                                  {t('booking.modal.form.selectEndDate')}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('booking.modal.form.message')}
                        </label>
                        <div className="relative">
                          <HiChatAlt className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={3}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                                     rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white resize-none transition-all"
                            placeholder={t('booking.modal.form.messagePlaceholder')}
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                                 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                                 text-white font-semibold py-4 px-6 rounded-xl transition-all
                                 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('booking.modal.form.sending')}</span>
                          </>
                        ) : (
                          <>
                            <HiCheckCircle className="w-5 h-5" />
                            <span>{t('booking.modal.form.submit')}</span>
                          </>
                        )}
                      </button>

                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {t('booking.modal.form.disclaimer')}
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BookingForm