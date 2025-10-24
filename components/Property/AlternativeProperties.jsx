// frontend/src/components/Property/AlternativeProperties.jsx
import React, { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiHome, 
  HiLocationMarker, 
  HiSparkles,
  HiArrowRight,
  HiChevronLeft,
  HiChevronRight,
  HiCalendar,
  HiClock,
  HiX,
  HiMap,
  HiEye
} from 'react-icons/hi'
import { IoBedOutline, IoExpand } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import PropertyMap from './PropertyMap'
import { propertyService } from '../../services/property.service'
import toast from 'react-hot-toast'

const AlternativeProperties = ({ propertyId, startDate, endDate, nightsCount }) => {
  const { t, i18n } = useTranslation() // ДОБАВИЛИ i18n
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (startDate && endDate && nightsCount) {
      loadAlternatives()
    }
  }, [propertyId, startDate, endDate, nightsCount])

  const loadAlternatives = async () => {
    try {
      setLoading(true)
      
      const response = await propertyService.findAlternativeProperties(propertyId, {
        startDate,
        endDate,
        nightsCount
      })

      if (response.success && response.data?.properties) {
        const props = response.data.properties
        
        const propsWithSlots = await Promise.all(
          props.map(async (property) => {
            try {
              const slotsResponse = await propertyService.findAvailableSlots(property.id, {
                searchMode: 'period',
                startDate,
                endDate,
                nightsCount,
                limit: 10
              })
              
              if (slotsResponse.success && slotsResponse.data?.availableSlots?.length > 0) {
                const slots = slotsResponse.data.availableSlots
                
                return {
                  ...property,
                  availableSlots: slots,
                  firstSlot: slots[0],
                  hasMoreSlots: slots.length > 1
                }
              }
              return null
            } catch (err) {
              console.error(`❌ Error finding slots for #${property.id}:`, err)
              return null
            }
          })
        )
        
        const validProps = propsWithSlots.filter(p => p !== null)
        setProperties(validProps)
      } else {
        setProperties([])
      }
    } catch (error) {
      console.error('❌ Error loading alternatives:', error)
      setProperties([])
      toast.error(t('property.alternatives.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = useCallback((price) => {
    if (!price) return '0'
    return new Intl.NumberFormat('ru-RU').format(Math.round(price))
  }, [])

  const formatNumber = useCallback((num) => {
    if (!num) return '0'
    return Math.round(num)
  }, [])

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)

    // Используем текущий язык из i18n
    const locale = i18n.language || 'ru'

    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short'
    })
  }, [i18n.language])

  const getNightsText = useCallback((count) => {
    if (count === 1) return t('property.alternatives.night')
    if (count >= 2 && count <= 4) return t('property.alternatives.nights2to4')
    return t('property.alternatives.nights5plus')
  }, [t])

  const handleNavigate = useCallback((id) => {
    navigate(`/properties/${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 text-center border border-gray-200 dark:border-gray-700"
      >
        <HiHome className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('property.alternatives.noAlternatives')}
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          {t('property.alternatives.noAlternativesDescription', { 
            count: nightsCount, 
            nights: getNightsText(nightsCount) 
          })}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center space-x-2 md:space-x-3 mb-2">
          <HiSparkles className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {t('property.alternatives.title')}
          </h3>
          <span className="bg-blue-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
            {properties.length}
          </span>
        </div>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3">
          {t('property.alternatives.subtitle')}
        </p>
        {startDate && endDate && (
          <div className="inline-flex items-center flex-wrap gap-2 bg-blue-50 dark:bg-blue-900/20 
                       px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm border border-blue-200 dark:border-blue-800">
            <HiCalendar className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {t('property.alternatives.period')}:
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
            {nightsCount && (
              <>
                <span className="text-gray-400">•</span>
                <HiClock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {nightsCount} {getNightsText(nightsCount)}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {properties.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            index={index}
            nightsCount={nightsCount}
            onNavigate={handleNavigate}
            formatPrice={formatPrice}
            formatNumber={formatNumber}
            formatDate={formatDate}
            getNightsText={getNightsText}
          />
        ))}
      </div>
    </motion.div>
  )
}

const PropertyCard = memo(({ property, index, nightsCount, onNavigate, formatPrice, formatNumber, formatDate, getNightsText }) => {
  const { t } = useTranslation()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showMapModal, setShowMapModal] = useState(false)
  const [showSlotsModal, setShowSlotsModal] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

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

  const nextPhoto = useCallback((e) => {
    e?.stopPropagation()
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    }
  }, [hasPhotos, photos.length])

  const prevPhoto = useCallback((e) => {
    e?.stopPropagation()
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }, [hasPhotos, photos.length])

  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextPhoto()
    }
    if (isRightSwipe) {
      prevPhoto()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }, [touchStart, touchEnd, nextPhoto, prevPhoto])

  const handleCardClick = useCallback(() => {
    onNavigate(property.id)
  }, [onNavigate, property.id])

  const handleMapClick = useCallback((e) => {
    e.stopPropagation()
    if (property.latitude && property.longitude) {
      setShowMapModal(true)
    } else {
      toast.error(t('property.alternatives.locationUnavailable'))
    }
  }, [property.latitude, property.longitude, t])

  const handleSlotsClick = useCallback((e) => {
    e.stopPropagation()
    setShowSlotsModal(true)
  }, [])

  const currentPhoto = hasPhotos && photos[currentPhotoIndex]
    ? photos[currentPhotoIndex].photo_url 
    : null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        onClick={handleCardClick}
        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer 
                 shadow-md hover:shadow-2xl transition-all duration-300 group 
                 border border-gray-200 dark:border-gray-700
                 hover:border-blue-500 dark:hover:border-blue-500 w-full"
      >
        {/* Image with Carousel */}
        <div 
          className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-900"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={currentPhotoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={getThumbnailUrl(currentPhoto)}
              alt={property.property_name || t('property.alternatives.villa')}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              draggable={false}
              loading="lazy"
            />
          </AnimatePresence>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Carousel Controls */}
          {hasPhotos && photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 
                         text-white p-2 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100
                         items-center justify-center"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPhoto}
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 
                         text-white p-2 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100
                         items-center justify-center"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={prevPhoto}
                className="sm:hidden absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm
                         text-white p-1.5 rounded-full transition-all z-10 flex items-center justify-center"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="sm:hidden absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm
                         text-white p-1.5 rounded-full transition-all z-10 flex items-center justify-center"
              >
                <HiChevronRight className="w-4 h-4" />
              </button>
              
              {/* Photo Indicators - only on desktop */}
              <div className="hidden sm:flex absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 space-x-1 z-10 
                            max-w-[90%] overflow-x-auto scrollbar-hide px-2">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentPhotoIndex(idx)
                    }}
                    className={`rounded-full transition-all flex-shrink-0 ${
                      idx === currentPhotoIndex 
                        ? 'bg-white w-6 h-1.5' 
                        : 'bg-white/60 w-1.5 h-1.5 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Minimum Price Badge */}
          {property.min_price && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-blue-500 to-blue-600 
                          text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg z-10">
              {t('property.alternatives.from')} ฿{formatPrice(property.min_price)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2">
          <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2 
                       group-hover:text-blue-600 transition-colors leading-tight">
            {property.property_name || `${t('property.alternatives.villa')} ${property.property_number}`}
          </h4>

          <div className="flex items-center flex-wrap gap-2 text-sm">
            {property.bedrooms && (
              <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                <IoBedOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                  {formatNumber(property.bedrooms)}
                </span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                <MdBathtub className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                  {formatNumber(property.bathrooms)}
                </span>
              </div>
            )}
            {property.indoor_area && (
              <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                <IoExpand className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                  {formatNumber(property.indoor_area)} {t('property.alternatives.sqm')}
                </span>
              </div>
            )}
          </div>

          {property.firstSlot && (
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 
                            rounded-xl p-2.5 sm:p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                    <HiCalendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">
                      {formatDate(property.firstSlot.checkIn)} - {formatDate(property.firstSlot.checkOut)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {property.firstSlot.nights} {getNightsText(property.firstSlot.nights)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {t('property.alternatives.cost')}:
                  </span>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    ~฿{formatPrice(property.firstSlot.totalPrice)}
                  </span>
                </div>
              </div>

              {property.hasMoreSlots && (
                <button
                  onClick={handleSlotsClick}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-50 dark:bg-blue-900/20 
                           hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400
                           font-medium py-2 px-3 rounded-lg transition-all text-xs sm:text-sm
                           border border-blue-200 dark:border-blue-800"
                >
                  <HiEye className="w-4 h-4" />
                  <span>{t('property.alternatives.moreSlots', { count: property.availableSlots.length - 1 })}</span>
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              onClick={handleMapClick}
              disabled={!property.latitude || !property.longitude}
              className="flex items-center justify-center space-x-1 sm:space-x-1.5 bg-gray-100 dark:bg-gray-700 
                       hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300
                       font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all text-xs sm:text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100
                       dark:disabled:hover:bg-gray-700"
            >
              <HiMap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('property.alternatives.map')}</span>
            </button>
            
            <button 
              className="flex items-center justify-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-blue-500 to-blue-600 
                       hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg 
                       transition-all text-xs sm:text-sm shadow-md hover:shadow-lg"
            >
              <span>{t('property.alternatives.details')}</span>
              <HiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Slots Modal */}
      <AnimatePresence>
        {showSlotsModal && property.availableSlots && (
          <div 
            onClick={() => setShowSlotsModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[80vh] flex flex-col"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                  <HiCalendar className="w-5 h-5" />
                  <span>{t('property.alternatives.availableSlots', { count: property.availableSlots.length })}</span>
                </h2>
                <button
                  onClick={() => setShowSlotsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <HiX className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto">
                <div className="space-y-3">
                  {property.availableSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 
                               rounded-xl p-4 border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                          <HiCalendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="font-semibold">
                            {formatDate(slot.checkIn)} - {formatDate(slot.checkOut)}
                          </span>
                        </div>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 
                                     px-2 py-1 rounded-full whitespace-nowrap">
                          {slot.nights} {getNightsText(slot.nights)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('property.alternatives.periodCost')}:
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          ฿{formatPrice(slot.totalPrice)}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        ~฿{formatPrice(slot.pricePerNight)} {t('property.alternatives.perNight')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && property.latitude && property.longitude && (
          <div 
            onClick={() => setShowMapModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                  <HiLocationMarker className="w-5 h-5" />
                  <span>{t('property.alternatives.propertyLocation')}</span>
                </h2>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <HiX className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-0">
                <PropertyMap property={property} height="500px" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.index === nextProps.index &&
    prevProps.nightsCount === nextProps.nightsCount
  )
})

PropertyCard.displayName = 'PropertyCard'

export default AlternativeProperties