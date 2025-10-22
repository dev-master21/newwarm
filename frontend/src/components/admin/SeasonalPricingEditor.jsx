// frontend/src/components/admin/SeasonalPricingEditor.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiCalendar,
  HiCash,
  HiPlus,
  HiTrash,
  HiPencil,
  HiCheck,
  HiX,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi'
import toast from 'react-hot-toast'

const SeasonalPricingEditor = ({ pricing, propertyId, onUpdate }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)
  const [periods, setPeriods] = useState(pricing || [])
  const [editingIndex, setEditingIndex] = useState(null)
  const [newPeriod, setNewPeriod] = useState({
    start_date: '',
    end_date: '',
    price_per_night: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)

  // Функция для форматирования даты из YYYY-MM-DD в DD/MM/YYYY
  const formatDateDisplay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Функция для форматирования даты из DD/MM/YYYY в YYYY-MM-DD
  const formatDateValue = (dateString) => {
    if (!dateString) return ''
    const [day, month, year] = dateString.split('/')
    return `${year}-${month}-${day}`
  }

  // Функция для конвертации из YYYY-MM-DD в DD/MM/YYYY для input
  const getInputValue = (isoDate) => {
    if (!isoDate) return ''
    return isoDate.split('T')[0] // Берем только дату без времени
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
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

  const handleAddPeriod = () => {
    if (!newPeriod.start_date || !newPeriod.end_date || !newPeriod.price_per_night) {
      toast.error(t('admin.editProperty.pricing.fillAllFields'))
      return
    }

    if (new Date(newPeriod.start_date) >= new Date(newPeriod.end_date)) {
      toast.error(t('admin.editProperty.pricing.invalidDates'))
      return
    }

    const updatedPeriods = [...periods, {
      ...newPeriod,
      id: Date.now(),
      price_per_night: parseFloat(newPeriod.price_per_night)
    }].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

    setPeriods(updatedPeriods)
    setNewPeriod({ start_date: '', end_date: '', price_per_night: '' })
    setShowAddForm(false)
    toast.success(t('admin.editProperty.pricing.periodAdded'))
  }

  const handleUpdatePeriod = (index, field, value) => {
    const updatedPeriods = [...periods]
    updatedPeriods[index] = {
      ...updatedPeriods[index],
      [field]: field === 'price_per_night' ? parseFloat(value) : value
    }
    setPeriods(updatedPeriods)
  }

  const handleDeletePeriod = (index) => {
    const updatedPeriods = periods.filter((_, i) => i !== index)
    setPeriods(updatedPeriods)
    toast.success(t('admin.editProperty.pricing.periodDeleted'))
  }

  const handleSaveEdit = (index) => {
    const period = periods[index]
    
    if (new Date(period.start_date) >= new Date(period.end_date)) {
      toast.error(t('admin.editProperty.pricing.invalidDates'))
      return
    }

    setEditingIndex(null)
    toast.success(t('admin.editProperty.pricing.periodUpdated'))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mt-6"
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-green-500 to-green-600 p-4 cursor-pointer
                 hover:from-green-600 hover:to-green-700 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <HiCash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t('admin.editProperty.pricing.title')}
              </h2>
              <p className="text-sm text-white/80">
                {periods.length} {t('admin.editProperty.pricing.periods')}
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

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Existing Periods */}
              {periods.length > 0 ? (
                <div className="space-y-3">
                  {periods.map((period, index) => (
                    <motion.div
                      key={period.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                    >
                      {editingIndex === index ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('admin.editProperty.pricing.startDate')}
                              </label>
                              <input
                                type="date"
                                value={getInputValue(period.start_date)}
                                onChange={(e) => handleUpdatePeriod(index, 'start_date', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-600 
                                         border-2 border-gray-200 dark:border-gray-500
                                         rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('admin.editProperty.pricing.endDate')}
                              </label>
                              <input
                                type="date"
                                value={getInputValue(period.end_date)}
                                onChange={(e) => handleUpdatePeriod(index, 'end_date', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-600 
                                         border-2 border-gray-200 dark:border-gray-500
                                         rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('admin.editProperty.pricing.pricePerNight')}
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={period.price_per_night || ''}
                                onChange={(e) => handleUpdatePeriod(index, 'price_per_night', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-600 
                                         border-2 border-gray-200 dark:border-gray-500
                                         rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSaveEdit(index)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 
                                       hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                            >
                              <HiCheck className="w-4 h-4" />
                              <span>{t('common.save')}</span>
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-500 
                                       hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                            >
                              <HiX className="w-4 h-4" />
                              <span>{t('common.cancel')}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <HiCalendar className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {t('admin.editProperty.pricing.startDate')}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatDate(period.start_date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <HiCalendar className="w-5 h-5 text-red-500 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {t('admin.editProperty.pricing.endDate')}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatDate(period.end_date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <HiCash className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {t('admin.editProperty.pricing.price')}
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {formatPrice(period.price_per_night)} ₽
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingIndex(index)}
                              className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 
                                       dark:text-blue-400 rounded-lg hover:bg-blue-200 
                                       dark:hover:bg-blue-900/50 transition-colors"
                              title={t('common.edit')}
                            >
                              <HiPencil className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeletePeriod(index)}
                              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 
                                       dark:text-red-400 rounded-lg hover:bg-red-200 
                                       dark:hover:bg-red-900/50 transition-colors"
                              title={t('common.delete')}
                            >
                              <HiTrash className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HiCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('admin.editProperty.pricing.noPeriods')}
                  </p>
                </div>
              )}

              {/* Add New Period Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 
                             dark:to-blue-900/20 rounded-xl p-4 border-2 border-green-200 
                             dark:border-green-800"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t('admin.editProperty.pricing.addNewPeriod')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('admin.editProperty.pricing.startDate')}
                        </label>
                        <input
                          type="date"
                          value={newPeriod.start_date}
                          onChange={(e) => setNewPeriod({ ...newPeriod, start_date: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-700 
                                   border-2 border-gray-200 dark:border-gray-600
                                   rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('admin.editProperty.pricing.endDate')}
                        </label>
                        <input
                          type="date"
                          value={newPeriod.end_date}
                          onChange={(e) => setNewPeriod({ ...newPeriod, end_date: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-700 
                                   border-2 border-gray-200 dark:border-gray-600
                                   rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('admin.editProperty.pricing.pricePerNight')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={newPeriod.price_per_night}
                          onChange={(e) => setNewPeriod({ ...newPeriod, price_per_night: e.target.value })}
                          placeholder="5000"
                          className="w-full px-4 py-2 bg-white dark:bg-gray-700 
                                   border-2 border-gray-200 dark:border-gray-600
                                   rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleAddPeriod}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 
                                 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                      >
                        <HiCheck className="w-5 h-5" />
                        <span>{t('common.add')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false)
                          setNewPeriod({ start_date: '', end_date: '', price_per_night: '' })
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-500 
                                 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        <HiX className="w-5 h-5" />
                        <span>{t('common.cancel')}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Period Button */}
              {!showAddForm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3
                           bg-gradient-to-r from-green-500 to-green-600 
                           hover:from-green-600 hover:to-green-700
                           text-white font-medium rounded-xl shadow-md hover:shadow-lg
                           transition-all duration-300"
                >
                  <HiPlus className="w-5 h-5" />
                  <span>{t('admin.editProperty.pricing.addPeriod')}</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default SeasonalPricingEditor