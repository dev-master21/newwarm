import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiSearch, HiCalendar, HiChevronDown } from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const SearchPanel = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [showNameSearch, setShowNameSearch] = useState(false)
  const [searchData, setSearchData] = useState({
    checkIn: null,
    checkOut: null,
    bedrooms: '',
    villaName: ''
  })

  // Функция для правильного склонения спален
  const getBedroomLabel = (count) => {
    if (!count) return t('search.any')
    
    const num = parseInt(count)
    const lang = i18n.language
    
    if (lang === 'ru') {
      // Русский: 1 спальня, 2-4 спальни, 5+ спален
      if (num === 1) return `1 ${t('search.bedroom1')}`
      if (num >= 2 && num <= 4) return `${num} ${t('search.bedroom2')}`
      return `${num} ${t('search.bedroom5')}`
    } else if (lang === 'en') {
      // Английский: 1 bedroom, 2+ bedrooms
      return num === 1 ? `1 ${t('search.bedroom1')}` : `${num} ${t('search.bedroom2')}`
    } else if (lang === 'th') {
      // Тайский: нет множественного числа
      return `${num} ${t('search.bedroom1')}`
    } else if (lang === 'fr') {
      // Французский: 1 chambre, 2+ chambres
      return num === 1 ? `1 ${t('search.bedroom1')}` : `${num} ${t('search.bedroom2')}`
    } else if (lang === 'es') {
      // Испанский: 1 habitación, 2+ habitaciones
      return num === 1 ? `1 ${t('search.bedroom1')}` : `${num} ${t('search.bedroom2')}`
    }
    
    return `${num} ${t('search.bedroom2')}`
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (searchData.villaName) params.append('name', searchData.villaName)
    if (searchData.bedrooms) params.append('bedrooms', searchData.bedrooms)
    if (searchData.checkIn) params.append('checkIn', searchData.checkIn.toISOString())
    if (searchData.checkOut) params.append('checkOut', searchData.checkOut.toISOString())
    
    navigate(`/villas?${params.toString()}`)
    onClose()
  }

  const handleIncreaseBedrooms = () => {
    const current = parseInt(searchData.bedrooms) || 0
    setSearchData({ ...searchData, bedrooms: (current + 1).toString() })
  }

  const handleDecreaseBedrooms = () => {
    const current = parseInt(searchData.bedrooms) || 0
    if (current > 0) {
      setSearchData({ ...searchData, bedrooms: current === 1 ? '' : (current - 1).toString() })
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-container bg-white dark:bg-gray-800 rounded-3xl shadow-2xl 
                       w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#ba2e2d] to-red-600 p-6 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {t('search.findIdealVilla')}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {t('search.subtitle')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
                >
                  <HiX className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {/* Search Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Number of Bedrooms */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('search.bedrooms')}
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 
                                flex items-center justify-between border-2 border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl 
                                    flex items-center justify-center">
                        <IoBedOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {getBedroomLabel(searchData.bedrooms)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDecreaseBedrooms}
                        className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-600 
                                 hover:bg-gray-300 dark:hover:bg-gray-500 
                                 flex items-center justify-center transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!searchData.bedrooms}
                      >
                        <span className="text-xl font-bold text-gray-700 dark:text-gray-300">−</span>
                      </motion.button>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center">
                        {searchData.bedrooms || '0'}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleIncreaseBedrooms}
                        className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-600 
                                 hover:bg-gray-300 dark:hover:bg-gray-500 
                                 flex items-center justify-center transition-colors"
                      >
                        <span className="text-xl font-bold text-gray-700 dark:text-gray-300">+</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
                
                {/* Date Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 isolate"
                >
                  {/* Check In */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {t('search.checkIn')}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 
                                    bg-green-100 dark:bg-green-900/30 rounded-xl 
                                    flex items-center justify-center pointer-events-none z-[1]">
                        <HiCalendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <DatePicker
                        selected={searchData.checkIn}
                        onChange={(date) => setSearchData({ ...searchData, checkIn: date })}
                        selectsStart
                        startDate={searchData.checkIn}
                        endDate={searchData.checkOut}
                        minDate={new Date()}
                        placeholderText={t('search.selectDate')}
                        dateFormat="dd MMM yyyy"
                        popperClassName="!z-[10000]"
                        popperPlacement="bottom-start"
                        className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-[#ba2e2d] focus:border-[#ba2e2d]
                                 dark:bg-gray-700 dark:text-white transition-all cursor-pointer
                                 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  
                  {/* Check Out */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {t('search.checkOut')}
                    </label>
                    <div className="relative">
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 
                                    bg-cyan-100 dark:bg-cyan-900/30 rounded-xl 
                                    flex items-center justify-center pointer-events-none z-[1]
                                    ${!searchData.checkIn ? 'opacity-50' : ''}`}>
                        <HiCalendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <DatePicker
                        selected={searchData.checkOut}
                        onChange={(date) => setSearchData({ ...searchData, checkOut: date })}
                        selectsEnd
                        startDate={searchData.checkIn}
                        endDate={searchData.checkOut}
                        minDate={searchData.checkIn || new Date()}
                        placeholderText={t('search.selectDate')}
                        dateFormat="dd MMM yyyy"
                        popperClassName="!z-[10000]"
                        popperPlacement="bottom-start"
                        disabled={!searchData.checkIn}
                        className={`w-full pl-16 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-[#ba2e2d] focus:border-[#ba2e2d]
                                 dark:bg-gray-700 dark:text-white transition-all
                                 placeholder:text-gray-400 dark:placeholder:text-gray-500
                                 ${!searchData.checkIn ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      />
                    </div>
                    {!searchData.checkIn && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('search.selectCheckInFirst')}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Toggle Name Search Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => setShowNameSearch(!showNameSearch)}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 
                             dark:hover:text-gray-300 transition-colors flex items-center space-x-1 
                             py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  >
                    <span>{t('search.orSearchByName')}</span>
                    <motion.div
                      animate={{ rotate: showNameSearch ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HiChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>
                </motion.div>

                {/* Villa Name Search - Collapsible */}
                <AnimatePresence>
                  {showNameSearch && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {t('search.villaName')}
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 
                                      bg-blue-100 dark:bg-blue-900/30 rounded-xl 
                                      flex items-center justify-center pointer-events-none">
                          <HiSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <input
                          type="text"
                          value={searchData.villaName}
                          onChange={(e) => setSearchData({ ...searchData, villaName: e.target.value })}
                          placeholder={t('search.villaNamePlaceholder')}
                          className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 
                                   rounded-xl focus:ring-2 focus:ring-[#ba2e2d] focus:border-[#ba2e2d]
                                   dark:bg-gray-700 dark:text-white transition-all
                                   placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Footer with Actions */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 
                            flex items-center justify-between flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 
                           hover:bg-gray-200 dark:hover:bg-gray-800 
                           rounded-xl transition-all font-medium"
                >
                  {t('common.cancel')}
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="px-8 py-3 bg-gradient-to-r from-[#ba2e2d] to-red-600 
                           hover:from-red-600 hover:to-red-700 text-white rounded-xl 
                           font-semibold transition-all shadow-lg hover:shadow-xl
                           flex items-center space-x-2"
                >
                  <HiSearch className="w-5 h-5" />
                  <span>{t('search.searchButton')}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SearchPanel