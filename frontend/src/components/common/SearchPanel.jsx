import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiSearch, HiCalendar, HiHome } from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const SearchPanel = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchData, setSearchData] = useState({
    location: 'Phuket',
    checkIn: null,
    checkOut: null,
    guests: 2,
    bedrooms: '',
    villaName: ''
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (searchData.villaName) params.append('name', searchData.villaName)
    if (searchData.bedrooms) params.append('bedrooms', searchData.bedrooms)
    if (searchData.checkIn) params.append('checkIn', searchData.checkIn.toISOString())
    if (searchData.checkOut) params.append('checkOut', searchData.checkOut.toISOString())
    if (searchData.guests) params.append('guests', searchData.guests)
    
    navigate(`/villas?${params.toString()}`)
    onClose()
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
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 
                     w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('search.findIdealVilla')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Search Form */}
            <div className="p-6 space-y-6">
              {/* Villa Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('search.villaName')}
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchData.villaName}
                    onChange={(e) => setSearchData({ ...searchData, villaName: e.target.value })}
                    placeholder="Type villa name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                             rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('search.checkIn')}
                  </label>
                  <div className="relative">
                    <HiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                    <DatePicker
                      selected={searchData.checkIn}
                      onChange={(date) => setSearchData({ ...searchData, checkIn: date })}
                      selectsStart
                      startDate={searchData.checkIn}
                      endDate={searchData.checkOut}
                      minDate={new Date()}
                      placeholderText="Select date"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('search.checkOut')}
                  </label>
                  <div className="relative">
                    <HiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                    <DatePicker
                      selected={searchData.checkOut}
                      onChange={(date) => setSearchData({ ...searchData, checkOut: date })}
                      selectsEnd
                      startDate={searchData.checkIn}
                      endDate={searchData.checkOut}
                      minDate={searchData.checkIn || new Date()}
                      placeholderText="Select date"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Bedrooms & Guests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('search.bedrooms')}
                  </label>
                  <div className="relative">
                    <IoBedOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={searchData.bedrooms}
                      onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               dark:bg-gray-800 dark:text-white appearance-none"
                    >
                      <option value="">Any</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3">3 Bedrooms</option>
                      <option value="4">4 Bedrooms</option>
                      <option value="5">5+ Bedrooms</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Guests
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSearchData({ 
                        ...searchData, 
                        guests: Math.max(1, searchData.guests - 1) 
                      })}
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 
                               hover:bg-gray-200 dark:hover:bg-gray-700 
                               flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {searchData.guests}
                    </span>
                    <button
                      onClick={() => setSearchData({ 
                        ...searchData, 
                        guests: searchData.guests + 1 
                      })}
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 
                               hover:bg-gray-200 dark:hover:bg-gray-700 
                               flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Search Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 
                           hover:bg-gray-100 dark:hover:bg-gray-800 
                           rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSearch}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 
                           text-white rounded-lg font-medium transition-colors 
                           flex items-center space-x-2"
                >
                  <HiSearch className="w-5 h-5" />
                  <span>{t('search.search')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SearchPanel