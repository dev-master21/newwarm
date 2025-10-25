import React, { useState, useEffect, useCallback, memo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
  HiMap,
  HiHeart,
  HiX,
  HiCalendar,
  HiMoon
} from 'react-icons/hi'
import { IoBedOutline, IoExpand } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'
import LoadingSpinner from '../components/common/LoadingSpinner'
import PropertyMap from '../components/Property/PropertyMap'
import { propertyService } from '../services/property.service'
import { useShortlistStore } from '../store/shortlistStore'
import toast from 'react-hot-toast'

const Villas = () => {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  // Получаем параметры поиска и форматируем даты правильно
  const checkInRaw = searchParams.get('checkIn')
  const checkOutRaw = searchParams.get('checkOut')
  
  // Преобразуем даты в формат YYYY-MM-DD если они в ISO формате
  const checkIn = checkInRaw ? new Date(checkInRaw).toISOString().split('T')[0] : null
  const checkOut = checkOutRaw ? new Date(checkOutRaw).toISOString().split('T')[0] : null
  
  const bedrooms = searchParams.get('bedrooms')
  const name = searchParams.get('name')

  // Рассчитываем количество ночей если есть даты
  const nights = checkIn && checkOut 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : null

  useEffect(() => {
    loadVillas()
  }, [searchParams, i18n.language])

  const loadVillas = async () => {
    try {
      setLoading(true)
      const params = {
        checkIn,
        checkOut,
        bedrooms,
        name,
        page: searchParams.get('page') || 1,
        limit: 12
      }

      console.log('Загрузка вилл с параметрами:', params)

      const response = await propertyService.getVillasForPage(params)
      
      if (response && response.data) {
        setProperties(response.data)
        setPagination(response.pagination || {})
      }
    } catch (error) {
      console.error('Error loading villas:', error)
      toast.error(t('villas.loadError'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#ba2e2d] to-red-600 shadow-xl">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('villas.title')}
            </h1>
            <p className="text-white/90 text-lg mb-6">
              {t('villas.subtitle')}
            </p>
            
            {/* Search Summary */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/90">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <HiSearch className="w-5 h-5" />
                <span className="font-semibold">
                  {pagination.total} {t('villas.propertiesFound')}
                </span>
              </div>
              
              {nights && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <HiCalendar className="w-5 h-5" />
                  <span>{nights} {getNightsText(nights, t)}</span>
                </div>
              )}
              
              {bedrooms && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <IoBedOutline className="w-5 h-5" />
                  <span>{bedrooms}+ {t('villas.bedrooms')}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="container mx-auto px-4 py-12">
        {properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <HiSearch className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('villas.noResults')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('villas.noResultsDescription')}
              </p>
              <button
                onClick={() => window.location.href = '/villas'}
                className="bg-gradient-to-r from-[#ba2e2d] to-red-600 hover:from-red-600 hover:to-red-700 
                         text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                {t('villas.showAllProperties')}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {properties.map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  index={index}
                  nights={nights}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Pagination pagination={pagination} searchParams={searchParams} setSearchParams={setSearchParams} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// PropertyCard Component (идентичный FeaturedVillas)
const PropertyCard = memo(({ property, index, nights }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showMapModal, setShowMapModal] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { addItem, removeItem, isInShortlist } = useShortlistStore()

  // Функция форматирования даты с использованием i18n
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1 // getMonth() возвращает 0-11, нам нужно 1-12
    const monthName = t(`months.short.${month}`)
    
    return `${date.getDate()} ${monthName}`
  }, [t])

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

  const formatNumber = (num) => {
    if (!num) return '0'
    return Math.round(num)
  }

  const guestsCount = property.bedrooms ? Math.round(property.bedrooms) * 2 : 0
  
  // Проверяем наличие координат - они теперь в property напрямую
  const hasCoordinates = property.coordinates 
    ? (property.coordinates.lat && property.coordinates.lng)
    : (property.latitude && property.longitude)
    
  const hasPeriodPrice = property.period_price && property.period_price.total

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
                alt={property.property_name || t('featured.noName')}
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
          
        {/* Map Button */}
        {hasCoordinates && (
          <button
            onClick={handleMapClick}
            className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 hover:bg-white backdrop-blur-sm 
                     rounded-lg flex items-center space-x-1 text-gray-700 hover:text-[#ba2e2d] 
                     transition-all z-20 shadow-lg text-sm font-medium"
          >
            <HiMap className="w-4 h-4" />
            <span>{t('featured.map')}</span>
          </button>
        )}
      </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-1">
            {property.property_name || t('featured.noName')}
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
            {hasPeriodPrice ? (
              // Если есть расчет за период
              <div className="space-y-3">
                {/* Период и количество ночей */}
                <div className="flex flex-col space-y-1.5 text-xs text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center space-x-1.5">
                    <HiCalendar className="w-4 h-4 text-blue-500" />
                    <span>
                      {formatDate(property.period_price.checkIn)} - {formatDate(property.period_price.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <HiMoon className="w-4 h-4 text-indigo-500" />
                    <span>{nights} {getNightsText(nights, t)}</span>
                  </div>
                </div>

                {/* Общая цена */}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('villas.totalFor')} {nights} {getNightsText(nights, t)}:
                  </span>
                  <span className="text-2xl font-bold text-[#ba2e2d]">
                    ฿{formatPrice(property.period_price.total)}
                  </span>
                </div>

                {/* Средняя цена за ночь */}
                <div className="flex items-baseline justify-between text-sm bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('villas.averagePerNight')}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ฿{formatPrice(property.period_price.average_per_night)}/{t('featured.night')}
                  </span>
                </div>
              </div>
            ) : (
              // Обычное отображение цены БЕЗ периода
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('featured.from')}
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#ba2e2d]">
                    ฿{formatPrice(property.min_price)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    /{t('featured.night')}
                  </span>
                </div>
              </div>
            )}
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

      {/* Map Modal - ТОЧНО КАК В FeaturedVillas */}
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
                  {property.property_name || property.name}
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
                    // Формируем правильную структуру для PropertyMap
                    latitude: property.coordinates?.lat || property.latitude,
                    longitude: property.coordinates?.lng || property.longitude,
                    name: property.property_name || property.name,
                  }} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

PropertyCard.displayName = 'PropertyCard'

// Pagination Component
const Pagination = ({ pagination, searchParams, setSearchParams }) => {
  const { t } = useTranslation()

  const handlePageChange = (newPage) => {
    const params = Object.fromEntries([...searchParams])
    params.page = newPage
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pages = []
  for (let i = 1; i <= pagination.pages; i++) {
    if (
      i === 1 ||
      i === pagination.pages ||
      (i >= pagination.page - 1 && i <= pagination.page + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => handlePageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
        className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 
                 disabled:cursor-not-allowed transition-all shadow-md"
      >
        <HiChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg transition-all shadow-md ${
              page === pagination.page
                ? 'bg-gradient-to-r from-[#ba2e2d] to-red-600 text-white font-semibold'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => handlePageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.pages}
        className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 
                 disabled:cursor-not-allowed transition-all shadow-md"
      >
        <HiChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

// Helper function for nights text with proper pluralization
const getNightsText = (nights, t) => {
  if (nights === 1) return t('villas.nights1')
  if (nights >= 2 && nights <= 4) return t('villas.nights2to4')
  return t('villas.nights')
}

export default Villas