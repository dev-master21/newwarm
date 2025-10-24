import React, { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiHeart, 
  HiArrowRight,
  HiChevronLeft,
  HiChevronRight,
  HiMap,
  HiX
} from 'react-icons/hi'
import { IoBedOutline, IoExpand } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'
import LoadingSpinner from '../common/LoadingSpinner'
import PropertyMap from '../Property/PropertyMap'
import { mapService } from '../../services/map.service'
import { useShortlistStore } from '../../store/shortlistStore'
import toast from 'react-hot-toast'

const FeaturedVillas = () => {
  const { t, i18n } = useTranslation()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProperties()
  }, [i18n.language])

  const loadFeaturedProperties = async () => {
    try {
      setLoading(true)
      // Используем эндпоинт /properties/map который уже существует
      const response = await mapService.getPropertiesForMap()
      
      if (response && Array.isArray(response)) {
        // Берём только первые 6 объектов
        setProperties(response.slice(0, 6))
      }
    } catch (error) {
      console.error('Error loading featured properties:', error)
      toast.error(t('featured.loadError'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </section>
    )
  }

  if (!properties || properties.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('featured.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </motion.div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              index={index}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <motion.button
            onClick={() => window.location.href = '/villas'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#ba2e2d] to-red-600 
                     hover:from-red-600 hover:to-red-700 text-white font-semibold 
                     py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <span>{t('featured.viewAll')}</span>
            <HiArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

const PropertyCard = memo(({ property, index }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showMapModal, setShowMapModal] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { addItem, removeItem, isInShortlist } = useShortlistStore()

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
  }, [navigate, property.id])

  const handleMapClick = useCallback((e) => {
    e.stopPropagation()
    setShowMapModal(true)
  }, [])

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

  const formatPrice = (price) => {
    if (!price) return t('featured.priceOnRequest')
    return new Intl.NumberFormat('ru-RU').format(Math.round(price))
  }

  const guestsCount = property.bedrooms ? Math.round(property.bedrooms) * 2 : 0
  const hasCoordinates = property.coordinates && property.coordinates.lat && property.coordinates.lng

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        onClick={handleCardClick}
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 
                 hover:shadow-2xl transition-all cursor-pointer group"
      >
        {/* Image Carousel */}
        <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
          {hasPhotos ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={getThumbnailUrl(photos[currentPhotoIndex])}
                  alt={property.name}
                  className="w-full h-full object-cover"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </AnimatePresence>

              {photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-gray-800/90 
                             rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 
                             transition-opacity shadow-lg hover:bg-white dark:hover:bg-gray-700 z-10"
                  >
                    <HiChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-gray-800/90 
                             rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 
                             transition-opacity shadow-lg hover:bg-white dark:hover:bg-gray-700 z-10"
                  >
                    <HiChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                    {photos.slice(0, 5).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all ${
                          idx === currentPhotoIndex
                            ? 'w-8 bg-white'
                            : 'w-1.5 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Shortlist Button */}
              <button
                onClick={handleShortlistToggle}
                className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full 
                         flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 
                         transition-all shadow-lg z-10 group/heart"
              >
                <HiHeart className={`w-6 h-6 transition-all ${
                  isInShortlist(property.id)
                    ? 'text-red-500 fill-current scale-110'
                    : 'text-gray-600 dark:text-gray-300 group-hover/heart:text-red-500'
                }`} />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">{t('featured.noPhotos')}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1 
                       group-hover:text-[#ba2e2d] dark:group-hover:text-red-400 transition-colors">
            {property.name || t('featured.noName')}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Bedrooms */}
            {property.bedrooms && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <IoBedOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-500">{t('featured.bedrooms')}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(property.bedrooms)}</span>
                </div>
              </div>
            )}

            {/* Bathrooms */}
            {property.bathrooms && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <MdBathtub className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-500">{t('featured.bathrooms')}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(property.bathrooms)}</span>
                </div>
              </div>
            )}

            {/* Area */}
            {property.indoor_area && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <IoExpand className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-500">{t('featured.area')}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(property.indoor_area)} {t('common.sqm')}</span>
                </div>
              </div>
            )}

            {/* Guests */}
            {guestsCount > 0 && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FaUsers className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-500">{t('featured.guests')}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{guestsCount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-baseline space-x-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('featured.from')}</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#ba2e2d] to-red-600 bg-clip-text text-transparent">
                ฿{formatPrice(property.price_per_night)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ {t('featured.night')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleMapClick}
              disabled={!hasCoordinates}
              className="flex items-center justify-center space-x-1.5 bg-gray-100 dark:bg-gray-700 
                       hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300
                       font-medium py-2.5 px-3 rounded-lg transition-all text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100
                       dark:disabled:hover:bg-gray-700"
            >
              <HiMap className="w-4 h-4" />
              <span>{t('featured.map')}</span>
            </button>
            
            <button 
              className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-[#ba2e2d] to-red-600 
                       hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-3 rounded-lg 
                       transition-all text-sm shadow-md hover:shadow-lg"
            >
              <span>{t('featured.details')}</span>
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Map Modal - Центрированное на весь экран */}
      <AnimatePresence>
        {showMapModal && hasCoordinates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMapModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden 
                       w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#ba2e2d] to-red-600 p-5 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-white truncate pr-4">
                  {property.name}
                </h2>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
                >
                  <HiX className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {/* Map Container */}
              <div className="flex-1 overflow-hidden">
                <PropertyMap 
                  property={{
                    ...property,
                    latitude: property.coordinates.lat,
                    longitude: property.coordinates.lng,
                    name: property.name,
                  }} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.index === nextProps.index
  )
})

PropertyCard.displayName = 'PropertyCard'

export default FeaturedVillas