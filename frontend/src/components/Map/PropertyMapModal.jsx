import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiHeart
} from 'react-icons/hi'
import { IoBedOutline, IoExpand } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'
import { useShortlistStore } from '../../store/shortlistStore'
import toast from 'react-hot-toast'

const PropertyMapModal = ({ property, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { addItem, removeItem, isInShortlist } = useShortlistStore()

  if (!property) return null

  const photos = property.photos || []
  const hasPhotos = photos.length > 0

  const getThumbnailUrl = useCallback((photoUrl) => {
    if (!photoUrl) return '/placeholder-villa.jpg'
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    if (photoUrl.startsWith('http')) return photoUrl
    
    const lastDot = photoUrl.lastIndexOf('.')
    if (lastDot > 0) {
      const thumbPath = photoUrl.substring(0, lastDot) + '_thumb' + photoUrl.substring(lastDot)
      return `${baseUrl}${thumbPath}`
    }
    return `${baseUrl}${photoUrl}`
  }, [])

  const handlePrevPhoto = useCallback((e) => {
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }, [photos.length])

  const handleNextPhoto = useCallback((e) => {
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }, [photos.length])

  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.touches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1)
    }
    if (isRightSwipe && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1)
    }

    setTouchStart(0)
    setTouchEnd(0)
  }, [touchStart, touchEnd, currentPhotoIndex, photos.length])

  const handleCardClick = useCallback(() => {
    navigate(`/properties/${property.id}`)
    onClose()
  }, [navigate, property.id, onClose])

  const handleShortlistToggle = useCallback((e) => {
    e.stopPropagation()
    if (isInShortlist(property.id)) {
      removeItem(property.id)
      toast.success(t('featured.removedFromShortlist'))
    } else {
      addItem(property)
      toast.success(t('featured.addedToShortlist'))
    }
  }, [property, isInShortlist, addItem, removeItem, t])

  // Закрытие при клике на оверлей
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Закрытие при нажатии Escape
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const formatPrice = (price) => {
    if (!price) return t('featured.priceOnRequest')
    return new Intl.NumberFormat('ru-RU').format(Math.round(price))
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    return Math.round(num)
  }

  const guestsCount = property.bedrooms ? Math.round(property.bedrooms) * 2 : 0

  return (
    <AnimatePresence>
      <div className="modal-container">
        {/* Backdrop/Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          {/* Modal Content Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="property-modal-container relative w-full"
          >
            {/* Close Button - фиксированная позиция без transform */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center
                       bg-white/90 backdrop-blur-sm rounded-full transition-colors
                       shadow-lg z-10 hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Close modal"
            >
              <HiX className="w-6 h-6 text-gray-700" />
            </button>

            {/* Property Card - точная копия из FeaturedVillas */}
            <motion.div
              onClick={handleCardClick}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 
                       shadow-2xl cursor-pointer group"
            >
              {/* Image Carousel */}
              <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {hasPhotos ? (
                  <div 
                    className="relative h-full"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Animated Image with Framer Motion */}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentPhotoIndex}
                        src={getThumbnailUrl(photos[currentPhotoIndex])}
                        alt={property.name || t('featured.noName')}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        onError={(e) => {
                          e.target.src = '/placeholder-villa.jpg'
                        }}
                      />
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevPhoto}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white 
                                   rounded-full flex items-center justify-center shadow-lg transition-all z-10
                                   opacity-0 group-hover:opacity-100"
                        >
                          <HiChevronLeft className="w-5 h-5 text-gray-800" />
                        </button>
                        <button
                          onClick={handleNextPhoto}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white 
                                   rounded-full flex items-center justify-center shadow-lg transition-all z-10
                                   opacity-0 group-hover:opacity-100"
                        >
                          <HiChevronRight className="w-5 h-5 text-gray-800" />
                        </button>

                        {/* Photo Indicators - БЕЗ "+X" */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                          {photos.map((_, idx) => (
                            <motion.div
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === currentPhotoIndex 
                                  ? 'w-6 bg-white' 
                                  : 'w-1.5 bg-white/50'
                              }`}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <HiX className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{t('featured.noPhotos')}</p>
                    </div>
                  </div>
                )}

                {/* Shortlist Button */}
                <button
                  onClick={handleShortlistToggle}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center
                           bg-white/90 hover:bg-white backdrop-blur-sm transition-all z-20 shadow-lg
                           ${isInShortlist(property.id) ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}
                >
                  <HiHeart className={`w-5 h-5 ${isInShortlist(property.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-1">
                  {property.name || t('featured.noName')}
                </h3>

                {/* Features Grid */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-1">
                      <IoBedOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('featured.bedrooms')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(property.bedrooms)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-1">
                      <MdBathtub className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('featured.bathrooms')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(property.bathrooms)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-1">
                      <IoExpand className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('featured.area')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(property.indoor_area)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-1">
                      <FaUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('featured.guests')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {guestsCount}
                    </span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('featured.from')}
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#ba2e2d]">
                        ฿{formatPrice(property.price_per_night)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        /{t('featured.night')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Button */}
                <button
                  onClick={handleCardClick}
                  className="mt-4 w-full bg-gradient-to-r from-[#ba2e2d] to-red-600 hover:from-red-600 hover:to-red-700 
                           text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg 
                           transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('featured.details')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PropertyMapModal