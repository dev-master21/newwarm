// frontend/src/components/Map/PropertyMapModal.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiChevronLeft, HiChevronRight, HiCurrencyDollar, HiLocationMarker } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

const PropertyMapModal = ({ property, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  if (!property) return null

  const photos = property.photos || []
  const hasPhotos = photos.length > 0

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return '/placeholder-villa.jpg'
    if (photoUrl.startsWith('http')) return photoUrl
    return `${import.meta.env.VITE_API_URL}${photoUrl}`
  }

  const nextPhoto = (e) => {
    e.stopPropagation()
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    }
  }

  const prevPhoto = (e) => {
    e.stopPropagation()
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }

  const handleViewDetails = () => {
    navigate(`/properties/${property.id}`)
    onClose()
  }

  const formatPrice = (price) => {
    if (!price) return t('map.modal.priceOnRequest')
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center
                     bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full
                     hover:bg-white dark:hover:bg-gray-700 transition-all
                     shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95"
          >
            <HiX className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Photo Carousel */}
          <div className="relative h-80 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
            <AnimatePresence mode="wait">
              {hasPhotos ? (
                <motion.img
                  key={currentPhotoIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={getPhotoUrl(photos[currentPhotoIndex])}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <HiLocationMarker className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </AnimatePresence>

            {/* Navigation Arrows */}
            {hasPhotos && photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12
                           bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full
                           flex items-center justify-center shadow-lg
                           hover:bg-white dark:hover:bg-gray-700 transition-all
                           transform hover:scale-110 active:scale-95"
                >
                  <HiChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12
                           bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full
                           flex items-center justify-center shadow-lg
                           hover:bg-white dark:hover:bg-gray-700 transition-all
                           transform hover:scale-110 active:scale-95"
                >
                  <HiChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              </>
            )}

            {/* Photo Counter */}
            {hasPhotos && photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                           bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentPhotoIndex + 1} / {photos.length}
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {property.name}
              </h3>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <HiLocationMarker className="w-5 h-5 mr-2 text-red-600" />
                <span className="text-sm">{property.address || property.region}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-2">
              <div className="flex items-center space-x-2">
                <HiCurrencyDollar className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(property.price_per_night)}
                </span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                {t('map.modal.perNight')}
              </span>
            </div>

            {/* Property Type Badge */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 
                             text-white text-sm font-medium rounded-full">
                {t(`propertyTypes.${property.property_type}`)}
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 
                             text-white text-sm font-medium rounded-full">
                {t(`dealTypes.${property.deal_type}`)}
              </span>
            </div>

            {/* View Details Button */}
            <button
              onClick={handleViewDetails}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600
                       hover:from-red-700 hover:to-pink-700 text-white font-semibold
                       rounded-xl transition-all transform hover:scale-105 active:scale-95
                       shadow-lg hover:shadow-xl"
            >
              {t('map.modal.viewDetails')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PropertyMapModal